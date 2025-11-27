const prisma = require("../config/prisma");

/**
 * Adiciona um relógio à wishlist do usuário
 * POST /api/wishlist
 */
const adicionarRelogioNaWishlist = async (req, res) => {
  try {
    const { watchId } = req.body;
    const userId = req.user.id;

    // Verifica se o relógio existe
    const relogio = await prisma.watch.findUnique({
      where: { id: parseInt(watchId) },
    });

    if (!relogio) {
      return res.status(404).json({ error: "Relógio não encontrado." });
    }

    // Verifica se já está na wishlist (evita duplicatas)
    const jaExiste = await prisma.wishlist.findFirst({
      where: {
        userId,
        watchId: parseInt(watchId),
      },
    });

    if (jaExiste) {
      return res.status(400).json({ error: "Este relógio já está na sua wishlist." });
    }

    // Adiciona à wishlist
    const novaEntrada = await prisma.wishlist.create({
      data: {
        userId,
        watchId: parseInt(watchId),
      },
      include: {
        watch: {
          include: {
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Relógio adicionado à wishlist com sucesso.",
      wishlist: novaEntrada,
    });
  } catch (err) {
    console.error("Erro ao adicionar à wishlist:", err);
    res.status(500).json({ error: "Erro ao adicionar relógio na wishlist." });
  }
};

/**
 * Lista todos os relógios da wishlist do usuário
 * GET /api/wishlist
 */
const listarWishlistDoUsuario = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        watch: {
          include: {
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { addedAt: "desc" }, // Mais recentes primeiro
    });

    res.json(wishlist);
  } catch (err) {
    console.error("Erro ao listar wishlist:", err);
    res.status(500).json({ error: "Erro ao listar wishlist." });
  }
};

/**
 * Remove um relógio da wishlist
 * DELETE /api/wishlist/:watchId
 */
const removerRelogioDaWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchId = parseInt(req.params.watchId);

    // Verifica se o relógio está na wishlist do usuário
    const item = await prisma.wishlist.findFirst({
      where: {
        userId,
        watchId,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Relógio não encontrado na sua wishlist." });
    }

    // Remove da wishlist
    await prisma.wishlist.delete({
      where: { id: item.id },
    });

    res.json({ message: "Relógio removido da wishlist com sucesso." });
  } catch (err) {
    console.error("Erro ao remover da wishlist:", err);
    res.status(500).json({ error: "Erro ao remover relógio da wishlist." });
  }
};

/**
 * Verifica se um relógio específico está na wishlist do usuário
 * GET /api/wishlist/check/:watchId
 */
const verificarSeEstaNaWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchId = parseInt(req.params.watchId);

    const item = await prisma.wishlist.findFirst({
      where: {
        userId,
        watchId,
      },
    });

    res.json({
      isInWishlist: !!item,
      wishlistId: item?.id || null,
    });
  } catch (err) {
    console.error("Erro ao verificar wishlist:", err);
    res.status(500).json({ error: "Erro ao verificar wishlist." });
  }
};

module.exports = {
  adicionarRelogioNaWishlist,
  listarWishlistDoUsuario,
  removerRelogioDaWishlist,
  verificarSeEstaNaWishlist,
};
