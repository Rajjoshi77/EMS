const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  
  let transporter;
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    
    console.log('Using SMTP Mock: Fallback since no SMTP credentials provided in .env');
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('--- Mock Email Sent ---');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Body:\n${mailOptions.text}`);
        console.log('------------------------');
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Employee Management System'} <${process.env.FROM_EMAIL || 'no-reply@company.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
