import { NextResponse } from 'next/server';

/**
 * Content Moderation API
 * Blocks insults, hate speech, and spam.
 */
export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ isSafe: true });
    }

    const lowerText = text.toLowerCase();

    // 1. Liste exhaustive d'insultes et termes inappropriés (FR & EN)
    const blockedWords = [
      // Français
      'merde', 'putain', 'connard', 'salope', 'encule', 'pd', 'pede', 'conne', 'con', 
      'abruti', 'batard', 'pute', 'nique', 'ta race', 'tg', 'tg!', 'fdp', 'gueule',
      'fion', 'bite', 'couille', 'couilles', 'nichon', 'nichons', 'cul', 'culé',
      
      // English
      'fuck', 'shit', 'asshole', 'bitch', 'dick', 'pussy', 'bastard', 'cunt',
      'motherfucker', 'cock', 'faggot', 'nigger', 'retard', 'whore', 'slut',
      
      // Spam & Scams
      'viagra', 'casino', 'bitcoin', 'crypto', 'earn money', 'devenir riche',
      'porn', 'sex', 'sexy', 'camgirl', 'onlyfans'
    ];

    // 2. Vérification par mot exact ou inclusion
    // On split par espaces et ponctuation pour éviter les faux positifs (ex: "concours" qui contient "con")
    const words = lowerText.split(/[\s,.;:!?']+/);
    
    for (const word of words) {
      if (blockedWords.includes(word)) {
        return NextResponse.json({ 
          isSafe: false, 
          reason: "Attention ! Ton langage n'est pas très 'Barista'. Restons polis et concentrés sur le café. ☕️" 
        });
      }
    }

    // 3. Vérification de patterns (ex: insultes composées)
    for (const phrase of ['nique ta', 'fils de', 'ta mere', 'ta gueule']) {
      if (lowerText.includes(phrase)) {
        return NextResponse.json({ 
          isSafe: false, 
          reason: "Oups ! Ce genre de propos n'a pas sa place dans l'Atelier. Un peu de respect pour la tribu. 🙏" 
        });
      }
    }

    return NextResponse.json({ isSafe: true });

  } catch (error) {
    console.error('Moderation API error:', error);
    return NextResponse.json({ isSafe: true }); // On laisse passer en cas d'erreur technique
  }
}
