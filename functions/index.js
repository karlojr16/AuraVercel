require("dotenv").config();
const express = require("express");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require('firebase-functions/params');
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const { GoogleGenerativeAI } = require("@google/generative-ai");

setGlobalOptions({ maxInstances: 10 });

const app = express();

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => { res.send("AURABOT API FUNCIONANDO"); });

// Endpoint principal del MVP
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("Mensaje recibido:", message);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    res.json({
      reply: text,
    });

  } catch (error) {
    console.error("Gemini Error:", JSON.stringify({
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
    }));

    res.status(500).json({
      error: "Error al generar respuesta con Gemini",
      details: error.message,
    });
  }
});

exports.api = onRequest({ secrets: [GEMINI_API_KEY] }, app);