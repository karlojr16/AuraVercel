const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyCbpQaJkwQ0oY-Im_ASJwr6os48ZlhBGwE";

async function run() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    try {
        console.log("Testing gemini-2.0-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Di hola");
        console.log("SUCCESS! Reply:", result.response.text());
    } catch (e) {
        console.log("FAILED:");
        console.log("  message:", e.message);
        console.log("  status:", e.status);
        console.log("  statusText:", e.statusText);
        console.log("  errorDetails:", JSON.stringify(e.errorDetails, null, 2));
    }
}

run();
