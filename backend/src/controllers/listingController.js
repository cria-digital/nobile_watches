const prisma = require("../config/prisma");

/**
 * Criar um novo anúncio (rascunho ou publicado)
 * POST /api/listings
 */
const criarAnuncio = async (req, res) => {
  try {
    const {
      watchId,
      shippingInfo,
      returnPolicy,
      deliveryTime,
      negotiable,
      publishNow, // Se true, publica imediatamente; se false, fica como rascunho
    } = req.body;

    const sellerId = req.user.id;

    // Verifica se o relógio existe e pertence ao vendedor
    const watch = await prisma.watch.findUnique({
      where: { id: parseInt(watchId) },
    });

    if (!watch) {
      return res.status(404).json({ error: "Relógio não encontrado." });
    }

    if (watch.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para criar anúncio deste relógio.",
      });
    }

    // Verifica se já existe um anúncio ativo ou rascunho para este relógio
    const anuncioExistente = await prisma.listing.findFirst({
      where: {
        watchId: parseInt(watchId),
        status: { in: ["ACTIVE", "DRAFT"] },
      },
    });

    if (anuncioExistente) {
      return res.status(400).json({
        error: `Este relógio já possui um anúncio ${
          anuncioExistente.status === "ACTIVE" ? "ativo" : "em rascunho"
        }.`,
      });
    }

    const status = publishNow ? "ACTIVE" : "DRAFT";
    const publishedAt = publishNow ? new Date() : null;

    const novoAnuncio = await prisma.listing.create({
      data: {
        watchId: parseInt(watchId),
        sellerId,
        status,
        shippingInfo,
        returnPolicy,
        deliveryTime,
        negotiable: negotiable || false,
        publishedAt,
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
      message:
        status === "ACTIVE"
          ? "Anúncio publicado com sucesso!"
          : "Rascunho criado com sucesso!",
      listing: novoAnuncio,
    });
  } catch (err) {
    console.error("Erro ao criar anúncio:", err);
    res.status(500).json({ error: "Erro ao criar anúncio." });
  }
};

/**
 * Listar todos os anúncios do vendedor logado
 * GET /api/listings/my-listings
 */
const listarMeusAnuncios = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { status } = req.query; // Filtro opcional por status

    const where = { sellerId };

    // Se o status foi fornecido, adiciona ao filtro
    if (status) {
      where.status = status.toUpperCase();
    }

    const anuncios = await prisma.listing.findMany({
      where,
      include: {
        watch: {
          include: {
            seller: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        orders: {
          include: {
            buyer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(anuncios);
  } catch (err) {
    console.error("Erro ao listar anúncios:", err);
    res.status(500).json({ error: "Erro ao listar anúncios." });
  }
};

/**
 * Listar todos os anúncios ativos (público)
 * GET /api/listings/active
 */
const listarAnunciosAtivos = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [anuncios, total] = await Promise.all([
      prisma.listing.findMany({
        where: { status: "ACTIVE" },
        include: {
          watch: {
            include: {
              seller: {
                select: { id: true, name: true, email: true, isVerified: true },
              },
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { publishedAt: "desc" },
      }),
      prisma.listing.count({
        where: { status: "ACTIVE" },
      }),
    ]);

    res.json({
      listings: anuncios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Erro ao listar anúncios ativos:", err);
    res.status(500).json({ error: "Erro ao listar anúncios ativos." });
  }
};

/**
 * Buscar um anúncio por ID
 * GET /api/listings/:id
 */
const buscarAnuncioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        watch: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isVerified: true,
                city: true,
                state: true,
                country: true,
              },
            },
          },
        },
        orders: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    res.json(anuncio);
  } catch (err) {
    console.error("Erro ao buscar anúncio:", err);
    res.status(500).json({ error: "Erro ao buscar anúncio." });
  }
};

/**
 * Atualizar um anúncio
 * PUT /api/listings/:id
 */
const atualizarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingInfo, returnPolicy, deliveryTime, negotiable } = req.body;
    const sellerId = req.user.id;

    const anuncioExistente = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anuncioExistente) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncioExistente.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para atualizar este anúncio.",
      });
    }

    const anuncioAtualizado = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        shippingInfo,
        returnPolicy,
        deliveryTime,
        negotiable,
      },
      include: {
        watch: true,
      },
    });

    res.json({
      message: "Anúncio atualizado com sucesso!",
      listing: anuncioAtualizado,
    });
  } catch (err) {
    console.error("Erro ao atualizar anúncio:", err);
    res.status(500).json({ error: "Erro ao atualizar anúncio." });
  }
};

/**
 * Publicar um anúncio que estava em rascunho
 * PUT /api/listings/:id/publish
 */
const publicarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncio.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para publicar este anúncio.",
      });
    }

    if (anuncio.status !== "DRAFT") {
      return res.status(400).json({
        error: `Não é possível publicar um anúncio com status ${anuncio.status}.`,
      });
    }

    const anuncioPublicado = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        status: "ACTIVE",
        publishedAt: new Date(),
      },
      include: {
        watch: true,
      },
    });

    res.json({
      message: "Anúncio publicado com sucesso!",
      listing: anuncioPublicado,
    });
  } catch (err) {
    console.error("Erro ao publicar anúncio:", err);
    res.status(500).json({ error: "Erro ao publicar anúncio." });
  }
};

/**
 * Pausar um anúncio ativo
 * PUT /api/listings/:id/pause
 */
const pausarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncio.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para pausar este anúncio.",
      });
    }

    if (anuncio.status !== "ACTIVE") {
      return res.status(400).json({
        error: `Não é possível pausar um anúncio com status ${anuncio.status}.`,
      });
    }

    const anuncioPausado = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        status: "PAUSED",
      },
      include: {
        watch: true,
      },
    });

    res.json({
      message: "Anúncio pausado com sucesso!",
      listing: anuncioPausado,
    });
  } catch (err) {
    console.error("Erro ao pausar anúncio:", err);
    res.status(500).json({ error: "Erro ao pausar anúncio." });
  }
};

/**
 * Reativar um anúncio pausado
 * PUT /api/listings/:id/reactivate
 */
const reativarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncio.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para reativar este anúncio.",
      });
    }

    if (anuncio.status !== "PAUSED") {
      return res.status(400).json({
        error: `Não é possível reativar um anúncio com status ${anuncio.status}.`,
      });
    }

    const anuncioReativado = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        status: "ACTIVE",
      },
      include: {
        watch: true,
      },
    });

    res.json({
      message: "Anúncio reativado com sucesso!",
      listing: anuncioReativado,
    });
  } catch (err) {
    console.error("Erro ao reativar anúncio:", err);
    res.status(500).json({ error: "Erro ao reativar anúncio." });
  }
};

/**
 * Cancelar um anúncio
 * PUT /api/listings/:id/cancel
 */
const cancelarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncio.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para cancelar este anúncio.",
      });
    }

    if (anuncio.status === "SOLD") {
      return res.status(400).json({
        error: "Não é possível cancelar um anúncio que já foi vendido.",
      });
    }

    const anuncioCancelado = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        status: "CANCELLED",
      },
      include: {
        watch: true,
      },
    });

    res.json({
      message: "Anúncio cancelado com sucesso!",
      listing: anuncioCancelado,
    });
  } catch (err) {
    console.error("Erro ao cancelar anúncio:", err);
    res.status(500).json({ error: "Erro ao cancelar anúncio." });
  }
};

/**
 * Deletar um anúncio (apenas rascunhos ou cancelados)
 * DELETE /api/listings/:id
 */
const deletarAnuncio = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: true,
      },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncio.sellerId !== sellerId) {
      return res.status(403).json({
        error: "Você não tem permissão para deletar este anúncio.",
      });
    }

    // Só permite deletar rascunhos ou anúncios cancelados sem pedidos
    if (!["DRAFT", "CANCELLED"].includes(anuncio.status)) {
      return res.status(400).json({
        error: "Apenas anúncios em rascunho ou cancelados podem ser deletados.",
      });
    }

    if (anuncio.orders && anuncio.orders.length > 0) {
      return res.status(400).json({
        error: "Não é possível deletar um anúncio que possui pedidos vinculados.",
      });
    }

    await prisma.listing.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Anúncio deletado com sucesso." });
  } catch (err) {
    console.error("Erro ao deletar anúncio:", err);
    res.status(500).json({ error: "Erro ao deletar anúncio." });
  }
};

/**
 * Marcar anúncio como vendido (quando um pedido for completado)
 * PUT /api/listings/:id/mark-sold
 * Normalmente chamado internamente pelo sistema quando um pedido é finalizado
 */
const marcarComoVendido = async (req, res) => {
  try {
    const { id } = req.params;

    const anuncio = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
    });

    if (!anuncio) {
      return res.status(404).json({ error: "Anúncio não encontrado." });
    }

    if (anuncio.status === "SOLD") {
      return res.status(400).json({ error: "Este anúncio já foi vendido." });
    }

    const anuncioVendido = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        status: "SOLD",
        soldAt: new Date(),
      },
      include: {
        watch: true,
      },
    });

    res.json({
      message: "Anúncio marcado como vendido!",
      listing: anuncioVendido,
    });
  } catch (err) {
    console.error("Erro ao marcar anúncio como vendido:", err);
    res.status(500).json({ error: "Erro ao marcar anúncio como vendido." });
  }
};

module.exports = {
  criarAnuncio,
  listarMeusAnuncios,
  listarAnunciosAtivos,
  buscarAnuncioPorId,
  atualizarAnuncio,
  publicarAnuncio,
  pausarAnuncio,
  reativarAnuncio,
  cancelarAnuncio,
  deletarAnuncio,
  marcarComoVendido,
};
