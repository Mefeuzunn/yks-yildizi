import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory audio LRU cache to save bandwidth and ensure 0ms latency for repeating flashcards
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_SIZE = 1500;

/**
 * Splits text into natural conversational chunks that fit within Google TTS limits (~180 chars)
 * and breaks on natural punctuation boundaries to ensure human-like prosody.
 */
function splitTextIntoTTSChunks(text: string, maxLen = 175): string[] {
  // Clean markdown / LaTeX symbols for smooth spoken Turkish
  const cleaned = text
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 bölü $2')
    .replace(/\\int/g, 'integral')
    .replace(/\\sum/g, 'toplam')
    .replace(/\\lim_\{[^}]+\}/g, 'limit')
    .replace(/\\sqrt\{([^}]+)\}/g, 'karekök $1')
    .replace(/\^2/g, ' kare')
    .replace(/\^3/g, ' küp')
    .replace(/\^\{([^}]+)\}/g, ' üssü $1')
    .replace(/\\cdot|\\times/g, ' çarpı ')
    .replace(/\\pm/g, ' artı eksi ')
    .replace(/\\approx/g, ' yaklaşık eşittir ')
    .replace(/\\neq/g, ' eşit değildir ')
    .replace(/\\le|\\leq/g, ' küçük eşittir ')
    .replace(/\\ge|\\geq/g, ' büyük eşittir ')
    .replace(/\\infty/g, ' sonsuz ')
    .replace(/\\alpha/g, ' alfa ')
    .replace(/\\beta/g, ' beta ')
    .replace(/\\theta/g, ' teta ')
    .replace(/\\pi/g, ' pi ')
    .replace(/\\Delta/g, ' delta ')
    .replace(/\\lambda/g, ' lamda ')
    .replace(/\$+/g, '') // Remove KaTeX delimiters
    .replace(/\[\.\.\.\]/g, 'boşluk')
    .replace(/\*+/g, '') // Remove bold/italic markdown
    .replace(/#+/g, '') // Remove headers
    .replace(/`+/g, '')
    .trim();

  if (!cleaned) return [];
  if (cleaned.length <= maxLen) return [cleaned];

  // Split by sentence terminators first (. ! ? ; or newline)
  const sentences = cleaned.match(/[^.!?;\n]+[.!?;\n]+|[^.!?;\n]+$/g) || [cleaned];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if ((current + ' ' + trimmed).trim().length <= maxLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length <= maxLen) {
        current = trimmed;
      } else {
        // Words split if single sentence exceeds maxLen
        const words = trimmed.split(/\s+/);
        let wordChunk = '';
        for (const w of words) {
          if ((wordChunk + ' ' + w).trim().length <= maxLen) {
            wordChunk = (wordChunk + ' ' + w).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        current = wordChunk;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function fetchGoogleTTSChunk(chunkText: string): Promise<Buffer> {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=tr&client=tw-ob`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://translate.google.com/',
      'Accept': 'audio/mpeg, audio/*;q=0.9',
    },
    // Cache on upstream network where possible
    next: { revalidate: 86400 * 7 }
  });

  if (!response.ok) {
    throw new Error(`Google TTS network error: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawText = searchParams.get('text');

    if (!rawText || !rawText.trim()) {
      return NextResponse.json({ error: 'Seslendirilecek metin belirtilmedi' }, { status: 400 });
    }

    const trimmedText = rawText.trim().slice(0, 1000); // Guard limit
    const cacheKey = trimmedText.toLowerCase();

    // 1. Check in-memory LRU cache
    if (audioCache.has(cacheKey)) {
      const cachedBuffer = audioCache.get(cacheKey)!;
      return new NextResponse(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cachedBuffer.length.toString(),
          'Cache-Control': 'public, max-age=604800, s-maxage=2592000, immutable',
          'X-TTS-Source': 'cache-hit',
        },
      });
    }

    // 2. Split into prosody chunks
    const chunks = splitTextIntoTTSChunks(trimmedText);
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'Metin boş veya geçersiz' }, { status: 400 });
    }

    // 3. Fetch audio chunks in parallel (max 5 chunks)
    const audioBuffers = await Promise.all(
      chunks.slice(0, 6).map((c) => fetchGoogleTTSChunk(c))
    );

    // 4. Combine MP3 buffers
    const combinedBuffer = Buffer.concat(audioBuffers);

    // 5. Store in memory cache
    if (audioCache.size >= MAX_CACHE_SIZE) {
      // Evict oldest item
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, combinedBuffer);

    // 6. Return audio stream
    return new NextResponse(new Uint8Array(combinedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedBuffer.length.toString(),
        'Cache-Control': 'public, max-age=604800, s-maxage=2592000, immutable',
        'Accept-Ranges': 'bytes',
        'X-TTS-Source': 'neural-synthesis',
      },
    });
  } catch (error: any) {
    console.error('TTS Route Error:', error);
    return NextResponse.json(
      { error: 'Ses üretilirken bir hata oluştu', details: error?.message },
      { status: 500 }
    );
  }
}
