import { NextResponse } from 'next/server';
import { generateCounselorResponse } from '@/lib/ai/nlpEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Geçersiz mesaj formatı.' }, { status: 400 });
    }

    // Doğal bir yazma hissi yaratmak için yapay gecikme (1 - 2 saniye)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Yeni Gelişmiş NLP motorunu çağırıyoruz
    const aiResponse = generateCounselorResponse(messages);

    return NextResponse.json({
      success: true,
      reply: aiResponse.text,
      actions: aiResponse.actions,
      report: aiResponse.report
    }, { status: 200 });

  } catch (error: any) {
    console.error('NLP Engine Error:', error);
    return NextResponse.json({ 
      success: false,
      reply: "Sistemde geçici bir hata oluştu. Daha sonra tekrar dener misin?" 
    }, { status: 200 });
  }
}
