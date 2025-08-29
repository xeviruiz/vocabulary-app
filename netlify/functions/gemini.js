exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body);
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    return { statusCode: 500, body: 'API key not found.' };
  }

  if (!prompt) {
    return { statusCode: 400, body: 'Prompt is required.' };
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Gemini API Error:', errorBody);
        return { statusCode: response.status, body: `Gemini API Error: ${errorBody}` };
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { statusCode: 500, body: 'An error occurred.' };
  }
};
