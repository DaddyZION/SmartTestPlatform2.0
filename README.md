# Smart Exam Platform

A modern, interactive exam platform with instant feedback and detailed explanations.

## Features

- **🚀 Automated AI Generation:** Generate custom exams instantly using Google's Gemini AI
- **📚 16 Pre-built Exams:** Ready-to-use exams covering various subjects
- **📁 Custom Upload:** Upload your own markdown exam files
- **🎨 Customizable Themes:** Personalize colors and appearance
- **📊 Progress Tracking:** Detailed results and performance analytics
- **📱 Responsive Design:** Works perfectly on all devices
- **🔢 Math Support:** Full LaTeX mathematical notation rendering

## Files Structure

```
NewMock/
├── index.html          # Main HTML file
├── style.css           # Styling
├── script.js           # JavaScript functionality
├── exam-data.js        # Embedded exam data
└── README.md          # This file
```

## How to Use Locally

1. **Open the application:**
   - Simply double-click `index.html` to open in your browser
   - Or right-click and select "Open with" your preferred browser

2. **Start taking exams:**
   - Choose from 16 pre-built exams in the dropdown
   - Or upload your own markdown (.md) exam files
   - Or use the AI template to generate new exams

## How to Deploy to GitHub Pages

1. **Create a new GitHub repository:**
   - Go to GitHub and create a new repository
   - Name it whatever you like (e.g., "smart-exam-platform")

2. **Upload your files:**
   - Upload all files (`index.html`, `style.css`, `script.js`, `exam-data.js`) to the repository
   - Make sure the main file is named `index.html`

3. **Enable GitHub Pages:**
   - Go to your repository settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

4. **Access your site:**
   - Your site will be available at: `https://yourusername.github.io/repository-name`
   - It may take a few minutes to become active

## API Key Setup

### Getting Your Free Google Gemini API Key

1. **Visit Google AI Studio:**
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key:**
   - Click "Create API Key"
   - Choose "Create API key in new project" or select an existing project
   - Copy the generated API key

3. **Important Notes:**
   - The API key is free with generous usage limits
   - Your API key is stored locally in your browser
   - Never share your API key with others
   - You can regenerate your key anytime if needed

### Privacy & Security

- API keys are stored locally in your browser only
- No data is sent to our servers
- All communication is directly between your browser and Google's API
- You can clear your API key anytime by clearing browser storage

## Creating Custom Exams

### Automated AI Generation (Recommended)

1. **Get your API key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a free account and generate your API key
   - Copy the API key

2. **Generate your exam:**
   - Enter your API key in the platform
   - Type your desired subject (e.g., "Biology", "World History", "Calculus")
   - Click "🚀 Generate Exam with AI"
   - Wait 10-30 seconds for generation to complete

3. **Take your exam:**
   - The exam will automatically load and start
   - A downloadable .md file will be saved to your computer
   - You can reuse the generated file anytime

### Manual AI Generation (Fallback)

If the automated generation doesn't work:

1. Click "📋 Copy Template" button
2. Paste into ChatGPT, Claude, or any AI assistant
3. Replace `[Your Topic Here]` with your desired subject
4. Save the generated content as a `.md` file
5. Upload to the platform

### Manual Creation

Create a markdown file with this structure:

```markdown
# Your Exam Title

## Section A: Multiple Choice (20 Marks)

1. Your question here?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

2. Another question?
   a) Option A
   b) Option B
   c) Option C
   d) Option D

---

# Answers

## Section A
1. a) Correct option || **Explanation:** Why this is correct
2. b) Correct option || **Explanation:** Why this is correct
```

## Customization

- Click the 🎨 button to customize colors
- Choose from preset themes or create your own
- Settings are saved automatically

## Browser Compatibility

- Works in all modern browsers
- Chrome, Firefox, Safari, Edge
- Mobile responsive design

## Troubleshooting

- **Exam not loading:** Check that your markdown file follows the correct format
- **Styles not working:** Ensure all files are in the same folder
- **JavaScript errors:** Check browser console for specific error messages

## Support

If you encounter any issues:
1. Check that all files are in the same directory
2. Ensure you're using a modern web browser
3. Check browser console for error messages
4. Make sure internet connection is available (for fonts)
