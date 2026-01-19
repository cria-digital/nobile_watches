const prisma = require("../config/prisma");
const { marcarListingComoVendido } = require("./orderController");

// ========================================
// CONFIGURAÇÃO DO STRIPE
// ========================================
let stripe = null;
let STRIPE_CONFIGURED = false;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    STRIPE_CONFIGURED = true;
    console.log("✅ Stripe configurado com sucesso");
  } else {
    console.warn(
      "⚠️ STRIPE_SECRET_KEY não encontrada - modo de desenvolvimento sem pagamento"
    );
  }
} catch (err) {
  console.error("❌ Erro ao inicializar Stripe:", err.message);
}

/**
 * ========================================
 * CRIAR SESSÃO DE CHECKOUT
 * ========================================
 * POST /api/orders/checkout/:orderId
 *
 * Cria uma sessão de pagamento no Stripe para um pedido específico
 */
const criarCheckout = async (req, res) => {
  try {
    // ========================================
    // VALIDAÇÃO: Stripe configurado?
    // ========================================
    if (!STRIPE_CONFIGURED) {
      console.log("⚠️ Tentativa de checkout sem Stripe configurado");
      return res.status(503).json({
        error: "Sistema de pagamento não configurado.",
        message:
          "O Stripe ainda não foi configurado. Entre em contato com o administrador.",
        devNote:
          process.env.NODE_ENV === "development"
            ? "Configure STRIPE_SECRET_KEY no arquivo .env"
            : undefined,
      });
    }

    const { orderId } = req.params;
    const userId = req.user.id;

    // ========================================
    // BUSCAR PEDIDO E VALIDAR
    // ========================================
    const pedido = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        listing: {
          include: {
            watch: {
              select: {
                id: true,
                brand: true,
                model: true,
                price: true,
                images: true,
              },
            },
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Validações
    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (!pedido.listing) {
      return res.status(404).json({
        error: "Anúncio vinculado ao pedido não encontrado.",
      });
    }

    // Verifica se é o comprador
    if (pedido.buyerId !== userId) {
      return res.status(403).json({
        error: "Você não tem permissão para pagar este pedido.",
      });
    }

    // Verifica se o pedido está em status válido
    if (pedido.status !== "PENDING") {
      return res.status(400).json({
        error: `Este pedido não pode ser pago. Status atual: ${pedido.status}`,
      });
    }

    // Verifica se o Listing ainda está ativo
    if (pedido.listing.status !== "ACTIVE") {
      return res.status(400).json({
        error: `Este anúncio não está mais disponível. Status: ${pedido.listing.status}`,
      });
    }

    // ========================================
    // CRIAR SESSÃO NO STRIPE
    // ========================================
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const watch = pedido.listing.watch;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `${watch.brand} ${watch.model}`,
              description: pedido.listing.titleSuffix || "Relógio de luxo",
              images: watch.images?.slice(0, 1) || [], // Stripe aceita até 8 imagens
            },
            unit_amount: Math.round(watch.price * 100), // Converte para centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/account/purchases/${pedido.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/account/cart`,
      metadata: {
        orderId: pedido.id.toString(),
        listingId: pedido.listing.id.toString(),
        buyerId: pedido.buyerId.toString(),
        sellerId: pedido.listing.sellerId.toString(),
      },
      // Configurações adicionais
      payment_intent_data: {
        description: `Pedido #${pedido.id} - ${watch.brand} ${watch.model}`,
        metadata: {
          orderId: pedido.id.toString(),
        },
      },
      customer_email: req.user.email, // Email do comprador
    });

    console.log(`✅ Sessão Stripe criada: ${session.id} - Order #${pedido.id}`);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("❌ Erro ao criar checkout:", err);
    res.status(500).json({
      error: "Erro ao criar sessão de pagamento.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * CRIAR CHECKOUT DIRETO DO CARRINHO
 * ========================================
 * POST /api/orders/checkout-cart
 *
 * Cria sessão Stripe SEM criar pedidos
 * Pedidos só são criados quando pagamento for confirmado
 */
const criarCheckoutDoCarrinho = async (req, res) => {
  try {
    if (!STRIPE_CONFIGURED) {
      return res.status(503).json({
        error: "Sistema de pagamento não configurado.",
      });
    }

    const userId = req.user.id;
    const { itemIds, addressId } = req.body;

    // ✅ Validar endereço
    if (!addressId) {
      return res.status(400).json({
        error: "Endereço de entrega é obrigatório",
      });
    }

    // ✅ Buscar e validar endereço
    const address = await prisma.address.findFirst({
      where: {
        id: parseInt(addressId),
        userId: userId,
        isActive: true,
      },
    });

    if (!address) {
      return res.status(404).json({
        error: "Endereço não encontrado ou não pertence ao usuário",
      });
    }

    // Buscar itens do carrinho
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          where: itemIds ? { id: { in: itemIds.map(id => parseInt(id)) } } : undefined,
          include: {
            watch: true,
            listing: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio" });
    }

    // Validar que todos os itens têm listing ativo
    for (const item of cart.items) {
      let listing = item.listing;

      if (!listing || listing.status !== "ACTIVE") {
        // Buscar listing ativo
        listing = await prisma.listing.findFirst({
          where: { watchId: item.watchId, status: "ACTIVE" },
        });
      }

      if (!listing) {
        return res.status(400).json({
          error: `O produto ${item.watch.brand} ${item.watch.model} não está mais disponível.`,
        });
      }

      // Verificar se já existe pedido PAID/PENDING para este listing
      const pedidoExistente = await prisma.order.findFirst({
        where: {
          listingId: listing.id,
          status: { in: ["PENDING", "PAID"] },
        },
      });

      if (pedidoExistente) {
        return res.status(400).json({
          error: `O produto ${item.watch.brand} ${item.watch.model} já está em processo de compra.`,
        });
      }
    }

    // Preparar line_items para o Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: `${item.watch.brand} ${item.watch.model}`,
          description: item.listing?.titleSuffix || "Relógio de luxo",
          images: item.watch.images?.slice(0, 1) || [],
        },
        unit_amount: Math.round(item.watch.price * 100), // Centavos
      },
      quantity: 1,
    }));

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // Criar sessão Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${frontendUrl}/account/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/account/cart`,
      metadata: {
        userId: userId.toString(),
        cartItemIds: cart.items.map(i => i.id).join(","),
        watchIds: cart.items.map(i => i.watchId).join(","),
        listingIds: cart.items.map(i => i.listing?.id || "").join(","),
        addressId: addressId.toString(),
      },
      customer_email: req.user.email,
    });

    console.log(`✅ Sessão Stripe criada do carrinho: ${session.id}`);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("❌ Erro ao criar checkout do carrinho:", err);
    res.status(500).json({
      error: "Erro ao criar sessão de pagamento.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * VERIFICAR PAGAMENTO E CRIAR PEDIDOS
 * ========================================
 * GET /api/orders/verificar-pagamento?sessionId=xxx
 */
const verificarPagamento = async (req, res) => {
  try {
    if (!STRIPE_CONFIGURED) {
      return res.status(503).json({
        error: "Sistema de pagamento não configurado.",
      });
    }

    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID não fornecido.",
      });
    }

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.status(404).json({
        error: "Sessão de pagamento não encontrada.",
      });
    }

    // Verificar se pagamento foi concluído
    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Pagamento ainda não foi concluído.",
        status: session.payment_status,
      });
    }

    // ========================================
    // ✅ VERIFICAR SE JÁ EXISTEM ORDERS PARA ESTE SESSION_ID
    // ========================================
    const ordersExistentes = await prisma.order.findMany({
      where: {
        paymentInfo: {
          contains: sessionId, // Busca no JSON
        },
      },
      include: {
        listing: {
          include: {
            watch: true,
            seller: true,
          },
        },
      },
    });

    // Se já existem orders, retornar elas ao invés de criar novas
    if (ordersExistentes.length > 0) {
      console.log(
        `♻️  Orders já existem para session ${sessionId}, retornando existentes`
      );

      return res.json({
        success: true,
        message: "Pagamento já foi processado anteriormente.",
        orders: ordersExistentes,
      });
    }

    // ✅ Extrair dados dos metadados
    const { userId, cartItemIds, watchIds, listingIds, addressId } = session.metadata;

    if (!userId || !watchIds || !listingIds) {
      return res.status(400).json({
        success: false,
        error: "Metadados da sessão estão incompletos.",
      });
    }

    // ✅ Buscar endereço completo
    let shippingInfo = null;
    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: parseInt(addressId) },
      });

      if (address) {
        shippingInfo = JSON.stringify({
          addressId: address.id,
          recipientName: address.recipientName,
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: address.phone,
        });
      }
    }

    const watchIdArray = watchIds.split(",").map(id => parseInt(id));
    const listingIdArray = listingIds.split(",").map(id => parseInt(id));

    // Criar todos os pedidos em uma transação
    const orders = await prisma.$transaction(
      watchIdArray.map((watchId, index) => {
        const listingId = listingIdArray[index];

        return prisma.order.create({
          data: {
            buyerId: parseInt(userId),
            watchId: watchId,
            listingId: listingId,
            status: "PAID",
            paymentInfo: JSON.stringify({
              sessionId: session.id,
              paymentIntentId: session.payment_intent,
              paidAt: new Date().toISOString(),
            }),
            shippingInfo: shippingInfo,
          },
          include: {
            listing: {
              include: {
                watch: true,
                seller: true,
              },
            },
          },
        });
      })
    );

    // Marcar listings como vendidos
    await prisma.$transaction(
      listingIdArray.map(listingId =>
        prisma.listing.update({
          where: { id: listingId },
          data: {
            status: "SOLD",
            soldAt: new Date(),
          },
        })
      )
    );

    // Remover itens do carrinho
    if (cartItemIds) {
      const itemIdArray = cartItemIds.split(",").map(id => parseInt(id));
      await prisma.cartItem.deleteMany({
        where: {
          id: { in: itemIdArray },
        },
      });
    }

    console.log(
      `✅ Pagamento confirmado e ${orders.length} pedido(s) criado(s) - Session: ${sessionId}`
    );

    return res.json({
      success: true,
      message: "Pagamento confirmado e pedidos criados.",
      orders: orders,
    });
  } catch (err) {
    console.error("❌ Erro ao verificar pagamento:", err);
    return res.status(500).json({
      success: false,
      error: "Erro interno ao verificar pagamento.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * WEBHOOK DO STRIPE (DESABILITADO)
 * ========================================
 * Recebe eventos do Stripe automaticamente
 *
 * ⚠️ Para ativar:
 * 1. Configure STRIPE_WEBHOOK_SECRET no .env
 * 2. Descomente o código abaixo
 * 3. Adicione a rota no orderRoutes.js
 */
/*
const webhookStripe = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Erro ao verificar assinatura do webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processa evento
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = parseInt(session.metadata.orderId);
    const listingId = parseInt(session.metadata.listingId);

    try {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { status: "PAID" },
        }),
        prisma.listing.update({
          where: { id: listingId },
          data: {
            status: "SOLD",
            soldAt: new Date(),
          },
        }),
      ]);

      console.log(`✅ Webhook: Pedido ${orderId} marcado como pago via webhook`);
    } catch (err) {
      console.error("❌ Erro ao processar webhook:", err.message);
    }
  }

  res.status(200).json({ received: true });
};
*/

/**
 * ========================================
 * MODO DE DESENVOLVIMENTO SEM STRIPE
 * ========================================
 * Simula pagamento para testes
 *
 * ⚠️ APENAS PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
 */
const simularPagamento = async (req, res) => {
  // Só funciona em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      error: "Endpoint disponível apenas em desenvolvimento.",
    });
  }

  try {
    const { orderId } = req.params;

    const pedido = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        listing: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (pedido.status !== "PENDING") {
      return res.status(400).json({
        error: `Pedido não pode ser simulado. Status: ${pedido.status}`,
      });
    }

    // Atualiza pedido e listing
    const [pedidoAtualizado] = await prisma.$transaction([
      prisma.order.update({
        where: { id: parseInt(orderId) },
        data: {
          status: "PAID",
          paymentInfo: JSON.stringify({
            simulado: true,
            paidAt: new Date().toISOString(),
          }),
        },
        include: {
          listing: {
            include: {
              watch: true,
            },
          },
        },
      }),
      prisma.listing.update({
        where: { id: pedido.listingId },
        data: {
          status: "SOLD",
          soldAt: new Date(),
        },
      }),
    ]);

    console.log(`🧪 Pagamento simulado: Order #${orderId}`);

    return res.json({
      success: true,
      message: "Pagamento simulado com sucesso! (Apenas desenvolvimento)",
      pedido: pedidoAtualizado,
    });
  } catch (err) {
    console.error("❌ Erro ao simular pagamento:", err);
    return res.status(500).json({
      error: "Erro ao simular pagamento.",
    });
  }
};

module.exports = {
  criarCheckout,
  criarCheckoutDoCarrinho,
  verificarPagamento,
  simularPagamento, // ✅ Função temporária para desenvolvimento
  // webhookStripe, // Descomente quando configurar webhook
};
