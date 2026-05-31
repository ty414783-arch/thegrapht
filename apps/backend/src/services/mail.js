import crypto from "node:crypto";
import nodemailer from "nodemailer";

import { config } from "../config.js";
import { logger } from "../utils/logger.js";

// Initialize the nodemailer transport pool
const getTransporter = () => {
  const options = {
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    // Add pool features for robustness
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  };

  if (config.smtpUser && config.smtpPass) {
    options.auth = {
      user: config.smtpUser,
      pass: config.smtpPass
    };
  }

  return nodemailer.createTransport(options);
};

const transporter = getTransporter();

/**
 * Generates a cryptographically strong 6-digit code.
 * @returns {string}
 */
export const generateVerificationCode = () => {
  return String(crypto.randomInt(100000, 999999));
};

/**
 * Dispatches a premium verification email.
 * @param {string} email
 * @param {string} code
 * @returns {Promise<boolean>}
 */
export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"TheGraphT" <${config.smtpFrom}>`,
    to: email,
    subject: `Your TheGraphT Verification Code: ${code}`,
    text: `Your TheGraphT verification code is: ${code}\nThis code is valid for 10 minutes. Please do not share this code with anyone.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TheGraphT Verification Code</title>
        <style>
          body {
            background-color: #0d0d12;
            color: #ececf1;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 500px;
            margin: 40px auto;
            background-color: #161622;
            border: 1px solid #232335;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(135deg, #a855f7 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 24px;
            letter-spacing: 0.5px;
            display: inline-block;
          }
          h2 {
            font-size: 20px;
            margin-top: 0;
            color: #ffffff;
            font-weight: 600;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #9ab0c7;
            margin: 16px 0;
          }
          .code-box {
            background-color: #0b0b10;
            border: 1px dashed #4f46e5;
            border-radius: 12px;
            padding: 16px;
            margin: 28px 0;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #6366f1;
            text-indent: 8px;
          }
          .footer {
            margin-top: 32px;
            font-size: 11px;
            color: #52627a;
            border-top: 1px solid #232335;
            padding-top: 16px;
          }
          .warning {
            color: #ef4444;
            font-size: 12px;
            margin-top: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">TheGraphT</div>
          <h2>Verify Your Email</h2>
          <p>Please use the following 6-digit verification code to complete your authorization. This code is active for 10 minutes.</p>
          
          <div class="code-box">${code}</div>
          
          <p class="warning">Never share this verification code with anyone, including TheGraphT support staff.</p>
          
          <div class="footer">
            Sent automatically by TheGraphT Messenger infrastructure.<br>
            If you did not request this, please secure your credentials.
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info({ messageId: info.messageId, to: email }, "Successfully sent verification SMTP email");
    return true;
  } catch (error) {
    logger.error({ error: error.message, to: email }, "Failed to send verification SMTP email");
    return false;
  }
};
