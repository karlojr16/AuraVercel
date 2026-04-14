import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '../../../lib/firebase-admin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ChatRequestBody {
  botId?: string;
  message?: string;
  history?: any[];
}

export const dynamic = 'force-dynamic';

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { botId, message, history = [] } = body;
    const trimMessage = message?.trim();

    if (!botId || !trimMessage) {
      return new Response(
        JSON.stringify({ error: 'botId y message son requeridos' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (trimMessage.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Mensaje demasiado largo' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get bot config from Firestore
    const botDoc = await adminDb.collection('bots').doc(botId).get();
    
    if (!botDoc.exists) {
      return new Response(
        JSON.stringify({ error: 'Bot no encontrado' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const { extractedText, botName } = botDoc.data()!;

    const systemInstruction = `
Eres un asistente de ventas llamado ${botName || 'AuraBot'}.
Tu objetivo es ayudar a los clientes y resolver sus dudas basándote ÚNICAMENTE en la siguiente información del negocio.
NO INVENTES NUNCA datos, precios ni promociones que no estén en el texto.
Si el usuario pregunta algo que no está en la información, responde educadamente que no tienes esa información y ofrece la ayuda que sí puedes dar.
Mantén un tono amigable, persuasivo y orientado a la venta.

INFORMACIÓN DEL NEGOCIO:
"""
${extractedText}
"""
`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
    });

    // Format history
    let formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Gemini API requires the history to always start with a user message.
    // If the frontend sends the bot's initial greeting, we must drop it from history.
    while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
      formattedHistory.shift();
    }

    const chat = model.startChat({
        history: formattedHistory
    });

    const result = await chat.sendMessage(trimMessage);
    const text = result.response.text();

    await adminDb.collection('chats').add({
      botId,
      message: trimMessage,
      reply: text,
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({ response: text }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
  console.error(' ERROR REAL:', error);

  return new Response(
    JSON.stringify({ 
      error: error.message || 'Error desconocido',
      stack: error.stack || null
    }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
}