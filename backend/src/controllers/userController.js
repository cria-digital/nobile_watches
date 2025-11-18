const prisma = require("../config/prisma");

const buscarUsuarioLogado = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        state: true,
        city: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        // Não retorna a senha
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar dados do usuário." });
  }
};

module.exports = {
  buscarUsuarioLogado,
};
