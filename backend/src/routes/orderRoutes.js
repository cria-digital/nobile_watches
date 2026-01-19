const express = require("express");
const router = express.Router();

const {
  criarPedido,
  criarPedidoDoCarrinho,
  listarPedidosDoUsuario,
  atualizarStatusPedido,
  confirmarEntrega,
  realizarPayout,
} = require("../controllers/orderController");

const stripeController = require("../controllers/stripeController");
const authMiddleware = require("../middlewares/authMiddleware");

// ============================================
// TODAS AS ROTAS EXIGEM AUTENTICAÇÃO
// ============================================
router.use(authMiddleware);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Cria um novo pedido baseado em um anúncio (Listing)
 *     description: |
 *       Cria um pedido vinculado a um anúncio específico.
 *
 *       **Validações realizadas:**
 *       - Anúncio deve existir e estar ACTIVE
 *       - Usuário não pode comprar seu próprio anúncio
 *       - Não pode haver pedido pendente para o mesmo anúncio
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *             properties:
 *               listingId:
 *                 type: integer
 *                 description: ID do anúncio (Listing)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pedido:
 *                   type: object
 *       400:
 *         description: Validação falhou
 *       404:
 *         description: Anúncio não encontrado
 */
router.post("/", criarPedido);

router.post("/from-cart", criarPedidoDoCarrinho);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lista todos os pedidos do usuário logado
 *     description: Retorna todos os pedidos feitos pelo usuário, incluindo informações do anúncio e vendedor
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", listarPedidosDoUsuario);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Atualiza manualmente o status de um pedido
 *     description: |
 *       Permite que comprador ou vendedor atualizem o status do pedido.
 *
 *       **Status disponíveis:**
 *       - PENDING: Aguardando pagamento
 *       - PAID: Pagamento confirmado
 *       - SHIPPED: Enviado
 *       - DELIVERED: Entregue
 *       - CANCELLED: Cancelado
 *
 *       **Regras:**
 *       - Pedidos entregues não podem ser alterados
 *       - Pedidos cancelados não podem ser alterados
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPED, DELIVERED, CANCELLED]
 *                 example: "SHIPPED"
 *     responses:
 *       200:
 *         description: Status do pedido atualizado
 *       400:
 *         description: Status inválido ou transição não permitida
 *       403:
 *         description: Sem permissão para atualizar este pedido
 *       404:
 *         description: Pedido não encontrado
 */
router.put("/:id", atualizarStatusPedido);

/**
 * @swagger
 * /api/orders/{id}/confirm-delivery:
 *   put:
 *     summary: Confirma a entrega de um pedido (apenas comprador)
 *     description: Marca o pedido como DELIVERED. Apenas o comprador pode confirmar.
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Entrega confirmada com sucesso
 *       400:
 *         description: Pedido não está em status válido
 *       403:
 *         description: Apenas o comprador pode confirmar
 *       404:
 *         description: Pedido não encontrado
 */
router.put("/:id/confirm-delivery", confirmarEntrega);

/**
 * Checkout direto do carrinho (sem criar pedidos ainda)
 */
router.post("/checkout-cart", stripeController.criarCheckoutDoCarrinho);

/**
 * @swagger
 * /api/orders/checkout/{orderId}:
 *   post:
 *     summary: Cria uma sessão de pagamento no Stripe
 *     description: |
 *       Cria uma sessão de checkout do Stripe para processar o pagamento.
 *
 *       **Requisitos:**
 *       - Stripe deve estar configurado (STRIPE_SECRET_KEY)
 *       - Pedido deve estar em status PENDING
 *       - Anúncio deve estar ACTIVE
 *       - Usuário deve ser o comprador do pedido
 *
 *       **Retorna:**
 *       - URL para redirecionar o usuário ao checkout do Stripe
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: URL da sessão de pagamento retornada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkoutUrl:
 *                   type: string
 *                   description: URL para redirecionar ao Stripe
 *                 sessionId:
 *                   type: string
 *                   description: ID da sessão Stripe
 *       400:
 *         description: Pedido em status inválido ou anúncio indisponível
 *       403:
 *         description: Usuário não é o comprador
 *       404:
 *         description: Pedido ou anúncio não encontrado
 *       503:
 *         description: Stripe não configurado
 */
router.post("/checkout/:orderId", stripeController.criarCheckout);

/**
 * @swagger
 * /api/orders/verificar-pagamento:
 *   get:
 *     summary: Verifica se o pagamento foi concluído com sucesso
 *     description: |
 *       Consulta o Stripe para verificar o status do pagamento e atualiza o pedido.
 *
 *       **Após pagamento confirmado:**
 *       - Pedido é marcado como PAID
 *       - Listing é marcado como SOLD
 *       - Timestamp soldAt é registrado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da sessão Stripe (retornado pelo checkout)
 *         example: "cs_test_a1b2c3d4e5f6g7h8i9j0"
 *     responses:
 *       200:
 *         description: Pagamento confirmado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 pedido:
 *                   type: object
 *       400:
 *         description: Pagamento ainda não concluído
 *       404:
 *         description: Sessão não encontrada
 *       503:
 *         description: Stripe não configurado
 */
router.get("/verificar-pagamento", stripeController.verificarPagamento);

/**
 * @swagger
 * /api/orders/payout/{orderId}:
 *   post:
 *     summary: Realiza o payout para o vendedor
 *     description: |
 *       Registra a transferência de valor para o vendedor após o pagamento.
 *
 *       **Cálculo:**
 *       - Taxa do marketplace: 10%
 *       - Valor recebido pelo vendedor: 90%
 *
 *       **Requisitos:**
 *       - Pedido deve estar PAID ou DELIVERED
 *       - Não pode ter payout anterior
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Payout realizado e transação registrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 dados:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: integer
 *                     vendedor:
 *                       type: string
 *                     email:
 *                       type: string
 *                     valor_produto:
 *                       type: number
 *                     taxa_marketplace:
 *                       type: number
 *                     valor_recebido:
 *                       type: number
 *                     porcentagem_taxa:
 *                       type: string
 *       400:
 *         description: Pedido ainda não pago ou payout já realizado
 *       404:
 *         description: Pedido não encontrado
 */
router.post("/payout/:orderId", realizarPayout);

/**
 * @swagger
 * /api/orders/simular-pagamento/{orderId}:
 *   post:
 *     summary: 🧪 Simula um pagamento (APENAS DESENVOLVIMENTO)
 *     description: |
 *       **⚠️ ENDPOINT DE DESENVOLVIMENTO**
 *
 *       Marca um pedido como pago sem processar pagamento real.
 *       Útil para testar o fluxo completo sem configurar o Stripe.
 *
 *       **Este endpoint:**
 *       - Só funciona em NODE_ENV !== "production"
 *       - Marca Order como PAID
 *       - Marca Listing como SOLD
 *       - Não processa pagamento real
 *
 *       **⚠️ DEVE SER REMOVIDO EM PRODUÇÃO**
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pagamento simulado com sucesso
 *       400:
 *         description: Pedido não está em status PENDING
 *       403:
 *         description: Endpoint disponível apenas em desenvolvimento
 *       404:
 *         description: Pedido não encontrado
 */
if (process.env.NODE_ENV !== "production") {
  router.post("/simular-pagamento/:orderId", stripeController.simularPagamento);
}

module.exports = router;
