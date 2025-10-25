const prisma = require('../../prisma/client');
const nodemailer = require('nodemailer');

class SupportService {
  async processSupportRequest({ nome, email, mensagem }) {
    try {
      // Salvar o ticket de suporte no banco de dados
      await prisma.ticketSuporte.create({
        data: {
          name: nome,
          email: email,
          message: mensagem,
        },
      });

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SUPPORT_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      // Conteúdo do email
      const mailOptions = {
        from: `"${nome}" <${email}>`,
        to: process.env.SUPPORT_EMAIL,
        subject: `Novo Ticket de Suporte: ${nome}`,
        html: `
          <h1>Novo Ticket de Suporte Recebido</h1>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email para Contato:</strong> ${email}</p>
          <hr />
          <h3>Mensagem:</h3>
          <p>${mensagem}</p>
          <br>
          <p><em>Este ticket foi salvo no banco de dados.</em></p>
        `,
      };

      await transporter.sendMail(mailOptions);

    } catch (error) {
      console.error("Erro ao salvar ticket no banco de dados:", error);
      throw new Error("Erro ao processar solicitação de suporte.");
    }
  }
}

module.exports = new SupportService();