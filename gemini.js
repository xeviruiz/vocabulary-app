// This is our secure, server-side function.
// It will run on Netlify's servers, not in the user's browser.

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Get the prompt from the request body sent by the frontend
  const { prompt } = JSON.parse(event.body);

  // Get the API key from the environment variables set in the Netlify UI
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
    
    // Send the result back to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ text }),
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return { statusCode: 500, body: 'An error occurred.' };
  }
};
