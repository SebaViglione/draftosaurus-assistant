// Netlify Function para manejar requests al backend de OpenAI
// Esta función se ejecuta en el servidor, protegiendo la API key

exports.handler = async (event, context) => {
  // Solo permitir POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parsear el body del request
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request: messages array required' })
      };
    }

    // Obtener la API URL desde variables de entorno
    const API_URL = process.env.OPENAI_API_URL;

    if (!API_URL) {
      console.error('OPENAI_API_URL not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Hacer el request al backend de OpenAI
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si tu API requiere autenticación, usa la API_KEY de las variables de entorno
        // 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Retornar la respuesta al cliente
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Ajusta esto en producción
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error in chat function:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Failed to process chat request',
        reply: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, intentá nuevamente.'
      })
    };
  }
};
