const initialView = document.getElementById('initialView');
const examFile = document.getElementById('examFile');
const examArea = document.getElementById('examArea');
const questionContainer = document.getElementById('questionContainer');
const answerContainer = document.getElementById('answerContainer');
const checkBtn = document.getElementById('checkBtn');
const nextBtn = document.getElementById('nextBtn');
const resultsArea = document.getElementById('resultsArea');
const scoreEl = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
const progressBar = document.getElementById('progressBar');

// New elements for dropdown functionality
const generatedExamSelect = document.getElementById('generatedExamSelect');
const loadGeneratedExamBtn = document.getElementById('loadGeneratedExam');
const generatePrebuiltExamBtn = document.getElementById('generatePrebuiltExam');
const prebuiltDifficultySelect = document.getElementById('prebuiltDifficultySelect');
const prebuiltQuestionCountSelect = document.getElementById('prebuiltQuestionCountSelect');

// New elements for back button and score tracking
const backBtn = document.getElementById('backBtn');
const backFromResultsBtn = document.getElementById('backFromResultsBtn');
const scoreHistoryList = document.getElementById('scoreHistoryList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const downloadExamBtn = document.getElementById('downloadExamBtn');
const startExamBtn = document.getElementById('startExamBtn');

// AI Generation elements
const generateExamBtn = document.getElementById('generateExamBtn');
const aiProgress = document.getElementById('aiProgress');
const progressText = document.getElementById('progressText');
const subjectInput = document.getElementById('subjectInput');
const aiDifficultySelect = document.getElementById('aiDifficultySelect');
const aiQuestionCountSelect = document.getElementById('aiQuestionCountSelect');
const successMessage = document.getElementById('successMessage');

// Stored Exams Management elements
const storedExamsList = document.getElementById('storedExamsList');
const noStoredExams = document.getElementById('noStoredExams');
const refreshStoredExamsBtn = document.getElementById('refreshStoredExams');
const downloadAllExamsBtn = document.getElementById('downloadAllExams');
const clearAllExamsBtn = document.getElementById('clearAllExams');

let questions = [];
let answers = [];
let currentQuestionIndex = 0;
let score = 0;
let currentSubject = '';
let currentExamContent = '';
let currentExamFilename = '';

// Score tracking
let scoreHistory = JSON.parse(localStorage.getItem('examScoreHistory')) || [];

// Event listener for file upload
examFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        const content = e.target.result;
        [questions, answers] = parseMarkdown(content);
        if (questions.length > 0) {
            // Set current subject for score tracking (use filename without extension)
            currentSubject = file.name.replace('.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            currentExamContent = content;
            currentExamFilename = file.name;
            
            // Store the uploaded exam
            storeExam(currentSubject, content, file.name);
            
            initialView.classList.add('hidden');
            examArea.classList.remove('hidden');
            startExam();
        }
    };

    reader.readAsText(file);
});

