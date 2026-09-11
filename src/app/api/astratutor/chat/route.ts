import { NextResponse } from 'next/server';

// Temporary mock AI logic since we don't have a real LLM API key configured yet.
const MOCK_RESPONSES = [
  "Harika bir soru! Bu konuyu biraz daha detaylandıralım. Hangi kısımlarda zorlanıyorsun?",
  "Fizik dersi için günde en az 1 saat odaklı çalışma (Pomodoro tekniği ile) öneriyorum. Senin hedefin neydi?",
  "Tercih listeni incelerken mutlaka puanlardan ziyade sıralamalara dikkat etmelisin.",
  "Şu anki netlerine göre hedefine ulaşman çok olası, sadece biraz daha pratik yapman gerekiyor. Bol bol deneme çözmelisin!",
  "Anlıyorum. Optik ve Dalgalar konusu başlarda zor gelebilir ama formülleri kavramaktansa mantığını oturtursan çok rahat edersin.",
  "Eğer istersen senin için yarın 09:00'da başlayacak bir Matematik + Geometri çalışma kampı programı oluşturabilirim. Ne dersin?"
];

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Simulate AI thinking delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // For demonstration, just pick a random mock response
    // In production, this would call Gemini / OpenAI API
    const reply = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AstraTutor API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
