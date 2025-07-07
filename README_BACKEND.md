# Smart Exam Platform - Backend Version

An AI-powered exam platform that generates custom exams automatically using Google's Gemini AI. Users simply enter a subject and the system creates a comprehensive exam with questions, answers, and detailed explanations.

## 🚀 Features

- **Fully Automated AI Generation**: Just enter a subject and get a complete exam
- **Backend Integration**: No API keys required from users
- **Automatic File Saving**: Generated exams are saved as markdown files
- **16+ Pre-built Exams**: Ready-to-use exams on various subjects
- **Custom File Upload**: Upload your own markdown exam files
- **Mathematical Notation**: Full LaTeX support with MathJax
- **Interactive Learning**: Instant feedback and explanations
- **Progress Tracking**: Visual progress indicators and scoring
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Get your Google Gemini API key:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

3. Edit the `.env` file and add your API key:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```

### 3. Start the Server

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

### 4. Open the Application

Open your browser and go to: `http://localhost:3000`

## 🎯 How to Use

### Quick Start with AI Generation

1. **Enter a Subject**: Type any subject you want to study (e.g., "Biology", "World War II", "Calculus")
2. **Click Generate**: The system automatically creates a comprehensive exam
3. **Start Learning**: Your exam begins immediately with interactive questions

### Other Options

- **Pre-built Exams**: Choose from 16 ready-made exams on popular subjects
- **Custom Upload**: Upload your own markdown exam files
- **Customization**: Personalize colors and themes

## 📚 Exam Format

Generated exams include:
- **15 Questions Total**: 5 multiple choice, 5 true/false, 5 short answer
- **Detailed Explanations**: Each answer includes comprehensive explanations
- **Mathematical Notation**: LaTeX support for mathematical expressions
- **Progressive Difficulty**: Questions range from basic to advanced

## 🎨 Customization

- **Color Themes**: Customize accent colors and backgrounds
- **Quick Presets**: Choose from 6 pre-made color schemes
- **Persistent Settings**: Your preferences are saved locally

## 📁 File Structure

- `server.js` - Backend server with AI integration
- `index.html` - Main application interface
- `script.js` - Frontend JavaScript functionality
- `style.css` - Styling and animations
- `exam-data.js` - Pre-built exam data
- `package.json` - Dependencies and scripts

## 🔧 API Endpoints

- `POST /api/generate-exam` - Generate a new exam from a subject
- `GET /api/exams` - List all available exams
- `GET /api/health` - Server health check

## 📝 Generated Files

- Exams are automatically saved as `.md` files in the project directory
- Files are named based on the subject (e.g., `biology_exam.md`)
- Files use standard markdown format compatible with the exam platform

## 🔒 Security & Privacy

- API keys are stored securely on the backend
- No user data is transmitted to external servers
- All communication is encrypted (HTTPS in production)
- Generated exams are stored locally

## 🚨 Troubleshooting

### Server Won't Start
- Check that your `.env` file exists and has the correct API key
- Ensure no other application is using port 3000
- Run `npm install` to install dependencies

### AI Generation Fails
- Verify your Gemini API key is valid
- Check your internet connection
- Ensure you haven't exceeded API quotas

### Exam Won't Load
- Make sure the server is running (`npm start`)
- Check the browser console for error messages
- Try refreshing the page

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for exam generation
- MathJax for mathematical notation rendering
- Express.js for backend framework
