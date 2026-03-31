const https = require('https');

const sendOtp = async (email, otp) => {
  const BREVO_API_KEY = process.env.EMAIL_PASS;
  
  console.log(`>>> OTP REQUEST: TO=${email}, CODE=${otp}`);
  console.log(`>>> API KEY PRESENT: ${BREVO_API_KEY ? 'YES (' + BREVO_API_KEY.substring(0, 15) + '...)' : 'NO - CHECK RENDER ENV VARS'}`);
  console.log(`>>> EMAIL_FROM env: "${process.env.EMAIL_FROM || 'NOT SET'}"`);

  if (!BREVO_API_KEY) {
    console.log('❌ EMAIL_FAIL: NO API KEY');
    console.log('❌ Available env vars:', Object.keys(process.env).filter(k => k.includes('EMAIL')));
    return Promise.reject(new Error('Email API key not configured - Set EMAIL_PASS in Render environment'));
  }

  const senderEmail = process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || 'devxzenox@gmail.com';
  console.log(`>>> SENDER: ${senderEmail}`);

  const data = JSON.stringify({
    sender: { name: 'Premium', email: senderEmail },
    to: [{ email }],
    subject: 'Your OTP Code - Premium Earning',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">Premium Earning Platform</h2>
        <p>Your OTP is:</p>
        <h1 style="font-size: 32px; color: #D4AF37;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `
  });

  const options = {
    hostname: 'api.brevo.com',
    port: 443,
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`>>> BREVO RESPONSE: ${res.statusCode} - ${body}`);
        if (res.statusCode === 201) {
          console.log(`✅ EMAIL_SENT: OTP sent to ${email}`);
          resolve();
        } else {
          console.log(`❌ EMAIL_FAILED: ${body}`);
          reject(new Error(body));
        }
      });
    });
    req.on('error', (e) => {
      console.log(`❌ EMAIL_ERROR: ${e.message}`);
      reject(e);
    });
    req.write(data);
    req.end();
  });
};

console.log(`✅ Email module ready (EMAIL_PASS check at runtime)`);

module.exports = { sendOtp };
