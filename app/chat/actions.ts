'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const systemInstruction = `Je bent een behulpzame assistent die informatie geeft over Waterschap Brabantse Delta. Probeer zoveel mogelijk informatie van de website https://www.brabantsedelta.nl/ te halen en hiernaar te verwijzen bij je vragen zonder de website zelf te benoemen. Beantwoord de vragen zo volledig mogelijk op basis van de beschikbare gegevens. Verzin geen antwoorden als de informatie niet beschikbaar is. Spreek eerder vanuit 'het Waterschap' dan vanuit 'hen'. Spreek alsof de gebruiker zich op de website zelf bevindt, maar verwijs altijd waar bepaalde informatie te vinden is.`;

export async function* sendMessage(history: { role: 'user' | 'model'; text: string }[], message: string) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessageStream(message);
  for await (const chunk of result.stream) {
    yield chunk.text();
  }
}

export async function getSuggestions(history: { role: 'user' | 'model'; text: string }[]) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction,
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessage('Genereer 3 korte, relevante, Nederlandse vervolgvragen (maximaal 10 woorden per vraag) die de gebruiker nu zou kunnen stellen op basis van het gesprek. Geef alleen de vragen terug, één per regel, zonder nummering of inleiding.');
  const response = await result.response;
  const text = response.text();
  return text.split('\n').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
}
