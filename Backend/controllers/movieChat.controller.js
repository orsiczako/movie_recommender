const axios = require('axios');

class MovieChatController {
  /**
   * POST /api/chat/movie
   * Chat about a specific movie using AI
   */
  async chatAboutMovie(req, res) {
    try {
      const { movieTitle, movieYear, movieOverview, question, conversationHistory, language } = req.body;

      if (!movieTitle || !question) {
        return res.status(400).json({
          success: false,
          message: 'Movie title and question are required'
        });
      }

      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      // Determine language for response
      const responseLanguage = language === 'hu' ? 'Hungarian' : 'English';

      // Build conversation context
      let conversationContext = '';
      if (conversationHistory && conversationHistory.length > 0) {
        conversationContext = conversationHistory
          .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n');
      }

      // Create the prompt
      const yearInfo = movieYear ? ` (${movieYear})` : '';
      const overviewInfo = movieOverview ? `\n\nMovie plot summary:\n${movieOverview}` : '';
      
      // Different prompt for first message vs conversation
      let prompt;
      
      if (!conversationContext || conversationContext.trim().length === 0) {
        // First message - introduce as a character from the movie
        prompt = `You are the MAIN PROTAGONIST character from the movie "${movieTitle}${yearInfo}".${overviewInfo}

Task: Introduce yourself using your CHARACTER NAME from the movie as a helpful assistant.

CRITICAL REQUIREMENTS:
1. You MUST return a JSON object with TWO fields: "characterName" and "message"
2. "characterName" should be ONLY the character's name (e.g., "Beatrix Kiddo", "Don Vito Corleone", "Andrew Neiman")
3. "message" should be your introduction (1-2 sentences)
4. Use the plot summary to identify the EXACT main character name
5. Choose ONLY ONE character - the MOST IMPORTANT/FAMOUS protagonist
6. Position yourself as a HELPFUL ASSISTANT who can answer questions about the movie
7. Be warm, engaging, and ready to help
8. RESPOND IN ${responseLanguage} LANGUAGE
9. DO NOT use quotation marks, bold, italics, or any markdown formatting in the message - just plain text
10. Address the user in SINGULAR form (you/te)

EXAMPLES OF CORRECT JSON RESPONSES:
- Kill Bill → {"characterName": "Beatrix Kiddo", "message": "Szia! Beatrix Kiddo vagyok, más néven a Menyasszony. Mit szeretnél tudni a bosszúm történetéről?"}
- The Godfather → {"characterName": "Don Vito Corleone", "message": "Don Vito Corleone vagyok. Itt vagyok, hogy válaszoljak a kérdéseidre a családi üzletünkről."}
- Whiplash → {"characterName": "Andrew Neiman", "message": "Andrew Neiman vagyok. Kérdezz bármit az utazásomról, hogy nagy dobossá váljak."}

User said: ${question}

Return ONLY a valid JSON object with "characterName" and "message" fields in ${responseLanguage} (no other text, just the JSON):`;
      } else {
        // Continuing conversation - stay in character
        prompt = `You are the main protagonist from the movie "${movieTitle}${yearInfo}" acting as a helpful assistant.${overviewInfo}

Previous conversation:
${conversationContext}

User's question: ${question}

Instructions:
- Stay in character as the main protagonist from this movie
- Act as a HELPFUL ASSISTANT answering questions about the movie
- Answer questions from your character's perspective and knowledge
- Share insights about plot, themes, other characters, and your experiences
- If asked about behind-the-scenes facts or real-world information, you can step slightly out of character but maintain the friendly, helpful tone
- Keep responses concise (2-4 sentences) but engaging and informative
- Be helpful, enthusiastic, and supportive
- RESPOND IN ${responseLanguage} LANGUAGE
- DO NOT use quotation marks, bold, italics, or any markdown formatting - just plain text
- Address the user in SINGULAR form (you/te/téged/neked), NEVER plural

Your response in ${responseLanguage} (no quotation marks, no formatting, plain text only, address ONE PERSON):`;
      }


      // Call Gemini API (same model as frontend)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No response from AI');
      }

      // For first message, try to parse JSON for character name
      if (!conversationContext || conversationContext.trim().length === 0) {
        try {
          const jsonMatch = aiResponse.match(/\{[^}]+\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return res.json({
              success: true,
              answer: parsed.message || aiResponse.trim(),
              characterName: parsed.characterName || null
            });
          }
        } catch (e) {
          // If JSON parsing fails, return as-is
          console.log('Failed to parse character name JSON, using plain text');
        }
      }

      return res.json({
        success: true,
        answer: aiResponse.trim(),
        characterName: null
      });

    } catch (error) {
      console.error('Movie chat error:', error.message);
      console.error('Error details:', error.response?.data || error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get AI response',
        error: error.message
      });
    }
  }
}

module.exports = new MovieChatController();
