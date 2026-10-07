import { createTransport } from "nodemailer";

const sendMail = async (email, subject, data) => {
  const gmailUser = process.env.Gmail;
  const gmailPass = process.env.Password;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: red;
        }
        p {
            margin-bottom: 20px;
            color: #666;
        }
        .otp {
            font-size: 36px;
            color: #7b68ee; /* Purple text */
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${data.name}, your One-Time Password (OTP) for account verification is:</p>
        <p class="otp">${data.otp}</p> 
    </div>
</body>
</html>
`;

  if (!gmailUser || !gmailPass) {
    throw new Error(
      "Missing SMTP/Email credentials. Please set 'Gmail' & 'Password' in your environment variables."
    );
  }

  // Clean up password whitespace if copied from Google App Password UI
  const cleanPass = gmailPass.replace(/\s+/g, "");

  const transporter = createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: cleanPass },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 6000,
  });

  try {
    await transporter.sendMail({
      from: `Learnify <${gmailUser}>`,
      to: email,
      subject,
      html,
    });
    console.log(`[SMTP Success] OTP email delivered to ${email}`);
  } catch (err) {
    console.warn(`[SMTP Warning] Connection attempt failed:`, err.message);
    throw new Error("Failed to send email. Please verify your Google App Password.");
  }
};

export default sendMail;