// Event listener for generated exam selection
loadGeneratedExamBtn.addEventListener('click', async () => {
    const selectedExam = generatedExamSelect.value;
    if (!selectedExam) {
        alert('Please select an exam from the dropdown.');
        return;
    }
    
    try {
        // Show loading indicator
        loadGeneratedExamBtn.textContent = 'Loading...';
        loadGeneratedExamBtn.disabled = true;
        
        // Use embedded exam data for GitHub Pages compatibility
        const content = getExamContent(selectedExam);
        
        if (!content) {
            throw new Error('Exam content not found');
        }
        
        [questions, answers] = parseMarkdown(content);
        
        if (questions.length > 0) {
            // Set current subject for score tracking
            currentSubject = selectedExam.replace('_exam.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            currentExamContent = content;
            currentExamFilename = selectedExam;
            
            // Store the loaded exam
            storeExam(currentSubject, content, selectedExam);
            
            initialView.classList.add('hidden');
            examArea.classList.remove('hidden');
            startExam();
        } else {
            alert('Failed to parse the exam file. Please check the format.');
        }
        
    } catch (error) {
        console.error('Error loading exam:', error);
        alert('Error loading exam: ' + error.message);
    } finally {
        // Restore button state
        loadGeneratedExamBtn.textContent = 'Load Selected Exam';
        loadGeneratedExamBtn.disabled = false;
    }
});

// Event listener for generate prebuilt exam
generatePrebuiltExamBtn.addEventListener('click', async () => {
    const selectedExam = generatedExamSelect.value;
    const difficulty = prebuiltDifficultySelect.value;
    const questionCount = prebuiltQuestionCountSelect.value;
    
    if (!selectedExam) {
        alert('Please select a subject from the dropdown.');
        return;
    }
    
    try {
        // Show loading indicator
        generatePrebuiltExamBtn.textContent = 'Generating...';
        generatePrebuiltExamBtn.disabled = true;
        
        // Extract subject name from filename
        const subject = selectedExam.replace('_exam.md', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Make API call to backend
        const response = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: subject,
                difficulty: difficulty,
                questionCount: parseInt(questionCount)
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate exam');
        }
        
        const data = await response.json();
        
        // Parse and validate the generated content
        const [parsedQuestions, parsedAnswers] = parseMarkdown(data.content);
        
        if (parsedQuestions.length === 0) {
            throw new Error(`Generated content could not be parsed. Please try again.`);
        }
        
        // Load the exam
        questions = parsedQuestions;
        answers = parsedAnswers;
        currentSubject = subject + ` (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`;
        currentExamContent = data.content;
        currentExamFilename = data.filename;
        
        // Store the generated exam
        storeExam(currentSubject, data.content, data.filename, difficulty, questionCount);
        
        // Start exam immediately
        initialView.classList.add('hidden');
        examArea.classList.remove('hidden');
        startExam();
        
    } catch (error) {
        console.error('Error generating prebuilt exam:', error);
        alert('Error generating exam: ' + error.message);
    } finally {
        // Restore button state
        generatePrebuiltExamBtn.textContent = '🤖 Generate New';
        generatePrebuiltExamBtn.disabled = false;
    }
});

function startExam() {
    currentQuestionIndex = 0;
    score = 0;
    displayCurrentQuestion();
}

function parseMarkdown(content) {
    const sections = content.split('---');
    if (sections.length < 2) return [[], []];

    const questionsText = sections[0];
    const answersText = sections[1];

    const questions = [];
    let currentQuestion = null;

    const questionLines = questionsText.split('\n');

    for (const line of questionLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+\.\s/)) { // It's a new question
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                text: trimmedLine,
                options: []
            };
        } else if (trimmedLine.match(/^[a-d]\)\s/)) { // It's an option
            if (currentQuestion) {
                currentQuestion.options.push(trimmedLine);
            }
        } else if (trimmedLine.match(/^##\s/)) { // It's a section header
            // Skip section headers
        } else if (trimmedLine.match(/^#\s/)) { // It's the title
            // Skip title
        } else if (trimmedLine.length > 0) { // It's part of the question text
            if (currentQuestion) {
                currentQuestion.text += ' ' + trimmedLine;
            }
        }
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    // Parse answers
    const answers = [];
    const answerLines = answersText.split('\n');
    
    for (const line of answerLines) {
        const trimmedLine = line.trim();
        if (trimmedLine.match(/^\d+\.\s/)) { // It's an answer
            const parts = trimmedLine.split('||');
            if (parts.length >= 2) {
                const answerPart = parts[0].trim();
                const explanationPart = parts[1].trim();
                
                // Extract the correct option (a, b, c, or d)
                const optionMatch = answerPart.match(/^\d+\.\s+([a-d])\)/);
                if (optionMatch) {
                    const correctOption = optionMatch[1];
                    answers.push({
                        correct: correctOption,
                        explanation: explanationPart
                    });
                }
            }
        }
    }

    return [questions, answers];
}

function displayCurrentQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const question = questions[currentQuestionIndex];
    const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBar.style.width = progressPercentage + '%';

    questionContainer.innerHTML = `
        <div class="question-header">
            <div class="question-number">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
        </div>
        <div class="question-text">${question.text}</div>
        <div class="options-grid">
            ${question.options.map(option => `
                <div class="option">
                    <input type="radio" name="answer" value="${option.charAt(0)}" id="option-${option.charAt(0)}">
                    <label for="option-${option.charAt(0)}" class="option-label">
                        <div class="option-indicator"></div>
                        <div class="option-text">${option}</div>
                    </label>
                </div>
            `).join('')}
        </div>
    `;

    answerContainer.innerHTML = '';
    answerContainer.classList.remove('correct', 'incorrect');
    checkBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    
    // Render MathJax after content is inserted
    renderMathJax();
}

// Function to render MathJax
function renderMathJax() {
    // Wait for MathJax to be fully loaded
    const maxRetries = 50; // Maximum 5 seconds (50 * 100ms)
    let retryCount = 0;
    
    function tryRender() {
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            try {
                MathJax.typesetPromise([questionContainer, answerContainer]).catch(function (err) {
                    console.log('MathJax rendering error:', err.message);
                });
            } catch (error) {
                console.log('MathJax typesetPromise error:', error);
            }
        } else if (typeof MathJax !== 'undefined' && MathJax.Hub) {
            // Fallback for older MathJax versions
            try {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, questionContainer]);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, answerContainer]);
            } catch (error) {
                console.log('MathJax Hub error:', error);
            }
        } else if (retryCount < maxRetries) {
            // MathJax not loaded yet, retry after a short delay
            retryCount++;
            setTimeout(tryRender, 100);
        } else {
            console.log('MathJax failed to load after maximum retries');
        }
    }
    
    tryRender();
}

checkBtn.addEventListener('click', () => {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) {
        alert('Please select an answer.');
        return;
    }

    const userAnswer = selectedAnswer.value;
    const correctAnswer = answers[currentQuestionIndex].correct;
    const explanation = answers[currentQuestionIndex].explanation;

    if (userAnswer === correctAnswer) {
        score++;
        answerContainer.innerHTML = `
            <div class="feedback correct">
                <h4>🎉 Correct!</h4>
                <p>${explanation}</p>
            </div>
        `;
    } else {
        answerContainer.innerHTML = `
            <div class="feedback incorrect">
                <h4>❌ Incorrect</h4>
                <p><strong>The correct answer is:</strong> ${correctAnswer.toUpperCase()})</p>
                <p>${explanation}</p>
            </div>
        `;
    }

    checkBtn.classList.add('hidden');
    nextBtn.classList.remove('hidden');
    
    // Render MathJax after feedback is inserted
    renderMathJax();
});

nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    displayCurrentQuestion();
});

function showResults() {
    examArea.classList.add('hidden');
    resultsArea.classList.remove('hidden');
    
    const percentage = Math.round((score / questions.length) * 100);
    const grade = getGrade(percentage);
    
    // Update score display
    document.getElementById('score').textContent = `${percentage}%`;
    document.getElementById('scoreText').textContent = `${score}/${questions.length}`;
    document.getElementById('percentageText').textContent = `${percentage}%`;
    document.getElementById('gradeText').textContent = grade;
    
    // Update results card title based on performance
    const resultsTitle = document.querySelector('#resultsArea .card h2');
    if (percentage >= 90) {
        resultsTitle.textContent = '🏆 Outstanding Performance!';
    } else if (percentage >= 80) {
        resultsTitle.textContent = '🎉 Excellent Work!';
    } else if (percentage >= 70) {
        resultsTitle.textContent = '👍 Good Job!';
    } else if (percentage >= 60) {
        resultsTitle.textContent = '📚 Keep Practicing!';
    } else {
        resultsTitle.textContent = '💪 Room for Improvement!';
    }
    
    // Save score to history
    saveScoreToHistory(currentSubject, score, questions.length, percentage);
    displayScoreHistory();
}

function getGrade(percentage) {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 63) return 'D';
    if (percentage >= 60) return 'D-';
    return 'F';
}

