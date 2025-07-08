const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Store your Google Gemini API key in environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('⚠️  Please set GEMINI_API_KEY environment variable');
    process.exit(1);
}

// Endpoint to generate exam with AI
app.post('/api/generate-exam', async (req, res) => {
    try {
        const { subject, difficulty = 'normal' } = req.body;
        
        if (!subject || !subject.trim()) {
            return res.status(400).json({ error: 'Subject is required' });
        }
        
        console.log(`📚 Generating exam for subject: ${subject}`);
        console.log(`📊 Difficulty level: ${difficulty}`);
        console.log(`🤖 Using model: gemini-2.5-flash-lite-preview-06-17`);
        
        // Available Gemini models:
        // - gemini-2.5-flash-lite-preview-06-17 (Latest lite model, fast and efficient)
        // - gemini-2.0-flash-exp (Experimental, fastest)
        // - gemini-1.5-flash-latest (Stable, reliable)
        // - gemini-1.5-pro-latest (More capable, slower)
        const GEMINI_MODEL = 'gemini-2.5-flash-lite-preview-06-17';
        
        // Create difficulty-specific instructions
        const difficultyInstructions = {
            beginner: "Focus on basic concepts, definitions, and fundamental principles. Use simple language and straightforward questions.",
            normal: "Include a mix of basic and intermediate concepts. Questions should test understanding and application of key principles.",
            hard: "Include complex scenarios, detailed analysis, and multi-step problem solving. Require deeper understanding.",
            veteran: "Include advanced concepts, critical thinking, and synthesis of multiple topics. Questions should be challenging.",
            extreme: "Include expert-level questions, cutting-edge topics, and complex theoretical scenarios. Push the boundaries of knowledge."
        };

        const difficultyText = difficultyInstructions[difficulty] || difficultyInstructions.normal;

        // Create the prompt for Gemini with strict formatting requirements
        const prompt = `Generate a ${subject} exam at ${difficulty.toUpperCase()} difficulty level in EXACT markdown format. 

DIFFICULTY REQUIREMENTS: ${difficultyText}

Follow this template PRECISELY:

# ${subject} Mock Exam

## Section A: Multiple Choice (20 Marks)

1. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

2. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

3. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

4. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

5. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

## Section B: Multiple Choice (20 Marks)

6. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

7. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

8. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

9. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

10. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

## Section C: Multiple Choice (20 Marks)

11. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

12. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

13. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

14. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

15. [Write a ${subject} question here]?
a) [Option A]
b) [Option B]
c) [Option C]
d) [Option D]

---

# Answers

## Section A
1. a) [Correct answer text] || **Explanation:** [Detailed explanation]
2. b) [Correct answer text] || **Explanation:** [Detailed explanation]
3. c) [Correct answer text] || **Explanation:** [Detailed explanation]
4. d) [Correct answer text] || **Explanation:** [Detailed explanation]
5. a) [Correct answer text] || **Explanation:** [Detailed explanation]

## Section B
6. b) [Correct answer text] || **Explanation:** [Detailed explanation]
7. c) [Correct answer text] || **Explanation:** [Detailed explanation]
8. d) [Correct answer text] || **Explanation:** [Detailed explanation]
9. a) [Correct answer text] || **Explanation:** [Detailed explanation]
10. b) [Correct answer text] || **Explanation:** [Detailed explanation]

## Section C
11. c) [Correct answer text] || **Explanation:** [Detailed explanation]
12. d) [Correct answer text] || **Explanation:** [Detailed explanation]
13. a) [Correct answer text] || **Explanation:** [Detailed explanation]
14. b) [Correct answer text] || **Explanation:** [Detailed explanation]
15. c) [Correct answer text] || **Explanation:** [Detailed explanation]

CRITICAL RULES:
- Replace ALL bracketed placeholders with actual ${subject} content
- Use ONLY lowercase letters (a, b, c, d) for options
- Questions MUST start with number, period, space: "1. "
- Options MUST start with letter, parenthesis, space: "a) "
- Answers MUST use format: "1. a) [text] || **Explanation:** [text]"
- Keep the "---" separator between questions and answers
- Generate exactly 15 questions total
- All questions must be multiple choice with 4 options each
- Make questions relevant to ${subject} at ${difficulty.toUpperCase()} difficulty level
- ${difficultyText}
- Ensure all questions are appropriate for the ${difficulty} difficulty level
- Provide detailed explanations that match the difficulty level`;

        // Make API call to Gemini 2.5 Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid response from Gemini API');
        }
        
        const generatedContent = data.candidates[0].content.parts[0].text;
        
        console.log('📝 Generated content preview:');
        console.log(generatedContent.substring(0, 500) + '...');
        
        // Create filename based on subject (for download)
        const filename = `${subject.toLowerCase().replace(/[^a-z0-9]/g, '_')}_exam.md`;
        
        console.log(`✅ Generated exam for: ${subject}`);
        
        // Return content directly - browser will handle storage and download
        res.json({
            success: true,
            content: generatedContent,
            filename: filename,
            message: `Successfully generated ${subject} exam!`
        });
        
    } catch (error) {
        console.error('Error generating exam:', error);
        res.status(500).json({ 
            error: 'Failed to generate exam', 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        hasApiKey: !!GEMINI_API_KEY
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Exam Platform server running on port ${PORT}`);
    console.log(`🔑 Gemini API Key: ${GEMINI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`🤖 AI Model: Gemini 2.5 Flash Lite (Preview 06-17)`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
