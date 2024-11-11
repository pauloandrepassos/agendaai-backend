function generateEmailHtml(content: string): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background-color: #FA240F; padding: 20px; text-align: center; }
            .header img { max-width: 150px; }
            .content { padding: 20px; text-align: center; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #777; }
            .btn { display: inline-block; padding: 10px 20px; background-color: #FA240F; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; transition: background-color 0.3s ease; }
            .btn:hover { background-color: #d91e0d; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/dhaxh4qdu/image/upload/v1725925943/ovxinqsx3q2rnmytxcqw.png" alt="Logo Agenda Aí">
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>Se você não solicitou este e-mail, ignore-o com segurança.</p>
            </div>
        </div>
    </body>
    </html>
    `
}

export { generateEmailHtml }
