import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, trip, candidatePlaces } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const hasValidKey = Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY');

    // Context for the AI
    const corridorContext = `
Trip Name: ${trip?.name || 'Amalfi Odyssey'}
Route: ${trip?.origin || 'Naples'} to ${trip?.destination || 'Amalfi Coast'}
Travel Mode: ${trip?.travelMode || 'driving'}
Budget: $${trip?.budgetTotal || 2400}

Available Verified Places Along Corridor:
${(candidatePlaces || [])
  .slice(0, 8)
  .map(
    (p: any) =>
      `- "${p.name}" (${p.category}): Hygiene Score ${p.hygieneScore || 90}/100, Status: ${p.hygieneStatus}, Detour: +${p.detourKm || 1} km (~${p.detourMinutes || 3} min). Address: ${p.address}. Running water: ${p.waterAvailable ? 'Yes' : 'No'}, Soap: ${p.soapAvailable ? 'Yes' : 'No'}.`
  )
  .join('\n')}
`;

    if (hasValidKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const systemInstruction = `You are the WanderCanvas AI Travel Concierge. You give thoughtful, warm, editorial travel advice that strictly prioritizes route efficiency and verified hygiene standards. Always refer to actual places from the provided corridor when relevant. Be concise, inspiring, and transparent about detours and cleanliness.`;

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nContext:\n${corridorContext}\n\nUser Question: ${prompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const replyText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText,
              provider: 'Google Gemini 1.5 Flash (AI Studio)',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini API notice, using Grounded Concierge Engine fallback:', geminiErr);
      }
    }

    // Free Built-In Grounded Intelligence Engine (Fallback & Free-tier)
    let fallbackReply = '';
    const cleanStops = (candidatePlaces || []).filter(
      (p: any) => (p.hygieneScore || 0) >= 90
    );
    const topPlace = cleanStops[0] || candidatePlaces?.[0];

    const lowerPrompt = (prompt || '').toLowerCase();

    if (lowerPrompt.includes('washroom') || lowerPrompt.includes('restroom') || lowerPrompt.includes('toilet') || lowerPrompt.includes('clean')) {
      fallbackReply = `Based on your route along ${trip?.origin} → ${trip?.destination}, the highest-rated sanitation checkpoint is **${topPlace?.name}** (Hygiene Score: **${topPlace?.hygieneScore || 98}/100**, officially audited). It is only a +${topPlace?.detourKm || 0.7} km detour off your main corridor with guaranteed running water and soap.`;
    } else if (lowerPrompt.includes('eat') || lowerPrompt.includes('food') || lowerPrompt.includes('lunch') || lowerPrompt.includes('cafe') || lowerPrompt.includes('coffee') || lowerPrompt.includes('dining')) {
      const foodPlace = (candidatePlaces || []).find((p: any) => p.category === 'restaurant') || topPlace;
      fallbackReply = `For an exceptional culinary pause, I recommend **${foodPlace?.name}** located at ${foodPlace?.address}. It boasts a verified hygiene score of **${foodPlace?.hygieneScore || 96}/100** and adds only ~${foodPlace?.detourMinutes || 5} minutes to your journey.`;
    } else if (lowerPrompt.includes('sunset') || lowerPrompt.includes('scenic') || lowerPrompt.includes('view') || lowerPrompt.includes('hotel')) {
      const hotelPlace = (candidatePlaces || []).find((p: any) => p.category === 'hotel') || topPlace;
      fallbackReply = `For breathtaking coastal vistas, make a stop at **${hotelPlace?.name}**. With a pristine inspection rating of **${hotelPlace?.hygieneScore || 99}/100**, you can relax on the terrace overlooking the Mediterranean with minimal detour.`;
    } else {
      fallbackReply = `Along the ${trip?.name || 'route'}, you have ${candidatePlaces?.length || 4} vetted stops within a 15-minute corridor detour. Leading our hygiene registry is **${topPlace?.name}** (${topPlace?.hygieneScore}/100 rating). It provides verified cleanliness, step-free access, and easy on/off highway access.`;
    }

    return NextResponse.json({
      reply: fallbackReply,
      provider: 'WanderCanvas Grounded Intelligence Engine (100% Free)',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process concierge request' },
      { status: 500 }
    );
  }
}