restartBtn.addEventListener('click', () => {
    resultsArea.classList.add('hidden');
    initialView.classList.remove('hidden');
    questions = [];
    answers = [];
    currentQuestionIndex = 0;
    score = 0;
    currentSubject = '';
    currentExamContent = '';
    currentExamFilename = '';
    progressBar.style.width = '0%';
    examFile.value = '';
    generatedExamSelect.value = '';
    subjectInput.value = '';
    aiProgress.classList.add('hidden');
    successMessage.classList.add('hidden');
    generateExamBtn.disabled = false;
    generateExamBtn.textContent = '✨ Generate Exam Instantly';
});

// Back button functionality
backBtn.addEventListener('click', () => {
    examArea.classList.add('hidden');
    resultsArea.classList.add('hidden');
    initialView.classList.remove('hidden');
    questions = [];
    answers = [];
    currentQuestionIndex = 0;
    score = 0;
    currentSubject = '';
    currentExamContent = '';
    currentExamFilename = '';
    progressBar.style.width = '0%';
    successMessage.classList.add('hidden');
});

backFromResultsBtn.addEventListener('click', () => {
    resultsArea.classList.add('hidden');
    initialView.classList.remove('hidden');
    questions = [];
    answers = [];
    currentQuestionIndex = 0;
    score = 0;
    currentSubject = '';
    currentExamContent = '';
    currentExamFilename = '';
    progressBar.style.width = '0%';
    successMessage.classList.add('hidden');
});

// Score tracking functions
function saveScoreToHistory(subject, score, totalQuestions, percentage) {
    const scoreEntry = {
        subject: subject || 'Unknown Subject',
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        grade: getGrade(percentage),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    scoreHistory.unshift(scoreEntry); // Add to beginning of array
    
    // Keep only last 10 scores
    if (scoreHistory.length > 10) {
        scoreHistory = scoreHistory.slice(0, 10);
    }
    
    localStorage.setItem('examScoreHistory', JSON.stringify(scoreHistory));
}

function displayScoreHistory() {
    if (scoreHistory.length === 0) {
        scoreHistoryList.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-style: italic;">No exam scores yet. Complete an exam to see your history!</p>';
        return;
    }
    
    const historyHTML = scoreHistory.map(entry => `
        <div style="padding: 0.75rem; background: var(--surface-light); border-radius: 8px; margin-bottom: 0.5rem; border-left: 4px solid var(--primary-color);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${entry.subject}</strong>
                    <div style="font-size: 0.9rem; color: var(--text-muted);">${entry.date} at ${entry.time}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-color);">${entry.percentage}%</div>
                    <div style="font-size: 0.9rem; color: var(--text-muted);">${entry.score}/${entry.totalQuestions} (${entry.grade})</div>
                </div>
            </div>
        </div>
    `).join('');
    
    scoreHistoryList.innerHTML = historyHTML;
}

// Clear score history
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your score history?')) {
        scoreHistory = [];
        localStorage.removeItem('examScoreHistory');
        displayScoreHistory();
    }
});

