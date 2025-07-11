import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendEmail = async (options: {
  from?: string;
  replyTo?: string;
  to: string;
  encoding?: string;
  subject: string;
  headers?: any;
  text?: string;
  html?: string;
}) => {
  const transporter = createTransporter();

  try {
    const emailOptions: any = {
      from: options.from || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      encoding: options.encoding,
    };

    // Add replyTo if provided - THIS IS CRUCIAL for the professional header format
    if (options.replyTo) {
      emailOptions.replyTo = options.replyTo;
    }

    // Set headers
    emailOptions.headers = {
      "Content-Type": 'text/html; charset="UTF-8"',
      "Content-Transfer-Encoding": "base64",
      "X-Mailer": "Accez Platform",
      "X-Priority": "3",
      ...options.headers,
    };

    await transporter.sendMail(emailOptions);

    console.log(`Email sent successfully to ${options.to}`);
    console.log(`From: ${emailOptions.from}`);
    if (options.replyTo) {
      console.log(`Reply-To: ${options.replyTo}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to Send Email! Please Try Again.");
  }
};

export default sendEmail;
