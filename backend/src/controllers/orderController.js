const prisma = require("../config/prisma");

const criarPedido = async (req, res) => {
  try {
    const { listingId } = req.body;
    const buyerId = req.user.id;

    // ========================================
    // VALIDAÇÕES
    // ========================================

    if (!listingId) {
      return res.status(400).json({
        error: "O ID do anúncio é obrigatório.",
      });
    }

    // Busca o Listing com todas as informações necessárias
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(listingId) },
      include: {
        watch: {
          select: {
            id: true,
            brand: true,
            model: true,
            price: true,
            images: true,
            sellerId: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            isVerified: true,
          },
        },
      },
    });

    // Valida se o Listing existe
    if (!listing) {
      return res.status(404).json({
        error: "Anúncio não encontrado.",
      });
    }

    // Valida se o Listing está ativo
    if (listing.status !== "ACTIVE") {
      return res.status(400).json({
        error: `Este anúncio não está disponível. Status: ${listing.status}`,
        currentStatus: listing.status,
      });
    }

    // Valida se não é o próprio vendedor comprando
    if (listing.sellerId === buyerId) {
      return res.status(400).json({
        error: "Você não pode comprar seu próprio anúncio.",
      });
    }

    // Valida se o vendedor está verificado (opcional, mas recomendado)
    if (!listing.seller.isVerified) {
      console.warn(`⚠️ Compra de vendedor não verificado: ${listing.seller.email}`);
      // Você pode bloquear ou apenas avisar
      // return res.status(400).json({
      //   error: "Este vendedor ainda não foi verificado."
      // });
    }

    // Verifica se já existe um pedido pendente para este Listing
    const pedidoExistente = await prisma.order.findFirst({
      where: {
        listingId: parseInt(listingId),
        status: { in: ["PENDING", "PAID"] },
      },
    });

    if (pedidoExistente) {
      return res.status(400).json({
        error: "Já existe um pedido em andamento para este anúncio.",
        orderId: pedidoExistente.id,
      });
    }

    // ========================================
    // CRIAR PEDIDO
    // ========================================

    const novoPedido = await prisma.order.create({
      data: {
        buyerId,
        watchId: listing.watchId,
        listingId: listing.id,
        status: "PENDING", // Aguardando pagamento
        paymentInfo: null,
        shippingInfo: null,
      },
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

    console.log(`✅ Pedido criado: Order #${novoPedido.id} - Listing #${listing.id}`);

    res.status(201).json({
      message: "Pedido criado com sucesso!",
      pedido: novoPedido,
    });
  } catch (err) {
    console.error("❌ Erro ao criar pedido:", err);
    res.status(500).json({
      error: "Erro ao criar pedido.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * Cria um pedido a partir dos itens do carrinho
 * POST /api/orders/from-cart
 */
const criarPedidoDoCarrinho = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemIds } = req.body; // Array de IDs dos CartItems

    // Buscar carrinho com itens
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
      return res.status(400).json({ error: "Carrinho vazio ou itens não encontrados." });
    }

    // ========================================
    // 🔥 NOVA LÓGICA: Verificar ou reutilizar pedidos PENDING
    // ========================================
    const orders = await Promise.all(
      cart.items.map(async item => {
        // Buscar listing ACTIVE se não houver
        let listingId = item.listingId;
        if (!listingId) {
          const activeListing = await prisma.listing.findFirst({
            where: { watchId: item.watchId, status: "ACTIVE" },
          });
          listingId = activeListing?.id;
        }

        if (!listingId) {
          throw new Error(
            `Nenhum anúncio ativo encontrado para o relógio ${item.watch.brand} ${item.watch.model}`
          );
        }

        // ✅ VERIFICAR SE JÁ EXISTE PEDIDO PENDING PARA ESTE LISTING
        const pedidoExistente = await prisma.order.findFirst({
          where: {
            buyerId: userId,
            listingId: listingId,
            status: "PENDING",
          },
          include: {
            watch: true,
            listing: {
              include: {
                seller: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });

        // Se já existe um pedido PENDING, reutilizar ao invés de criar novo
        if (pedidoExistente) {
          console.log(
            `♻️  Reutilizando pedido PENDING existente: Order #${pedidoExistente.id}`
          );
          return pedidoExistente;
        }

        // Se não existe, criar novo pedido
        const novoPedido = await prisma.order.create({
          data: {
            buyerId: userId,
            watchId: item.watchId,
            listingId,
            status: "PENDING",
          },
          include: {
            watch: true,
            listing: {
              include: {
                seller: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });

        console.log(
          `✅ Novo pedido criado: Order #${novoPedido.id} - Listing #${listingId}`
        );
        return novoPedido;
      })
    );

    // ========================================
    // REMOVER ITENS DO CARRINHO
    // ========================================
    // Só remover os itens APÓS garantir que os pedidos foram criados/encontrados
    await prisma.cartItem.deleteMany({
      where: {
        id: { in: cart.items.map(item => item.id) },
      },
    });

    res.status(201).json({
      message: "Pedidos criados com sucesso",
      orders,
    });
  } catch (err) {
    console.error("❌ Erro ao criar pedidos:", err);
    res.status(500).json({
      error: "Erro ao criar pedidos",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * LISTAR PEDIDOS DO USUÁRIO
 * ========================================
 * GET /api/orders
 */
const listarPedidosDoUsuario = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const pedidos = await prisma.order.findMany({
      where: { buyerId },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(pedidos);
  } catch (err) {
    console.error("❌ Erro ao listar pedidos:", err);
    res.status(500).json({
      error: "Erro ao listar pedidos.",
    });
  }
};

/**
 * ========================================
 * ATUALIZAR STATUS DO PEDIDO
 * ========================================
 * PUT /api/orders/:id
 * Body: { status }
 *
 * Status permitidos:
 * - PENDING: Aguardando pagamento
 * - PAID: Pagamento confirmado
 * - SHIPPED: Enviado
 * - DELIVERED: Entregue
 * - CANCELLED: Cancelado
 */
const atualizarStatusPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const statusPermitidos = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

    // Valida status
    if (!status || !statusPermitidos.includes(status.toUpperCase())) {
      return res.status(400).json({
        error: `Status inválido. Use: ${statusPermitidos.join(", ")}`,
      });
    }

    // Busca o pedido
    const pedido = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        listing: {
          select: {
            id: true,
            sellerId: true,
            status: true,
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    // Verifica permissão (comprador ou vendedor)
    const isComprador = pedido.buyerId === userId;
    const isVendedor = pedido.listing?.sellerId === userId;

    if (!isComprador && !isVendedor) {
      return res.status(403).json({
        error: "Você não tem permissão para atualizar este pedido.",
      });
    }

    // Lógica de transição de status
    const statusAtual = pedido.status;
    const novoStatus = status.toUpperCase();

    // Validações de transição
    if (statusAtual === "DELIVERED" && novoStatus !== "DELIVERED") {
      return res.status(400).json({
        error: "Não é possível alterar status de pedido já entregue.",
      });
    }

    if (statusAtual === "CANCELLED") {
      return res.status(400).json({
        error: "Não é possível alterar status de pedido cancelado.",
      });
    }

    // Atualiza pedido
    const pedidoAtualizado = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status: novoStatus },
      include: {
        listing: {
          include: {
            watch: true,
          },
        },
      },
    });

    console.log(`✅ Status atualizado: Order #${id} - ${statusAtual} → ${novoStatus}`);

    res.json({
      message: "Status do pedido atualizado com sucesso!",
      pedido: pedidoAtualizado,
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar pedido:", err);
    res.status(500).json({
      error: "Erro ao atualizar status do pedido.",
    });
  }
};

/**
 * ========================================
 * CONFIRMAR ENTREGA
 * ========================================
 * PUT /api/orders/:id/confirm-delivery
 * Apenas o comprador pode confirmar
 */
const confirmarEntrega = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const userId = req.user.id;

    const pedido = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          select: {
            id: true,
            sellerId: true,
          },
        },
      },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    // Apenas o comprador pode confirmar entrega
    if (pedido.buyerId !== userId) {
      return res.status(403).json({
        error: "Apenas o comprador pode confirmar a entrega.",
      });
    }

    if (pedido.status !== "PAID" && pedido.status !== "SHIPPED") {
      return res.status(400).json({
        error: `Não é possível confirmar entrega. Status atual: ${pedido.status}`,
      });
    }

    const atualizado = await prisma.order.update({
      where: { id: orderId },
      data: { status: "DELIVERED" },
      include: {
        listing: {
          include: {
            watch: true,
          },
        },
      },
    });

    console.log(`✅ Entrega confirmada: Order #${orderId}`);

    return res.json({
      success: true,
      message: "Entrega confirmada com sucesso.",
      pedido: atualizado,
    });
  } catch (err) {
    console.error("❌ Erro ao confirmar entrega:", err.message);
    return res.status(500).json({
      error: "Erro ao confirmar entrega.",
    });
  }
};

/**
 * ========================================
 * REALIZAR PAYOUT
 * ========================================
 * POST /api/orders/payout/:orderId
 * Transfere o valor para o vendedor
 *
 * ⚠️ EM PRODUÇÃO: Integrar com API de pagamento real
 */
const realizarPayout = async (req, res) => {
  try {
    const { orderId } = req.params;

    const pedido = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        listing: {
          include: {
            watch: {
              select: {
                price: true,
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

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (!pedido.listing) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (pedido.status !== "PAID" && pedido.status !== "DELIVERED") {
      return res.status(400).json({
        error: `Pedido ainda não foi pago. Status: ${pedido.status}`,
      });
    }

    // Verifica se já foi feito payout
    const payoutExistente = await prisma.transaction.findFirst({
      where: {
        orderId: pedido.id,
        type: "PAYOUT",
      },
    });

    if (payoutExistente) {
      return res.status(400).json({
        error: "Payout já foi realizado para este pedido.",
        transactionId: payoutExistente.id,
      });
    }

    // Cálculo do payout
    const valorPago = pedido.listing.watch.price;
    const taxaMarketplace = 0.1; // 10%
    const valorComissao = valorPago * taxaMarketplace;
    const valorRecebido = valorPago - valorComissao;

    // Registra transação
    const transaction = await prisma.transaction.create({
      data: {
        orderId: pedido.id,
        type: "PAYOUT",
        amount: Math.round(valorRecebido * 100), // Em centavos
      },
    });

    console.log(
      `✅ Payout realizado: Order #${pedido.id} - R$ ${valorRecebido.toFixed(2)}`
    );
    console.log(
      `   Vendedor: ${pedido.listing.seller.name} (${pedido.listing.seller.email})`
    );

    return res.json({
      success: true,
      message: "Payout realizado com sucesso.",
      dados: {
        transactionId: transaction.id,
        vendedor: pedido.listing.seller.name,
        email: pedido.listing.seller.email,
        valor_produto: valorPago,
        taxa_marketplace: valorComissao,
        valor_recebido: valorRecebido,
        porcentagem_taxa: `${(taxaMarketplace * 100).toFixed(0)}%`,
      },
    });
  } catch (err) {
    console.error("❌ Erro no payout:", err.message);
    return res.status(500).json({
      error: "Erro ao realizar o payout.",
    });
  }
};

/**
 * ========================================
 * MARCAR LISTING COMO VENDIDO
 * ========================================
 * Função interna chamada após pagamento confirmado
 */
const marcarListingComoVendido = async listingId => {
  try {
    await prisma.listing.update({
      where: { id: parseInt(listingId) },
      data: {
        status: "SOLD",
        soldAt: new Date(),
      },
    });
    console.log(`✅ Listing #${listingId} marcado como SOLD`);
  } catch (err) {
    console.error(`❌ Erro ao marcar Listing #${listingId} como vendido:`, err);
    throw err;
  }
};

module.exports = {
  criarPedido,
  criarPedidoDoCarrinho,
  listarPedidosDoUsuario,
  atualizarStatusPedido,
  confirmarEntrega,
  realizarPayout,
  marcarListingComoVendido,
};
