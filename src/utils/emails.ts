import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

const siteUrl = 'https://agendaai.vercel.app';

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

    const mailOptions: SendMailOptions = {
        from: `Agenda Aí <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verificação de Email',
        html: `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #FA240F;
                    padding: 20px;
                    text-align: center;
                }
                .header img {
                    max-width: 150px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h1 {
                    color: #333;
                    font-size: 24px;
                }
                .content p {
                    color: #555;
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                .content p a {
                    font-size: 13px;
                }
                .btn {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #FA240F;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                }
                .btn:hover {
                    background-color: #d91e0d;
                }
                .footer {
                    background-color: #f4f4f4;
                    padding: 10px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://res.cloudinary.com/dhaxh4qdu/image/upload/v1725925943/ovxinqsx3q2rnmytxcqw.png" alt="Logo Agenda Aí">
                </div>
                <div class="content">
                    <h1>Bem-vindo ao Agenda Aí!</h1>
                    <p>Para concluir seu cadastro, por favor, clique no botão abaixo para verificar seu email.</p>
                    <a href="${verificationUrl}" class="btn">Verificar Email</a>
                    <p>ou copie e cole este link no navegador:</p>
                    <p><a href="${verificationUrl}" style="color: #FA240F;">${verificationUrl}</a></p>
                </div>
                <div class="footer">
                    <p>Se você não solicitou este e-mail, ignore-o com segurança.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        throw error;
    }
}

export { sendVerificationEmail };
