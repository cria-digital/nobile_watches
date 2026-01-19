const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// ========================================
// CONFIGURAÇÃO
// ========================================

let enviarEmailFunc;

if (process.env.NODE_ENV === "production") {
  // 🚀 PRODUÇÃO - SendGrid
  console.log("📧 Configurando SendGrid para envio de emails...");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  enviarEmailFunc = async opcoes => {
    try {
      const msg = {
        to: opcoes.para,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || "noreply@seudominio.com",
          name: "Nobile",
        },
        subject: opcoes.assunto,
        text: opcoes.texto,
        html: opcoes.html,
      };

      const response = await sgMail.send(msg);
      console.log("✅ Email enviado via SendGrid para:", opcoes.para);
      return { success: true, messageId: response[0].headers["x-message-id"] };
    } catch (error) {
      console.error("❌ Erro SendGrid:", error.response?.body || error.message);
      return { success: false, error: error.message };
    }
  };

  console.log("✅ SendGrid configurado com sucesso!");
} else {
  // 🧪 DESENVOLVIMENTO - Ethereal
  let transporter;

  nodemailer.createTestAccount((err, account) => {
    if (err) {
      console.error("❌ Erro ao criar conta de teste:", err);
      return;
    }

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });

    console.log("📧 Email de teste configurado (Ethereal)");
    console.log("   User:", account.user);
    console.log("   Pass:", account.pass);
  });

  enviarEmailFunc = async opcoes => {
    if (!transporter) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const info = await transporter.sendMail({
        from: '"Nobile" <noreply@nobile.com>',
        to: opcoes.para,
        subject: opcoes.assunto,
        text: opcoes.texto,
        html: opcoes.html,
      });

      console.log("✅ Email enviado:", info.messageId);
      console.log("🔗 Visualizar:", nodemailer.getTestMessageUrl(info));
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("❌ Erro ao enviar email:", error);
      return { success: false, error: error.message };
    }
  };
}

const enviarEmail = async opcoes => {
  if (!enviarEmailFunc) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return enviarEmailFunc(opcoes);
};

// ========================================
// TEMPLATES
// ========================================

