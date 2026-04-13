export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '../../../lib/firebase-admin';
import crypto from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse');

export async function POST(request: Request) {
  try {
    const { pdfPath, color, botName, userId } = await request.json();

    if (!pdfPath || !userId) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 });
    }

    // Download PDF from Firebase Storage using Admin SDK
    const bucket = adminStorage.bucket();
    const file = bucket.file(pdfPath);
    const [buffer] = await file.download();

    // Parse PDF
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text;

    // Generate botId
    const botId = crypto.randomBytes(8).toString('hex');

    // Save to Firestore
    await adminDb.collection('bots').doc(botId).set({
      userId,
      pdfPath,
      extractedText,
      color: color || '#f97316',
      botName: botName || 'AuraBot',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, botId });
  } catch (error: any) {
    console.error("Error processing config:", error);
    return NextResponse.json({ error: error.message || "Error procesando el PDF" }, { status: 500 });
  }
}
