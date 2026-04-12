import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

interface ChatRequestBody {
  message?: string;
}

interface ChatResponseBody {
  reply?: string;
  error?: string;
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message es requerido' } as ChatResponseBody),
        { status: 400, headers: corsHeaders }
      );
    }

    if (message.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Mensaje demasiado largo' } as ChatResponseBody),
        { status: 400, headers: corsHeaders }
      );
    }

    const result = await model.generateContent(message);
    const text = result.response.text();

    await db.collection('chats').add({
      message,
      reply: text,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({ reply: text } as ChatResponseBody),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Gemini Error:', error);

    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' } as ChatResponseBody),
      { status: 500, headers: corsHeaders }
    );
  }
}