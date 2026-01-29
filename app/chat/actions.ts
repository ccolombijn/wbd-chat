'use server';

import { GoogleGenerativeAI, type CachedContent } from '@google/generative-ai';
import { GoogleAICacheManager } from '@google/generative-ai/server';
import path from 'path';
import { promises as fs } from 'fs';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);
const cacheManager = new GoogleAICacheManager(apiKey);
let systemInstruction = '';
try {
  //await fs.access(path.join(process.cwd(), 'public', 'system_prompt.txt'));
  systemInstruction = await fs.readFile(path.join(process.cwd(), 'public', 'system_prompt.txt'), 'utf-8');
} catch {
  const defaultSystemPrompt = process.env.SYSTEM_INSTRUCTION || 'Je bent een behulpzame assistent.';
  await fs.writeFile(path.join(process.cwd(), 'public', 'system_prompt.txt'), defaultSystemPrompt, 'utf-8');
}

let cache: CachedContent | undefined;
let cacheExpiration = 0;

async function getCache(): Promise<CachedContent | undefined> {
  if (cache && Date.now() < cacheExpiration) {
    return cache;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'www.brabantsedelta.nl/data/sitemap.json');
    const fileData = await fs.readFile(filePath, 'utf-8');

    const newCache = await cacheManager.create({
      model: 'models/gemini-2.5-flash',
      displayName: 'waterschap-context',
      systemInstruction,
      ttlSeconds: 300,
      contents: [
        {
          role: 'user',
          parts: [{ text: fileData }],
        },
      ],
    });

    cache = newCache;
    cacheExpiration = Date.now() + (290 * 1000);
    return cache;
  } catch (error) {
    console.error('Error creating cache:', error);
    return undefined;
  }
}

export async function* sendMessage(history: { role: 'user' | 'model'; text: string }[], message: string) {
  const cachedContent = await getCache();
  const model = genAI.getGenerativeModel({
    model: 'models/gemini-2.5-flash',
    cachedContent,
    systemInstruction: cachedContent ? undefined : systemInstruction,
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
  const cachedContent = await getCache();
  const model = genAI.getGenerativeModel({
    model: 'models/gemini-2.5-flash',
    cachedContent,
    systemInstruction: cachedContent ? undefined : systemInstruction,
  });

  const chat = model.startChat({
    history: history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
  });

  const result = await chat.sendMessage('Genereer 3 korte, relevante, Nederlandse (vervolg)vragen (maximaal 10 woorden per vraag) die de gebruiker nu zou kunnen stellen op basis van de huidige context en historie (indien aanwezig). Geef alleen de vragen terug, één per regel, zonder nummering of inleiding.');
  const response = await result.response;
  const text = response.text();
  return text.split('\n').map(s => s.trim()).filter(s => s.length > 0).slice(0, 3);
}
