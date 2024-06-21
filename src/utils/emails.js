const nodemailer = require('nodemailer');

async function sendVerificationEmail(email, token) {

    const siteUrl = process.env.REMOTE_CLIENTE_URL

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.SENHA_EMAIL
        }
    });

    const verificationUrl = `http://${siteUrl}/auth/verify?token=${token}&email=${email}`;

    const mailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verificação de Email',
        text: `Clique no link para verificar seu email: ${verificationUrl}`,
        html: `<a href="${verificationUrl}">Verifique seu email</a>`
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