// Download functionality (browser-side)
downloadExamBtn.addEventListener('click', () => {
    if (currentExamContent && currentExamFilename) {
        // Create blob from content
        const blob = new Blob([currentExamContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        // Create temporary download link
        const a = document.createElement('a');
        a.href = url;
        a.download = currentExamFilename;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`📥 Downloaded exam: ${currentExamFilename}`);
    } else {
        alert('No exam content available for download');
    }
});

// Start Exam button functionality
startExamBtn.addEventListener('click', () => {
    if (questions.length > 0) {
        initialView.classList.add('hidden');
        examArea.classList.remove('hidden');
        startExam();
    }
});

// Initialize score history display
displayScoreHistory();

// Main AI generation function
async function generateExamWithAI() {
    const subject = subjectInput.value.trim();
    const difficulty = aiDifficultySelect.value;
    const questionCount = aiQuestionCountSelect.value;
    
    if (!subject) {
        alert('Please enter a subject for your exam.');
        subjectInput.focus();
        return;
    }
    
    // Show progress
    aiProgress.classList.remove('hidden');
    successMessage.classList.add('hidden');
    generateExamBtn.disabled = true;
    generateExamBtn.textContent = '⏳ Creating...';
    progressText.textContent = 'Sending request to AI...';
    
    try {
        // Make API call to backend
        const response = await fetch('/api/generate-exam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject: subject,
                difficulty: difficulty,
                questionCount: parseInt(questionCount)
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate exam');
        }
        
        const data = await response.json();
        
        progressText.textContent = 'Processing generated content...';
        
        // Parse and validate the generated content
        console.log('🔍 Parsing generated content...');
        console.log('Content preview:', data.content.substring(0, 300));
        
        const [parsedQuestions, parsedAnswers] = parseMarkdown(data.content);
        
        console.log('📊 Parsing results:');
        console.log('Questions found:', parsedQuestions.length);
        console.log('Answers found:', parsedAnswers.length);
        
        if (parsedQuestions.length === 0) {
            console.error('❌ No questions could be parsed from:', data.content.substring(0, 500));
            throw new Error(`Generated content could not be parsed. Found ${parsedQuestions.length} questions and ${parsedAnswers.length} answers. Please try again.`);
        }
        
        // Load the exam
        questions = parsedQuestions;
        answers = parsedAnswers;
        currentSubject = subject;
        currentExamContent = data.content;
        currentExamFilename = data.filename;
        
        // Store the generated exam
        storeExam(subject, data.content, data.filename, difficulty, questionCount);
        
        // Hide progress and show success
        aiProgress.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
        // Note: Auto-start removed - user now manually clicks "Start Exam" button
        
    } catch (error) {
        console.error('Error generating exam:', error);
        
        // Hide progress
        aiProgress.classList.add('hidden');
        successMessage.classList.add('hidden');
        
        // Show error message
        let errorMessage = 'Failed to generate exam. ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Please make sure the server is running. Run "npm start" in the terminal first.';
        } else {
            errorMessage += error.message;
        }
        
        alert(errorMessage);
        
    } finally {
        // Restore button state
        generateExamBtn.disabled = false;
        generateExamBtn.textContent = '✨ Generate Exam Instantly';
    }
}

// Add event listener for generate button
generateExamBtn.addEventListener('click', generateExamWithAI);

// Allow Enter key to generate exam
subjectInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateExamWithAI();
    }
});

// Color customization functionality
const customizeBtn = document.getElementById('customizeBtn');
const customizeModal = document.getElementById('customizeModal');
const closeModal = document.getElementById('closeModal');
const accentColorInput = document.getElementById('accentColor');
const backgroundHueInput = document.getElementById('backgroundHue');
const accentPreview = document.getElementById('accentPreview');
const backgroundPreview = document.getElementById('backgroundPreview');
const presetBtns = document.querySelectorAll('.preset-btn');
const applyColorsBtn = document.getElementById('applyColors');
const resetColorsBtn = document.getElementById('resetColors');

// Initialize modal as hidden
customizeModal.classList.add('hidden');

// Load saved color preferences
function loadColorPreferences() {
    const savedAccent = localStorage.getItem('accentColor') || '#6366f1';
    const savedHue = localStorage.getItem('backgroundHue') || '220';
    
    accentColorInput.value = savedAccent;
    backgroundHueInput.value = savedHue;
    
    updatePreviews();
    applyColors();
}

// Update color previews
function updatePreviews() {
    const accentColor = accentColorInput.value;
    const backgroundHue = backgroundHueInput.value;
    
    accentPreview.style.backgroundColor = accentColor;
    backgroundPreview.style.backgroundColor = `hsl(${backgroundHue}, 50%, 50%)`;
}

