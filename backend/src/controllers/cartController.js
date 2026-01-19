const prisma = require("../config/prisma");

/**
 * ========================================
 * ADICIONAR ITEM AO CARRINHO
 * ========================================
 * POST /api/cart/items
 */
const adicionarItemAoCarrinho = async (req, res) => {
  try {
    const { watchId, listingId } = req.body;
    const userId = req.user.id;

    // Validação
    if (!watchId) {
      return res.status(400).json({ error: "watchId é obrigatório." });
    }

    // Verificar se o relógio existe
    const watch = await prisma.watch.findUnique({
      where: { id: parseInt(watchId) },
      include: {
        seller: {
          select: { id: true, name: true },
        },
        // ✅ Incluir listings ATIVOS para buscar automaticamente
        listings: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (!watch) {
      return res.status(404).json({ error: "Relógio não encontrado." });
    }

    // Não permitir adicionar próprio relógio ao carrinho
    if (watch.sellerId === userId) {
      return res.status(400).json({
        error: "Você não pode adicionar seu próprio relógio ao carrinho.",
      });
    }

    // ✅ MELHORIA: Buscar listing automaticamente se não foi fornecido
    let finalListingId = listingId ? parseInt(listingId) : null;

    if (!finalListingId && watch.listings && watch.listings.length > 0) {
      // Se não foi fornecido listingId mas existe um listing ACTIVE, usar ele
      finalListingId = watch.listings[0].id;
      console.log(
        `✅ Listing ACTIVE encontrado automaticamente: Listing #${finalListingId}`
      );
    }

    // Buscar ou criar carrinho do usuário
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // Verificar se o item já está no carrinho
    const itemExistente = await prisma.cartItem.findUnique({
      where: {
        cartId_watchId: {
          cartId: cart.id,
          watchId: parseInt(watchId),
        },
      },
    });

    if (itemExistente) {
      return res.status(400).json({
        error: "Este relógio já está no seu carrinho.",
      });
    }

    // Adicionar item ao carrinho
    const novoItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        watchId: parseInt(watchId),
        listingId: finalListingId, // ✅ Agora preenchido automaticamente
        quantity: 1,
      },
      include: {
        watch: {
          include: {
            seller: {
              select: { id: true, name: true },
            },
          },
        },
        listing: true, // ✅ Incluir dados do listing na resposta
      },
    });

    console.log(
      `✅ Item adicionado ao carrinho: User #${userId}, Watch #${watchId}, Listing #${
        finalListingId || "N/A"
      }`
    );

    res.status(201).json({
      message: "Produto adicionado ao carrinho com sucesso.",
      cartItem: novoItem,
    });
  } catch (err) {
    console.error("❌ Erro ao adicionar item ao carrinho:", err);
    res.status(500).json({
      error: "Erro ao adicionar item ao carrinho.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * LISTAR ITENS DO CARRINHO
 * ========================================
 * GET /api/cart/items
 */
const listarItensDoCarrinho = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar carrinho com itens
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            watch: {
              include: {
                seller: {
                  select: {
                    id: true,
                    name: true,
                    isVerified: true,
                  },
                },
              },
            },
            listing: true, // ✅ Incluir dados do listing
          },
          orderBy: {
            addedAt: "desc", // Mais recentes primeiro
          },
        },
      },
    });

    // Se não houver carrinho, retornar array vazio
    if (!cart) {
      return res.json({ items: [] });
    }

    res.json({ items: cart.items });
  } catch (err) {
    console.error("❌ Erro ao listar itens do carrinho:", err);
    res.status(500).json({
      error: "Erro ao listar itens do carrinho.",
    });
  }
};

/**
 * ========================================
 * REMOVER ITEM DO CARRINHO
 * ========================================
 * DELETE /api/cart/items/:itemId
 */
const removerItemDoCarrinho = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;

    // Buscar o item
    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: {
        cart: {
          select: { userId: true },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado no carrinho." });
    }

    // Verificar se o item pertence ao usuário
    if (item.cart.userId !== userId) {
      return res.status(403).json({
        error: "Você não tem permissão para remover este item.",
      });
    }

    // Remover item
    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) },
    });

    console.log(`✅ Item removido do carrinho: CartItem #${itemId}`);

    res.json({ message: "Item removido do carrinho com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao remover item do carrinho:", err);
    res.status(500).json({
      error: "Erro ao remover item do carrinho.",
    });
  }
};

/**
 * ========================================
 * LIMPAR CARRINHO COMPLETO
 * ========================================
 * DELETE /api/cart
 */
const limparCarrinho = async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar carrinho
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return res.json({ message: "Carrinho já está vazio." });
    }

    // Deletar todos os itens do carrinho
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    console.log(`✅ Carrinho limpo: User #${userId}`);

    res.json({ message: "Carrinho limpo com sucesso." });
  } catch (err) {
    console.error("❌ Erro ao limpar carrinho:", err);
    res.status(500).json({
      error: "Erro ao limpar carrinho.",
    });
  }
};

/**
 * ========================================
 * OBTER CONTAGEM DE ITENS NO CARRINHO
 * ========================================
 * GET /api/cart/count
 */
const contarItensDoCarrinho = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    const count = cart?._count.items || 0;

    res.json({ count });
  } catch (err) {
    console.error("❌ Erro ao contar itens do carrinho:", err);
    res.status(500).json({
      error: "Erro ao contar itens do carrinho.",
    });
  }
};

module.exports = {
  adicionarItemAoCarrinho,
  listarItensDoCarrinho,
  removerItemDoCarrinho,
  limparCarrinho,
  contarItensDoCarrinho,
};
