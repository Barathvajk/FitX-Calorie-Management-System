const https = require('https');

const chat = async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    if (!messages || !messages.length)
      return res.status(400).json({ message: 'Messages are required.' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here')
      return res.status(500).json({ message: 'Anthropic API key not configured in .env file.' });

    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt || 'You are FITX AI Coach, an expert fitness and nutrition assistant.',
      messages
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return res.status(400).json({ message: parsed.error.message });
          const reply = parsed.content?.[0]?.text || 'No response received.';
          res.json({ reply });
        } catch { res.status(500).json({ message: 'Failed to parse AI response.' }); }
      });
    });

    apiReq.on('error', (err) => {
      console.error('AI API error:', err.message);
      res.status(500).json({ message: 'Failed to reach AI service. Check internet connection.' });
    });

    apiReq.write(body);
    apiReq.end();
  } catch (err) {
    console.error('AI controller error:', err);
    res.status(500).json({ message: 'AI service error.' });
  }
};

module.exports = { chat };
