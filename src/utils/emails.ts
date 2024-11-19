import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { generateEmailHtml } from './emailTemplate';

const siteUrl = 'URL';

function createTransporter(): Transporter {
    const email = process.env.EMAIL;
    const senhaEmail = process.env.SENHA_EMAIL;

    if (!email || !senhaEmail) {
        throw new Error("As variáveis de ambiente EMAIL ou SENHA_EMAIL não estão definidas.");
    }

    return nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: email,
            pass: senhaEmail
        }
    });
}

async function sendVerificationEmail(email: string, token: string): Promise<void> {
    const transporter = createTransporter();
    const verificationUrl = `${siteUrl}/auth/verify?token=${token}&email=${email}`;

    const emailContent = `
        <h1>Bem-vindo ao Agenda Aí!</h1>
        <p>Para concluir seu cadastro, clique no botão abaixo para verificar seu email.</p>
        <a href="${verificationUrl}" class="btn">Verificar Email</a>
        <p>Ou copie e cole este link no navegador:</p>
        <p><a href="${verificationUrl}" style="color: #FA240F;">${verificationUrl}</a></p>
    `

    const mailOptions: SendMailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verificação de Email',
        html: generateEmailHtml(emailContent)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de verificação enviado com sucesso para: ${email}`)
    } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        throw error;
    }
}

async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const transporter = createTransporter();
    const resetUrl = `${siteUrl}/auth/reset-password?token=${resetToken}&email=${email}`

    const emailContent = `
        <h1>Recuperação de Senha</h1>
        <p>Para redefinir sua senha, clique no botão abaixo:</p>
        <a href="${resetUrl}" class="btn">Redefinir Senha</a>
        <p>Ou copie e cole este link no navegador:</p>
        <p><a href="${resetUrl}" style="color: #FA240F">${resetUrl}</a></p>
    `

    const mailOptions: SendMailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Recuperação de Senha',
        html: generateEmailHtml(emailContent)
    }

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-mail de recuperação de senha enviado com sucesso para: ${email}`)
    } catch (error) {
        console.error("Erro ao enviar e-mail de recuperação de senha:", error);
        throw error
    }
}

async function sendRegistrationCompletionEmail(email: string, token: string): Promise<void> {
    const transporter = createTransporter()
    const url = `${siteUrl}/rota?token=${token}email=${email}`

    const emailContent = `
        <h1>Solisitação de Cadastro Aprovada</h1>
        <p>Para finalizar o cadastro de seu estabelecimento, clique no botão abaixo</p>
        <a href="${url}" class="btn">Finalizar Cadastro</a>
        <p>Ou copie e cole este link no navegador:</p>
        <p><a href="${url}" style="color: #FA240F">${url}</a></p>
    `

    const mailOptions: SendMailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Finalizae cadastro',
        html: generateEmailHtml(emailContent)
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`E-mail de finalização de cadastro enviado com sucesso para: ${email}`)
    } catch (error) {
        console.error("Erro ao enviar e-mail de finalização de cadastro:", error);
        throw error
        
    }
}

export { sendVerificationEmail, sendPasswordResetEmail, sendRegistrationCompletionEmail }
