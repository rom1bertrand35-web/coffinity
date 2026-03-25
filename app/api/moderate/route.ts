import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, type, coffeeName, brand } = await request.json();

    // 1. Filtre anti-insultes basique (très rapide et 100% gratuit)
    if (text && text.trim() !== '') {
      const blockedWords = [
        'merde', 'putain', 'connard', 'salope', 'bitch', 'fuck', 'shit', 'asshole',
        'viagra', 'casino', 'bitcoin', 'crypto', 'porn'
      ];

      const lowerText = text.toLowerCase();
      for (const word of blockedWords) {
        if (lowerText.includes(word)) {
          return NextResponse.json({ 
            isSafe: false, 
            reason: "Please keep the language clean and focused on coffee." 
          });
        }
      }
    }

    return NextResponse.json({ isSafe: true });

  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json({ isSafe: true });
  }
}
