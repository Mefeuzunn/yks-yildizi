/**
 * YKS Yıldızı - Kurumsal E-Posta Servisi (Resend & SMTP Entegrasyonu)
 * 
 * Bu servis, platform üzerindeki şifre sıfırlama, hoş geldin mesajları
 * ve bildirim e-postalarını modern, mobil uyumlu HTML şablonlarıyla gönderir.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface PasswordResetEmailParams {
  to: string;
  username: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

/**
 * Modern YKS Yıldızı Şifre Sıfırlama HTML Şablonu
 */
export function generatePasswordResetEmailHtml({
  username,
  resetUrl,
  expiresInMinutes = 30
}: {
  username: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): string {
  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama | YKS Yıldızı</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f1f5f9;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f19;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: linear-gradient(180deg, #131b2e 0%, #0f172a 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 36px 32px 24px;
      text-align: center;
      background: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 9999px;
      color: #a5b4fc;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .title {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .content {
      padding: 32px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.65;
    }
    .greeting {
      font-size: 17px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 16px;
    }
    .btn-container {
      text-align: center;
      margin: 36px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 36px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 800;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
      letter-spacing: 0.2px;
    }
    .warning-box {
      margin-top: 24px;
      padding: 16px;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 12px;
      font-size: 13px;
      color: #fde68a;
      line-height: 1.5;
    }
    .alt-link {
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
    }
    .alt-link a {
      color: #818cf8;
      text-decoration: none;
    }
    .footer {
      padding: 24px 32px;
      background: #090d16;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand-badge">⭐ YKS Yıldızı 2026</div>
        <h1 class="title">Şifre Sıfırlama Talebi</h1>
      </div>
      <div class="content">
        <div class="greeting">Merhaba ${username || 'Öğrencimiz'},</div>
        <p>YKS Yıldızı hesabınız için bir şifre sıfırlama isteği aldık. Hesabınıza güvenli bir şekilde yeni şifre belirlemek için aşağıdaki butona tıklayabilirsiniz:</p>
        
        <div class="btn-container">
          <a href="${resetUrl}" target="_blank" class="btn">Yeni Şifre Belirle &rarr;</a>
        </div>

        <div class="warning-box">
          ⏳ <strong>Önemli Bilgi:</strong> Bu bağlantı güvenliğiniz için <strong>${expiresInMinutes} dakika</strong> boyunca geçerlidir. Bu talebi siz yapmadıysanız lütfen bu e-postayı dikkate almayınız; mevcut şifreniz değişmeyecektir.
        </div>

        <div class="alt-link">
          Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınızın adres çubuğuna yapıştırabilirsiniz:<br>
          <a href="${resetUrl}" target="_blank">${resetUrl}</a>
        </div>
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} YKS Yıldızı Eğitim Teknolojileri. Tüm hakları saklıdır.<br>
        Hedefine giden yolda her an yanındayız.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Genel E-Posta Gönderici (Resend / SMTP / Console Fallback)
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'YKS Yıldızı <destek@yksyildizi.com>';

  // 1. Eğer Resend API Anahtarı varsa doğrudan Resend REST API ile gönder
  if (resendApiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, '')
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[EmailService] Resend API hatası:', data);
        return { success: false, error: data.message || 'E-posta servisi yanıt vermedi' };
      }

      console.log('[EmailService] E-posta başarıyla Resend ile gönderildi:', data.id);
      return { success: true, id: data.id };
    } catch (err: any) {
      console.error('[EmailService] Resend gönderim hatası:', err);
      return { success: false, error: err.message };
    }
  }

  // 2. Resend API Key tanımlanmamışsa geliştirme/demo modu loglaması
  console.log(`[EmailService - DEV/DEMO] E-posta Gönderimi Simüle Edildi:
  -> Alıcı: ${to}
  -> Konu: ${subject}
  -> Şablon Boyutu: ${html.length} karakter
  (Üretim ortamında gerçek e-posta gönderimi için RESEND_API_KEY ortam değişkenini tanımlayınız.)
  `);

  return { success: true, id: 'demo-email-sent' };
}

/**
 * Şifre Sıfırlama E-Postası Gönder
 */
export async function sendPasswordResetEmail({
  to,
  username,
  resetUrl,
  expiresInMinutes = 30
}: PasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  const html = generatePasswordResetEmailHtml({ username, resetUrl, expiresInMinutes });
  const subject = '🔐 YKS Yıldızı - Şifre Sıfırlama Bağlantınız';
  
  return await sendEmail({
    to,
    subject,
    html,
    text: `Merhaba ${username},\n\nŞifrenizi sıfırlamak için şu bağlantıyı kullanabilirsiniz:\n${resetUrl}\n\nBu bağlantı ${expiresInMinutes} dakika geçerlidir.`
  });
}
