const nodemailer = require('nodemailer');

function createTransporter() {
    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.SENHA_EMAIL
        }
    });
}

async function sendVerificationEmail(email, token) {
    const siteUrl = 'http://localhost:3000';
    const transporter = createTransporter();

    const verificationUrl = `${siteUrl}/auth/verify?token=${token}&email=${email}`;

    const mailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verificação de Email',
        text: `Clique no link para verificar seu email: ${verificationUrl}`,
        html: `<a href="${verificationUrl}">Verifique seu email</a>`
    };

    await transporter.sendMail(mailOptions);
}

async function sendRegistrationConfirmationEmail(email) {
    const transporter = createTransporter();

    const mailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Solicitação de Cadastro Enviada',
        text: 'Sua solicitação de cadastro de lanchonete foi enviada com sucesso e está aguardando confirmação.',
        html: '<p>Sua solicitação de cadastro de lanchonete foi enviada com sucesso e está aguardando confirmação.</p>'
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendRegistrationConfirmationEmail };
