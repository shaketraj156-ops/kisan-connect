const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyD61DvbDA6HPdS4fiQAPXEoZ7-gf6mAn0w");
async function run() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hi");
    console.log("Success gemini-1.5-flash:", result.response.text());
  } catch (e) {
    console.error("Error 1.5-flash:", e.message);
  }
}
run();
