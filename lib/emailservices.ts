import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordEmail(
  email: string,
  firstName: string,
  password: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; }
            .password-box { background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; font-size: 16px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Aadi Fitness! 🏋️</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Your payment has been verified successfully! Here are your login credentials:</p>
              
              <p><strong>Email:</strong> ${email}</p>
              
              <div class="password-box">
                <strong>Password:</strong> ${password}
              </div>
              
              <p><strong>Important:</strong> Please change this password after your first login for security.</p>
              
              <p>You can now log in at: <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/login">Aadi Fitness Login</a></p>
              
              <p>If you have any questions, feel free to reach out to your trainer.</p>
              
              <p>Best regards,<br><strong>Team Aadi Fitness</strong></p>
            </div>
            <div class="footer">
              <p>© 2025 Aadi Fitness. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Aadi Fitness Login Password",
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export async function sendWelcomeEmail(
  email: string,
  firstName: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Aadi Fitness!</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for signing up with Aadi Fitness! We're excited to help you achieve your fitness goals.</p>
              <p>Your trainer will send you login credentials shortly.</p>
              <p>Best regards,<br><strong>Team Aadi Fitness</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Aadi Fitness",
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}
