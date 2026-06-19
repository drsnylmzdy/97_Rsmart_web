const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // SMTP Transport Configuration
        const transporter = nodemailer.createTransport({
            host: 'proxy.uzmanposta.com',
            port: 465,
            secure: true,
            auth: {
                user: 'no-reply@rsmart.com.tr',
                pass: 'Smart.2026'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: '"R-SMART Web" <no-reply@rsmart.com.tr>',
            to: 'info@rsmart.com.tr',
            replyTo: email,
            subject: `[Web Form] ${subject} - ${name}`,
            html: `
                <h3>Yeni İletişim Formu Mesajı</h3>
                <p><strong>Ad Soyad:</strong> ${name}</p>
                <p><strong>E-posta:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone || 'Belirtilmedi'}</p>
                <p><strong>Konu:</strong> ${subject}</p>
                <br>
                <p><strong>Mesaj:</strong></p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
};
