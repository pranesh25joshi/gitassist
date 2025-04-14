export async function askGemini(question, context) {
    const payload = {
      contents: [{
        parts: [{
          text: `${context}\n\nUser Question: ${question}`
        }]
      }]
    }
  
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no answer."
  }
  