// Apply colors to the page
function applyColors() {
    const accentColor = accentColorInput.value;
    const backgroundHue = backgroundHueInput.value;
    
    const root = document.documentElement;
    root.style.setProperty('--primary-color', accentColor);
    root.style.setProperty('--primary-light', adjustBrightness(accentColor, 20));
    root.style.setProperty('--primary-dark', adjustBrightness(accentColor, -20));
    
    // Update gradient with new accent color
    const gradientPrimary = `linear-gradient(135deg, ${accentColor} 0%, ${adjustBrightness(accentColor, 10)} 50%, ${adjustBrightness(accentColor, 20)} 100%)`;
    root.style.setProperty('--gradient-primary', gradientPrimary);
    
    // Update background animation color
    const backgroundAnimationColor = `hsl(${backgroundHue}, 30%, 10%)`;
    root.style.setProperty('--background', backgroundAnimationColor);
    
    // Update surface colors based on hue
    const surfaceColor = `hsl(${backgroundHue}, 20%, 15%)`;
    const surfaceLightColor = `hsl(${backgroundHue}, 15%, 20%)`;
    root.style.setProperty('--surface', surfaceColor);
    root.style.setProperty('--surface-light', surfaceLightColor);
    
    // Update border colors
    const borderColor = `hsl(${backgroundHue}, 15%, 20%)`;
    const borderLightColor = `hsl(${backgroundHue}, 10%, 28%)`;
    root.style.setProperty('--border', borderColor);
    root.style.setProperty('--border-light', borderLightColor);
    
    // Update background animation
    updateBackgroundAnimation(backgroundHue);
}

// Update background animation with new hue
function updateBackgroundAnimation(hue) {
    const style = document.createElement('style');
    style.textContent = `
        body::before {
            background: 
                radial-gradient(circle at 20% 20%, hsla(${hue}, 70%, 60%, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, hsla(${(parseInt(hue) + 40) % 360}, 70%, 60%, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 40% 60%, hsla(${(parseInt(hue) + 80) % 360}, 70%, 60%, 0.06) 0%, transparent 50%);
        }
    `;
    
    // Remove existing custom style
    const existingStyle = document.querySelector('style[data-custom-bg]');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    style.setAttribute('data-custom-bg', 'true');
    document.head.appendChild(style);
}

// Utility function to adjust color brightness
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

// Event listeners for customization
customizeBtn.addEventListener('click', () => {
    customizeModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
    customizeModal.classList.add('hidden');
});

// Close modal when clicking outside
customizeModal.addEventListener('click', (e) => {
    if (e.target === customizeModal) {
        customizeModal.classList.add('hidden');
    }
});

// Update previews when inputs change
accentColorInput.addEventListener('input', updatePreviews);
backgroundHueInput.addEventListener('input', updatePreviews);

// Preset buttons
presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const accent = btn.dataset.accent;
        const hue = btn.dataset.hue;
        
        accentColorInput.value = accent;
        backgroundHueInput.value = hue;
        updatePreviews();
    });
});

// Apply colors button
applyColorsBtn.addEventListener('click', () => {
    applyColors();
    
    // Save preferences
    localStorage.setItem('accentColor', accentColorInput.value);
    localStorage.setItem('backgroundHue', backgroundHueInput.value);
    
    // Close modal
    customizeModal.classList.add('hidden');
    
    // Show success feedback
    const originalText = applyColorsBtn.textContent;
    applyColorsBtn.textContent = '✅ Applied!';
    
    setTimeout(() => {
        applyColorsBtn.textContent = originalText;
    }, 1500);
});

// Reset colors button
resetColorsBtn.addEventListener('click', () => {
    accentColorInput.value = '#6366f1';
    backgroundHueInput.value = '220';
    updatePreviews();
    
    // Clear saved preferences
    localStorage.removeItem('accentColor');
    localStorage.removeItem('backgroundHue');
});

// Initialize color preferences on page load
document.addEventListener('DOMContentLoaded', () => {
    loadColorPreferences();
    refreshStoredExamsList();
    
    // Additional MathJax initialization for GitHub Pages compatibility
    if (typeof MathJax !== 'undefined') {
        console.log('MathJax available on DOMContentLoaded');
    } else {
        console.log('MathJax not yet available on DOMContentLoaded');
        // Set up a listener for when MathJax loads
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (typeof MathJax !== 'undefined') {
                    console.log('MathJax available after window load');
                } else {
                    console.log('MathJax still not available after window load');
                }
            }, 1000);
        });
    }
});

// ===== STORED EXAMS MANAGEMENT =====

