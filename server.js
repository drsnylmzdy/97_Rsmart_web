const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SMTP Transport Configuration
const transporter = nodemailer.createTransport({
    host: 'proxy.uzmanposta.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'no-reply@rsmart.com.tr',
        pass: 'Smart.2026'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify connection
transporter.verify(function(error, success) {
    if (error) {
        console.log("SMTP Connection Error:", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});

// Email Sending Route
app.post('/send-mail', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    const mailOptions = {
        from: '"R-SMART Web" <no-reply@rsmart.com.tr>', // Sender address
        to: 'info@rsmart.com.tr', // List of receivers
        replyTo: email, // Allow replying to the user's email
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

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