const templates = {
  recuperacaoSenha: (nome, token, expiresIn = "1 hora") => {
    return {
      assunto: "Recuperação de Senha - Nobile",
      texto: `
Olá ${nome},

Você solicitou a recuperação de senha da sua conta Nobile.

Seu código de verificação é: ${token}

Este código expira em ${expiresIn}.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Nobile
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recuperação de Senha</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .code-box { background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
    .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace; }
    .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 Recuperação de Senha</h1></div>
    <div class="content">
      <p>Olá <strong>${nome}</strong>,</p>
      <p>Você solicitou a recuperação de senha da sua conta <strong>Nobile</strong>.</p>
      <p>Use o código abaixo para redefinir sua senha:</p>
      <div class="code-box"><div class="code">${token}</div></div>
      <div class="warning"><strong>⚠️ Atenção:</strong> Este código expira em <strong>${expiresIn}</strong>.</div>
      <p>Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá inalterada.</p>
      <p>Atenciosamente,<br><strong>Equipe Nobile</strong></p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Nobile - Marketplace de Relógios de Luxo</p>
      <p>Este é um email automático, por favor não responda.</p>
    </div>
  </div>
</body>
</html>
      `,
    };
  },

  senhaAlteradaComSucesso: nome => ({
    assunto: "Senha Alterada com Sucesso - Nobile",
    texto: `
Olá ${nome},

Sua senha foi alterada com sucesso!

Se você não fez esta alteração, entre em contato conosco imediatamente.

Atenciosamente,
Equipe Nobile
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>✅ Senha Alterada</h1></div>
    <div class="content">
      <div class="success-icon">🎉</div>
      <p>Olá <strong>${nome}</strong>,</p>
      <p>Sua senha foi alterada com sucesso!</p>
      <p>Você já pode fazer login com sua nova senha.</p>
      <div class="warning"><strong>⚠️ Atenção:</strong> Se você não fez esta alteração, entre em contato conosco imediatamente.</div>
      <p>Atenciosamente,<br><strong>Equipe Nobile</strong></p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  confirmacaoPedido: dadosPedido => {
    const {
      nomeComprador,
      numeroPedido,
      relógios, // Array de objetos { brand, model, price }
      valorTotal,
      emailComprador,
    } = dadosPedido;

    // Formatação de preço em BRL
    const formatarPreco = valor => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valor);
    };

    // Gerar linhas HTML para cada relógio
    const linhasRelogios = relógios
      .map(
        relogio => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0;">
        <strong>${relogio.brand} ${relogio.model}</strong>
      </td>
      <td style="padding: 15px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
        ${formatarPreco(relogio.price)}
      </td>
    </tr>
  `
      )
      .join("");

    return {
      assunto: `Pedido Confirmado #${numeroPedido} - Nobile`,

      texto: `
Olá ${nomeComprador},

Seu pedido foi confirmado com sucesso!

Número do Pedido: #${numeroPedido}

Itens Comprados:
${relógios.map(r => `- ${r.brand} ${r.model} - ${formatarPreco(r.price)}`).join("\n")}

Valor Total: ${formatarPreco(valorTotal)}

Você pode acompanhar o status do seu pedido na página "Meus Pedidos" da aplicação.

Agradecemos pela sua compra!

Atenciosamente,
Equipe Nobile
    `,

      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #C5A572 0%, #A88B5E 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .header p {
      color: #ffffff;
      margin: 10px 0 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .success-badge {
      display: inline-block;
      background: #ffffff;
      color: #C5A572;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      margin-top: 15px;
      font-size: 14px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .order-info {
      background: #f8f9fa;
      border-left: 4px solid #C5A572;
      padding: 20px;
      margin: 25px 0;
      border-radius: 6px;
    }
    .order-info h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
      color: #1a1a1a;
    }
    .order-number {
      color: #C5A572;
      font-size: 24px;
      font-weight: 700;
    }
    .items-table {
      width: 100%;
      margin: 25px 0;
      border-collapse: collapse;
    }
    .items-table th {
      text-align: left;
      padding: 12px 0;
      border-bottom: 2px solid #C5A572;
      color: #1a1a1a;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table td {
      padding: 15px 0;
      border-bottom: 1px solid #e0e0e0;
      font-size: 15px;
    }
    .total-row {
      background: #f8f9fa;
      font-weight: 700;
      font-size: 18px;
    }
    .total-row td {
      padding: 20px 0;
      border-bottom: none;
      color: #1a1a1a;
    }
    .tracking-box {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
      text-align: center;
    }
    .tracking-box h3 {
      margin: 0 0 10px 0;
      color: #1a1a1a;
      font-size: 18px;
    }
    .tracking-box p {
      margin: 0;
      color: #666666;
      font-size: 15px;
      line-height: 1.5;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 5px 0;
      color: #666666;
      font-size: 13px;
    }
    .footer .brand {
      color: #C5A572;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="icon">✅</div>
      <h1>Pedido Confirmado!</h1>
      <p>Pagamento processado com sucesso</p>
      <span class="success-badge">CONFIRMADO</span>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá <strong>${nomeComprador}</strong>,</p>
      
      <p>Seu pedido foi confirmado e o pagamento foi processado com sucesso! Agradecemos pela sua confiança na Nobile.</p>

      <!-- Order Info -->
      <div class="order-info">
        <h2>Detalhes do Pedido</h2>
        <div class="order-number">#${numeroPedido}</div>
      </div>

      <!-- Items Table -->
      <table class="items-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th style="text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${linhasRelogios}
          <tr class="total-row">
            <td>Total</td>
            <td style="text-align: right;">${formatarPreco(valorTotal)}</td>
          </tr>
        </tbody>
      </table>

      <!-- Tracking Box -->
      <div class="tracking-box">
        <h3>📦 Acompanhe seu Pedido</h3>
        <p>
          Você pode acompanhar o status do seu pedido e todas as atualizações 
          na página <strong>"Meus Pedidos"</strong> da aplicação Nobile.
        </p>
      </div>

      <p style="margin-top: 30px; color: #666666; font-size: 14px;">
        Em breve você receberá uma atualização quando o vendedor enviar o produto.
      </p>

      <p style="margin-top: 25px;">
        Atenciosamente,<br>
        <strong>Equipe Nobile</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="brand">NOBILE</p>
      <p>Marketplace de Relógios de Luxo</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} Nobile. Todos os direitos reservados.</p>
      <p style="margin-top: 10px; font-size: 12px;">
        Este é um email automático, por favor não responda.
      </p>
    </div>
  </div>
</body>
</html>
    `,
    };
  },
};

module.exports = {
  enviarEmail,
  templates,
};