// Stored Exams Management Event Listeners
refreshStoredExamsBtn.addEventListener('click', refreshStoredExamsList);
downloadAllExamsBtn.addEventListener('click', downloadAllStoredExams);
clearAllExamsBtn.addEventListener('click', clearAllStoredExams);

// Stored Exams Management Functions
function refreshStoredExamsList() {
    const storedExams = getStoredExams();
    
    if (storedExams.length === 0) {
        noStoredExams.style.display = 'block';
        downloadAllExamsBtn.style.display = 'none';
        clearAllExamsBtn.style.display = 'none';
        
        // Clear the list container
        const examItems = storedExamsList.querySelectorAll('.stored-exam-item');
        examItems.forEach(item => item.remove());
    } else {
        noStoredExams.style.display = 'none';
        downloadAllExamsBtn.style.display = 'inline-block';
        clearAllExamsBtn.style.display = 'inline-block';
        
        // Clear existing items
        const examItems = storedExamsList.querySelectorAll('.stored-exam-item');
        examItems.forEach(item => item.remove());
        
        // Add stored exams to the list
        storedExams.forEach((exam, index) => {
            const examItem = createStoredExamItem(exam, index);
            storedExamsList.insertBefore(examItem, noStoredExams);
        });
    }
}

function getStoredExams() {
    const exams = [];
    
    // Get all localStorage keys that start with 'exam_'
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('exam_')) {
            try {
                const examData = JSON.parse(localStorage.getItem(key));
                examData.key = key;
                examData.storageDate = examData.storageDate || new Date().toISOString();
                exams.push(examData);
            } catch (error) {
                console.warn(`Could not parse stored exam: ${key}`, error);
            }
        }
    }
    
    // Sort by storage date (newest first)
    return exams.sort((a, b) => new Date(b.storageDate) - new Date(a.storageDate));
}

function createStoredExamItem(exam, index) {
    const examItem = document.createElement('div');
    examItem.className = 'stored-exam-item';
    examItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        margin-bottom: 0.75rem;
        background: var(--surface-light);
        border: 1px solid var(--border);
        border-radius: var(--border-radius);
        transition: var(--transition);
    `;
    
    // Add hover effect
    examItem.addEventListener('mouseenter', () => {
        examItem.style.borderColor = 'var(--primary-color)';
        examItem.style.background = 'var(--surface)';
    });
    
    examItem.addEventListener('mouseleave', () => {
        examItem.style.borderColor = 'var(--border)';
        examItem.style.background = 'var(--surface-light)';
    });
    
    const examInfo = document.createElement('div');
    examInfo.style.cssText = 'flex: 1;';
    
    const examTitle = document.createElement('div');
    examTitle.style.cssText = 'font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem;';
    examTitle.textContent = exam.subject || `Exam ${index + 1}`;
    
    const examDetails = document.createElement('div');
    examDetails.style.cssText = 'font-size: 0.85rem; color: var(--text-muted);';
    
    // Use stored question count if available, otherwise count from content
    const questionsCount = exam.questionCount || (exam.content ? exam.content.split('\n').filter(line => /^\d+\./.test(line.trim())).length : 0);
    const storedDate = new Date(exam.storageDate).toLocaleDateString();
    const difficulty = exam.difficulty ? ` • ${exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}` : '';
    
    examDetails.textContent = `${questionsCount} questions • Stored: ${storedDate}${difficulty}`;
    
    examInfo.appendChild(examTitle);
    examInfo.appendChild(examDetails);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';
    
    // Continue/Start button
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary';
    continueBtn.style.cssText = 'font-size: 0.85rem; padding: 0.5rem 1rem;';
    continueBtn.textContent = '🚀 Start';
    continueBtn.addEventListener('click', () => {
        loadStoredExam(exam);
    });
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-secondary';
    downloadBtn.style.cssText = 'font-size: 0.85rem; padding: 0.5rem 1rem;';
    downloadBtn.textContent = '📥';
    downloadBtn.title = 'Download Exam';
    downloadBtn.addEventListener('click', () => {
        downloadStoredExam(exam);
    });
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.style.cssText = 'font-size: 0.85rem; padding: 0.5rem 1rem; background: var(--danger-color, #dc2626); border-color: var(--danger-color, #dc2626); color: white;';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Delete Exam';
    deleteBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${exam.subject || 'this exam'}"?`)) {
            localStorage.removeItem(exam.key);
            refreshStoredExamsList();
        }
    });
    
    buttonGroup.appendChild(continueBtn);
    buttonGroup.appendChild(downloadBtn);
    buttonGroup.appendChild(deleteBtn);
    
    examItem.appendChild(examInfo);
    examItem.appendChild(buttonGroup);
    
    return examItem;
}

