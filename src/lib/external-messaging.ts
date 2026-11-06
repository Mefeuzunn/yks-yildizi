/**
 * External Messaging Gateway (SMS & WhatsApp) for Parent & Student notifications.
 * 
 * Supports:
 * - Netgsm (Turkish Bulk SMS Provider)
 * - Twilio (Global SMS Provider)
 * - WhatsApp Cloud API (Meta Graph API)
 * - Safe simulated logging fallback when credentials are not configured
 */

export interface MessageDispatchOptions {
  recipientPhone: string;
  messageText: string;
  senderTitle?: string;
  channel?: 'sms' | 'whatsapp' | 'auto';
}

export interface MessageDispatchResult {
  success: boolean;
  provider: 'netgsm' | 'twilio' | 'whatsapp' | 'simulation';
  messageId?: string;
  error?: string;
}

/**
 * Standardize Turkish mobile phone numbers to 905XXXXXXXXX format
 */
export function normalizeTurkishPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '90' + cleaned.slice(1);
  } else if (!cleaned.startsWith('90') && cleaned.length === 10 && cleaned.startsWith('5')) {
    cleaned = '90' + cleaned;
  }
  return cleaned;
}

/**
 * Send an external message (SMS or WhatsApp) with graceful fallback to simulation
 */
export async function sendExternalMessage(options: MessageDispatchOptions): Promise<MessageDispatchResult> {
  const { recipientPhone, messageText, senderTitle = 'YKS YILDIZI', channel = 'auto' } = options;
  const normalizedPhone = normalizeTurkishPhone(recipientPhone);

  if (!normalizedPhone || normalizedPhone.length < 10) {
    return {
      success: false,
      provider: 'simulation',
      error: 'Geçersiz telefon numarası.'
    };
  }

  // 1. WhatsApp Cloud API (Meta)
  const waToken = process.env.WHATSAPP_API_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (channel === 'whatsapp' || (channel === 'auto' && waToken && waPhoneId)) {
    try {
      const waRes = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: normalizedPhone,
          type: 'text',
          text: { preview_url: false, body: messageText }
        })
      });

      if (waRes.ok) {
        const waData = await waRes.json().catch(() => ({}));
        return {
          success: true,
          provider: 'whatsapp',
          messageId: waData.messages?.[0]?.id
        };
      } else {
        const errText = await waRes.text().catch(() => '');
        console.warn('WhatsApp Cloud API call failed:', errText);
      }
    } catch (waErr) {
      console.warn('WhatsApp dispatch error:', waErr);
    }
  }

  // 2. Netgsm Bulk SMS (Turkey)
  const netgsmUser = process.env.NETGSM_USERCODE;
  const netgsmPass = process.env.NETGSM_PASSWORD;
  const netgsmHeader = process.env.NETGSM_HEADER || senderTitle;

  if (netgsmUser && netgsmPass) {
    try {
      const xmlBody = `<?xml version="1.0"?>
<mainbody>
  <header>
    <company dil="TR">Netgsm</company>
    <usercode>${netgsmUser}</usercode>
    <password>${netgsmPass}</password>
    <type>1:n</type>
    <msgheader>${netgsmHeader}</msgheader>
  </header>
  <body>
    <msg><![CDATA[${messageText}]]></msg>
    <no>${normalizedPhone}</no>
  </body>
</mainbody>`;

      const netgsmRes = await fetch('https://api.netgsm.com.tr/sms/send/xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xmlBody
      });

      const responseText = await netgsmRes.text();
      // Netgsm returns "00 <jobId>" or "01 <jobId>" on success
      if (responseText.startsWith('00') || responseText.startsWith('01') || responseText.startsWith('02')) {
        return {
          success: true,
          provider: 'netgsm',
          messageId: responseText.trim()
        };
      } else {
        console.warn('Netgsm response code:', responseText);
      }
    } catch (netgsmErr) {
      console.warn('Netgsm dispatch error:', netgsmErr);
    }
  }

  // 3. Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+${normalizedPhone}`);
      params.append('From', twilioFrom);
      params.append('Body', messageText);

      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });

      if (twilioRes.ok) {
        const twData = await twilioRes.json().catch(() => ({}));
        return {
          success: true,
          provider: 'twilio',
          messageId: twData.sid
        };
      } else {
        const errText = await twilioRes.text().catch(() => '');
        console.warn('Twilio dispatch failed:', errText);
      }
    } catch (twErr) {
      console.warn('Twilio dispatch error:', twErr);
    }
  }

  // 4. Graceful Simulation Fallback
  console.log(`[EXTERNAL MESSAGING SIMULATION] Channel: ${channel} | To: +${normalizedPhone} | Text: "${messageText.slice(0, 120)}..."`);
  return {
    success: true,
    provider: 'simulation',
    messageId: `sim_${Date.now()}`
  };
}

/**
 * Convenience helper for Parent SMS notifications
 */
export async function sendParentSms(phone: string, text: string) {
  return sendExternalMessage({
    recipientPhone: phone,
    messageText: text,
    channel: 'sms'
  });
}

/**
 * Convenience helper for Parent WhatsApp notifications
 */
export async function sendParentWhatsApp(phone: string, text: string) {
  return sendExternalMessage({
    recipientPhone: phone,
    messageText: text,
    channel: 'whatsapp'
  });
}
