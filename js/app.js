// Enhanced Day of the Week Practice App with Multiple Game Modes
(function() {
  'use strict';

  // Game State
  let gameState = {
    gameMode: 'quick', // 'quick', 'standard', 'challenge', 'endless', 'timed', 'custom-practice'
    timedModeType: 'speed', // 'speed', 'blitz'
    dateMode: 'random',
    yearRange: { min: 1900, max: 1999 },
    currentDate: null,
    currentQuestionIndex: 0,
    totalQuestions: 5,
    correctAnswers: 0,
    wrongAnswers: 0,
    startTime: null,
    questionStartTime: null,
    gameStartTime: null,
    timerInterval: null,
    questionTimerInterval: null,
    questionTimeLimit: null,
    isGameActive: false,
    totalGameTime: 0
  };

  // Game Mode Configurations
  const gameModeConfigs = {
    quick: { questions: 5, timeLimit: null, name: 'Quick Practice' },
    standard: { questions: 10, timeLimit: null, name: 'Standard Practice' },
    challenge: { questions: 20, timeLimit: null, name: 'Challenge Mode' },
    endless: { questions: Infinity, timeLimit: null, name: 'Endless Mode' },
    timed: { 
      speed: { questions: 10, timeLimit: 10000, name: 'Speed Challenge' }, // 10 seconds per question
      blitz: { questions: 10, timeLimit: 5000, name: 'Blitz Challenge' }   // 5 seconds per question
    },
    'custom-practice': { questions: 1, timeLimit: null, name: 'Custom Date Practice' }
  };

  // DOM Elements - Setup Screen
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const resultsScreen = document.getElementById('results-screen');
  
  // Game mode elements
  const gameModeButtons = document.querySelectorAll('input[name="game-mode"]');
  const timedSettings = document.getElementById('timed-settings');
  const timedModeButtons = document.querySelectorAll('input[name="timed-mode-type"]');
  
  // Date source elements
  const yearRangeSelect = document.getElementById('year-range');
  const randomYearMin = document.getElementById('random-year-min');
  const randomYearMax = document.getElementById('random-year-max');
  const randomSettings = document.getElementById('random-settings');
  const customSettings = document.getElementById('custom-settings');
  
  // Custom date elements
  const customMonth = document.getElementById('custom-month');
  const customDay = document.getElementById('custom-day');
  const customYear = document.getElementById('custom-year');
  
  // Game screen elements
  const startBtn = document.getElementById('start-btn');
  const dateDisplay = document.getElementById('date-display');
  const dayButtons = document.querySelectorAll('.btn-day');
  const feedback = document.getElementById('feedback');
  const nextControls = document.getElementById('next-controls');
  const nextBtn = document.getElementById('next-btn');
  const nextBtnText = document.getElementById('next-btn-text');
  const newDateBtn = document.getElementById('new-date-btn');
  const backBtn = document.getElementById('back-btn');
  
  // Progress and timer elements
  const progressSection = document.getElementById('progress-section');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const correctCount = document.getElementById('correct-count');
  const wrongCount = document.getElementById('wrong-count');
  const timeChallengeBar = document.getElementById('time-challenge-bar');
  const timeRemaining = document.getElementById('time-remaining');
  const timeBar = document.getElementById('time-bar');
  const timerDisplay = document.getElementById('timer');
  const timeSpan = document.getElementById('time');
  
  // Mode indicators
  const modeIcon = document.getElementById('mode-icon');
  const modeBadge = document.getElementById('mode-badge');
  
  // Results screen elements
  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultSubtitle = document.getElementById('result-subtitle');
  const finalCorrect = document.getElementById('final-correct');
  const finalWrong = document.getElementById('final-wrong');
  const finalAccuracy = document.getElementById('final-accuracy');
  const finalTime = document.getElementById('final-time');
  const performanceMessage = document.getElementById('performance-message');
  const playAgainBtn = document.getElementById('play-again-btn');
  const tryDifferentBtn = document.getElementById('try-different-btn');

  // Constants
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Initialize Application
  function init() {
    setupEventListeners();
    initializeDefaults();
    handleGameModeChange(); // Set initial state
  }

  // Setup all event listeners
  function setupEventListeners() {
    // Setup screen events
    startBtn.addEventListener('click', handleStart);
    
    // Game mode selection
    gameModeButtons.forEach(btn => {
      btn.addEventListener('change', handleGameModeChange);
    });
    
    // Timed mode selection
    timedModeButtons.forEach(btn => {
      btn.addEventListener('change', handleTimedModeChange);
    });

    // Year range controls
    yearRangeSelect.addEventListener('change', handleCenturyChange);
    randomYearMin.addEventListener('input', handleYearInputChange);
    randomYearMax.addEventListener('input', handleYearInputChange);

    // Custom date validation
    customMonth.addEventListener('change', validateCustomDate);
    customDay.addEventListener('change', validateCustomDate);
    customYear.addEventListener('change', validateCustomDate);

    // Game screen events
    dayButtons.forEach(btn => {
      btn.addEventListener('click', handleDayClick);
    });
    nextBtn.addEventListener('click', handleNext);
    newDateBtn.addEventListener('click', handleNewDate);
    backBtn.addEventListener('click', handleBack);

    // Results screen events
    playAgainBtn.addEventListener('click', handlePlayAgain);
    tryDifferentBtn.addEventListener('click', handleTryDifferent);
  }

  // Initialize default values
  function initializeDefaults() {
    const now = new Date();
    customMonth.value = now.getMonth() + 1;
    customDay.value = now.getDate();
    customYear.value = now.getFullYear();
    handleCenturyChange();
  }

  // Event Handlers
  function handleGameModeChange() {
    const selectedMode = document.querySelector('input[name="game-mode"]:checked')?.value || 'quick';
    gameState.gameMode = selectedMode;

    // Show/hide timed settings
    if (selectedMode === 'timed') {
      timedSettings.classList.remove('d-none');
      handleTimedModeChange();
    } else {
      timedSettings.classList.add('d-none');
    }

    // Show/hide custom date settings
    if (selectedMode === 'custom-practice') {
      gameState.dateMode = 'custom';
      customSettings.classList.remove('d-none');
      randomSettings.classList.add('d-none');
    } else {
      gameState.dateMode = 'random';
      customSettings.classList.add('d-none');
      randomSettings.classList.remove('d-none');
    }

    // Update total questions based on mode
    updateGameConfiguration();
  }

  function handleTimedModeChange() {
    const selectedType = document.querySelector('input[name="timed-mode-type"]:checked')?.value || 'speed';
    gameState.timedModeType = selectedType;
    updateGameConfiguration();
  }

  function updateGameConfiguration() {
    if (gameState.gameMode === 'timed') {
      const config = gameModeConfigs.timed[gameState.timedModeType];
      gameState.totalQuestions = config.questions;
      gameState.questionTimeLimit = config.timeLimit;
    } else {
      const config = gameModeConfigs[gameState.gameMode];
      gameState.totalQuestions = config.questions;
      gameState.questionTimeLimit = config.timeLimit;
    }
  }

  function handleCenturyChange() {
    const [min, max] = yearRangeSelect.value.split('-').map(Number);
    randomYearMin.min = min;
    randomYearMin.max = max;
    randomYearMax.min = min;
    randomYearMax.max = max;
    
    if (parseInt(randomYearMin.value) < min || parseInt(randomYearMin.value) > max) {
      randomYearMin.value = min;
    }
    if (parseInt(randomYearMax.value) > max || parseInt(randomYearMax.value) < min) {
      randomYearMax.value = max;
    }
    
    handleYearInputChange();
  }

  function handleYearInputChange() {
    let min = parseInt(randomYearMin.value);
    let max = parseInt(randomYearMax.value);
    
    if (min > max) randomYearMax.value = min;
    if (max < min) randomYearMin.value = max;
    
    gameState.yearRange = { 
      min: Math.min(min, max), 
      max: Math.max(min, max) 
    };
  }

  function handleStart() {
    // Validate inputs based on mode
    if (gameState.gameMode === 'custom-practice') {
      if (!validateCustomDate()) {
        return;
      }
    } else {
      // Update year range for random modes
      const [centuryMin, centuryMax] = yearRangeSelect.value.split('-').map(Number);
      let min = parseInt(randomYearMin.value);
      let max = parseInt(randomYearMax.value);
      min = Math.max(centuryMin, Math.min(centuryMax, min));
      max = Math.max(centuryMin, Math.min(centuryMax, max));
      if (min > max) min = max;
      gameState.yearRange = { min, max };
    }

    // Initialize game state
    gameState.currentQuestionIndex = 0;
    gameState.correctAnswers = 0;
    gameState.wrongAnswers = 0;
    gameState.isGameActive = true;
    gameState.gameStartTime = Date.now();

    updateGameConfiguration();
    showGameScreen();
    startNewQuestion();
    startGameTimer();
  }

  // Screen Navigation
  function showGameScreen() {
    setupScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    setTimeout(() => {
      gameScreen.classList.add('active');
      timerDisplay.classList.remove('d-none');
      
      // Show progress for non-endless modes
      if (gameState.gameMode !== 'endless' && gameState.gameMode !== 'custom-practice') {
        progressSection.classList.remove('d-none');
      } else {
        progressSection.classList.add('d-none');
      }
      
      // Show time challenge bar for timed modes
      if (gameState.questionTimeLimit) {
        timeChallengeBar.classList.remove('d-none');
      } else {
        timeChallengeBar.classList.add('d-none');
      }
    }, 300);
  }

  function showSetupScreen() {
    gameScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    setTimeout(() => {
      setupScreen.classList.add('active');
      timerDisplay.classList.add('d-none');
    }, 300);
    stopAllTimers();
  }

  function showResultsScreen() {
    gameScreen.classList.remove('active');
    setTimeout(() => {
      resultsScreen.classList.add('active');
      timerDisplay.classList.add('d-none');
      displayResults();
    }, 300);
  }

  // Generate new date based on mode
  function generateNewDate() {
    if (dateMode === 'random') {
      const year = getRandomInt(yearRange.min, yearRange.max);
      const month = getRandomInt(1, 12);
      const daysInMonth = getDaysInMonth(year, month);
      const day = getRandomInt(1, daysInMonth);
      
      currentDate = new Date(year, month - 1, day);
    } else {
      // Use custom date
      const year = parseInt(customYear.value);
      const month = parseInt(customMonth.value);
      const day = parseInt(customDay.value);
      
      currentDate = new Date(year, month - 1, day);
    }
    
    displayDate();
    updateModeDisplay();
    resetButtons();
    hideFeedback();
    hideNextControls();
  }

  // Display date
  function displayDate() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const day = currentDate.getDate();
    const month = months[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    dateDisplay.textContent = `${month} ${day}, ${year}`;
  }

  // Handle day button click
  function handleDayClick(e) {
    const selectedDay = parseInt(e.target.dataset.day);
    const correctDay = currentDate.getDay();
    
    stopTimer();
    disableButtons();
    
    if (selectedDay === correctDay) {
      showCorrectFeedback(e.target);
    } else {
      showWrongFeedback(e.target, correctDay);
    }
    
    showNextControls();
  }

  // Show correct feedback
  function showCorrectFeedback(button) {
    button.classList.add('correct');
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    feedback.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      <strong>Correct!</strong> It was ${dayNames[currentDate.getDay()]}. 
      <br><small class="mt-1 d-block">Time: ${elapsed} seconds</small>
    `;
    feedback.className = 'alert alert-success d-block';
  }

  // Show wrong feedback
  function showWrongFeedback(button, correctDay) {
    button.classList.add('wrong');
    const correctButton = document.querySelector(`[data-day="${correctDay}"]`);
    correctButton.classList.add('correct');
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    feedback.innerHTML = `
      <i class="bi bi-x-circle-fill me-2"></i>
      <strong>Wrong!</strong> The correct answer was ${dayNames[correctDay]}. 
      <br><small class="mt-1 d-block">Time: ${elapsed} seconds</small>
    `;
    feedback.className = 'alert alert-danger d-block';
  }

  // Handle Next button
  function handleNext() {
    if (dateMode === 'random') {
      generateNewDate();
      startTimer();
    } else {
      // In custom mode, show input for new date
      handleNewDate();
    }
  }
  
  // Handle New Date button (for custom mode)
  function handleNewDate() {
    showSetupScreen();
  }

  // Handle Back button
  function handleBack() {
    showSetupScreen();
  }

  // Timer functions
  function startTimer() {
    startTime = Date.now();
    timeSpan.textContent = '0.0';
    
    timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      timeSpan.textContent = elapsed.toFixed(1);
    }, 100);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // UI helper functions
  function resetButtons() {
    dayButtons.forEach(btn => {
      btn.disabled = false;
      btn.classList.remove('correct', 'wrong');
    });
  }

  function disableButtons() {
    dayButtons.forEach(btn => {
      btn.disabled = true;
    });
  }

  function hideFeedback() {
    feedback.classList.add('d-none');
    feedback.classList.remove('d-block');
  }

  function showNextControls() {
    nextControls.classList.remove('d-none');
  }

  function hideNextControls() {
    nextControls.classList.add('d-none');
  }
  
  // Handle mode change
  function handleModeChange() {
    dateMode = document.querySelector('input[name="date-mode"]:checked').value;
    
    if (dateMode === 'random') {
      randomSettings.classList.remove('d-none');
      customSettings.classList.add('d-none');
    } else {
      randomSettings.classList.add('d-none');
      customSettings.classList.remove('d-none');
    }
  }
  
  // Validate custom date
  function validateCustomDate() {
    const year = parseInt(customYear.value);
    const month = parseInt(customMonth.value);
    const day = parseInt(customDay.value);
    
    // Reset validation classes
    customYear.classList.remove('is-invalid', 'is-valid');
    customMonth.classList.remove('is-invalid', 'is-valid');
    customDay.classList.remove('is-invalid', 'is-valid');
    
    let isValid = true;
    
    // Validate year
    if (year < 1 || year > 9999) {
      customYear.classList.add('is-invalid');
      isValid = false;
    } else {
      customYear.classList.add('is-valid');
    }
    
    // Validate month
    if (month < 1 || month > 12) {
      customMonth.classList.add('is-invalid');
      isValid = false;
    } else {
      customMonth.classList.add('is-valid');
    }
    
    // Validate day
    const daysInMonth = getDaysInMonth(year, month);
    if (day < 1 || day > daysInMonth) {
      customDay.classList.add('is-invalid');
      isValid = false;
    } else {
      customDay.classList.add('is-valid');
    }
    
    return isValid;
  }
  
  // Update mode display in game screen
  function updateModeDisplay() {
    if (dateMode === 'random') {
      modeIcon.className = 'bi bi-shuffle fs-3';
      modeBadge.innerHTML = '<i class="bi bi-shuffle me-1"></i>Random';
      modeBadge.className = 'badge bg-primary rounded-pill';
      nextBtnText.textContent = 'Next Random Date';
      newDateBtn.classList.add('d-none');
    } else {
      modeIcon.className = 'bi bi-calendar-plus fs-3';
      modeBadge.innerHTML = '<i class="bi bi-calendar-plus me-1"></i>Custom';
      modeBadge.className = 'badge bg-info rounded-pill';
      nextBtnText.textContent = 'Enter New Date';
      newDateBtn.classList.remove('d-none');
    }
  }

  // Utility functions
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  // Start the app
  init();
})();