function loadStoredExam(exam) {
    try {
        // Parse the stored exam content
        const [parsedQuestions, parsedAnswers] = parseMarkdown(exam.content);
        
        if (parsedQuestions.length === 0) {
            throw new Error('No valid questions found in stored exam');
        }
        
        // Load the exam
        questions = parsedQuestions;
        answers = parsedAnswers;
        currentSubject = exam.subject || 'Stored Exam';
        currentExamContent = exam.content;
        currentExamFilename = exam.filename || `${exam.subject || 'exam'}.md`;
        
        // Start exam
        initialView.classList.add('hidden');
        examArea.classList.remove('hidden');
        startExam();
        
    } catch (error) {
        console.error('Error loading stored exam:', error);
        alert('Error loading exam: ' + error.message);
    }
}

function downloadStoredExam(exam) {
    try {
        const filename = exam.filename || `${exam.subject || 'exam'}.md`;
        const blob = new Blob([exam.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error downloading exam:', error);
        alert('Error downloading exam: ' + error.message);
    }
}

function downloadAllStoredExams() {
    try {
        const storedExams = getStoredExams();
        
        if (storedExams.length === 0) {
            alert('No stored exams to download');
            return;
        }
        
        // Create a zip-like structure by combining all exams
        let allExamsContent = '# All Stored Exams\n\n';
        allExamsContent += `Generated on: ${new Date().toLocaleString()}\n`;
        allExamsContent += `Total exams: ${storedExams.length}\n\n`;
        allExamsContent += '---\n\n';
        
        storedExams.forEach((exam, index) => {
            const questionCount = exam.questionCount || (exam.content ? exam.content.split('\n').filter(line => /^\d+\./.test(line.trim())).length : 0);
            allExamsContent += `# Exam ${index + 1}: ${exam.subject || 'Untitled'}\n`;
            allExamsContent += `Difficulty: ${exam.difficulty || 'Not specified'}\n`;
            allExamsContent += `Questions: ${questionCount}\n`;
            allExamsContent += `Stored: ${new Date(exam.storageDate).toLocaleString()}\n\n`;
            allExamsContent += exam.content;
            allExamsContent += '\n\n---\n\n';
        });
        
        const blob = new Blob([allExamsContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_exams_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error downloading all exams:', error);
        alert('Error downloading exams: ' + error.message);
    }
}

function clearAllStoredExams() {
    const storedExams = getStoredExams();
    
    if (storedExams.length === 0) {
        alert('No stored exams to clear');
        return;
    }
    
    const confirmMessage = `Are you sure you want to delete all ${storedExams.length} stored exam(s)? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
        // Remove all exam-related items from localStorage
        storedExams.forEach(exam => {
            localStorage.removeItem(exam.key);
        });
        
        refreshStoredExamsList();
        alert('All stored exams have been cleared');
    }
}

// Function to store exam (call this when generating/loading exams)
function storeExam(subject, content, filename, difficulty = null, questionCount = null) {
    try {
        const examData = {
            subject: subject,
            content: content,
            filename: filename,
            difficulty: difficulty,
            questionCount: questionCount,
            storageDate: new Date().toISOString()
        };
        
        const key = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(key, JSON.stringify(examData));
        
        // Refresh the list if we're on the main page
        if (!examArea.classList.contains('hidden') === false) {
            setTimeout(refreshStoredExamsList, 100);
        }
        
    } catch (error) {
        console.warn('Could not store exam:', error);
    }
}

// Load stored exams on page load
loadStoredExams();
