const prisma = require("../config/prisma");

/**
 * ========================================
 * LISTAR ENDEREÇOS DO USUÁRIO
 * ========================================
 * GET /api/addresses
 */
const listarEnderecos = async (req, res) => {
  try {
    const userId = req.user.id;

    const enderecos = await prisma.address.findMany({
      where: {
        userId,
        isActive: true, // Apenas endereços ativos
      },
      orderBy: [
        { isDefault: "desc" }, // Padrão primeiro
        { createdAt: "desc" }, // Mais recentes depois
      ],
    });

    res.json({
      addresses: enderecos,
      count: enderecos.length,
    });
  } catch (err) {
    console.error("❌ Erro ao listar endereços:", err);
    res.status(500).json({
      error: "Erro ao listar endereços",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * BUSCAR ENDEREÇO ESPECÍFICO
 * ========================================
 * GET /api/addresses/:id
 */
const buscarEndereco = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const endereco = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        userId,
        isActive: true,
      },
    });

    if (!endereco) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }

    res.json(endereco);
  } catch (err) {
    console.error("❌ Erro ao buscar endereço:", err);
    res.status(500).json({
      error: "Erro ao buscar endereço",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * CRIAR NOVO ENDEREÇO
 * ========================================
 * POST /api/addresses
 */
const criarEndereco = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      label,
      recipientName,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault,
    } = req.body;

    // Validações
    if (
      !recipientName ||
      !street ||
      !number ||
      !neighborhood ||
      !city ||
      !state ||
      !zipCode ||
      !country
    ) {
      return res.status(400).json({
        error: "Campos obrigatórios faltando",
        required: [
          "recipientName",
          "street",
          "number",
          "neighborhood",
          "city",
          "state",
          "zipCode",
          "country",
        ],
      });
    }

    // Se marcar como padrão, remover padrão dos outros
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Criar endereço
    const novoEndereco = await prisma.address.create({
      data: {
        userId,
        label: label || null,
        recipientName,
        street,
        number,
        complement: complement || null,
        neighborhood,
        city,
        state,
        zipCode,
        country,
        phone: phone || null,
        isDefault: isDefault || false,
      },
    });

    console.log(`✅ Endereço criado: #${novoEndereco.id} para User #${userId}`);

    res.status(201).json({
      message: "Endereço criado com sucesso",
      address: novoEndereco,
    });
  } catch (err) {
    console.error("❌ Erro ao criar endereço:", err);
    res.status(500).json({
      error: "Erro ao criar endereço",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * ATUALIZAR ENDEREÇO
 * ========================================
 * PUT /api/addresses/:id
 */
const atualizarEndereco = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      label,
      recipientName,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault,
    } = req.body;

    // Verificar se o endereço pertence ao usuário
    const enderecoExistente = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        userId,
        isActive: true,
      },
    });

    if (!enderecoExistente) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }

    // Se marcar como padrão, remover padrão dos outros
    if (isDefault && !enderecoExistente.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Atualizar endereço
    const enderecoAtualizado = await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        label: label !== undefined ? label : enderecoExistente.label,
        recipientName: recipientName || enderecoExistente.recipientName,
        street: street || enderecoExistente.street,
        number: number || enderecoExistente.number,
        complement: complement !== undefined ? complement : enderecoExistente.complement,
        neighborhood: neighborhood || enderecoExistente.neighborhood,
        city: city || enderecoExistente.city,
        state: state || enderecoExistente.state,
        zipCode: zipCode || enderecoExistente.zipCode,
        country: country || enderecoExistente.country,
        phone: phone !== undefined ? phone : enderecoExistente.phone,
        isDefault: isDefault !== undefined ? isDefault : enderecoExistente.isDefault,
      },
    });

    console.log(`✅ Endereço atualizado: #${id}`);

    res.json({
      message: "Endereço atualizado com sucesso",
      address: enderecoAtualizado,
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar endereço:", err);
    res.status(500).json({
      error: "Erro ao atualizar endereço",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * DELETAR ENDEREÇO (SOFT DELETE)
 * ========================================
 * DELETE /api/addresses/:id
 */
const deletarEndereco = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar se o endereço pertence ao usuário
    const endereco = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        userId,
        isActive: true,
      },
    });

    if (!endereco) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }

    // Soft delete
    await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        isActive: false,
        isDefault: false, // Remover como padrão
      },
    });

    console.log(`✅ Endereço deletado (soft): #${id}`);

    res.json({
      message: "Endereço removido com sucesso",
    });
  } catch (err) {
    console.error("❌ Erro ao deletar endereço:", err);
    res.status(500).json({
      error: "Erro ao deletar endereço",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * ========================================
 * DEFINIR ENDEREÇO COMO PADRÃO
 * ========================================
 * PATCH /api/addresses/:id/set-default
 */
const definirComoPadrao = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verificar se o endereço pertence ao usuário
    const endereco = await prisma.address.findFirst({
      where: {
        id: parseInt(id),
        userId,
        isActive: true,
      },
    });

    if (!endereco) {
      return res.status(404).json({ error: "Endereço não encontrado" });
    }

    // Transação: remover padrão dos outros e definir este
    await prisma.$transaction([
      // Remover padrão de todos
      prisma.address.updateMany({
        where: {
          userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      // Definir este como padrão
      prisma.address.update({
        where: { id: parseInt(id) },
        data: {
          isDefault: true,
        },
      }),
    ]);

    console.log(`✅ Endereço #${id} definido como padrão`);

    res.json({
      message: "Endereço definido como padrão",
    });
  } catch (err) {
    console.error("❌ Erro ao definir endereço como padrão:", err);
    res.status(500).json({
      error: "Erro ao definir endereço como padrão",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

module.exports = {
  listarEnderecos,
  buscarEndereco,
  criarEndereco,
  atualizarEndereco,
  deletarEndereco,
  definirComoPadrao,
};
