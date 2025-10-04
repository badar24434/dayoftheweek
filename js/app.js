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
    totalGameTime: 0,
    pausedTime: 0,
    pauseStartTime: null
  };

  // Game Mode Configurations
  const gameModeConfigs = {
    quick: { questions: 5, timeLimit: null, name: 'Quick Practice' },
    standard: { questions: 10, timeLimit: null, name: 'Standard Practice' },
    challenge: { questions: 20, timeLimit: null, name: 'Challenge Mode' },
    endless: { questions: Infinity, timeLimit: null, name: 'Endless Mode' },
    timed: { 
      speed: { questions: 10, timeLimit: 30000, name: 'Speed Challenge' }, // 30 seconds per question
      blitz: { questions: 10, timeLimit: 10000, name: 'Blitz Challenge' }   // 10 seconds per question
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
  // Speed/Blitz Mode custom question count
  const speedModeQuestionCountRow = document.getElementById('speed-mode-question-count-row');
  const speedModeQuestionCount = document.getElementById('speed-mode-question-count');
  const blitzModeQuestionCountRow = document.getElementById('blitz-mode-question-count-row');
  const blitzModeQuestionCount = document.getElementById('blitz-mode-question-count');
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
    // Show/hide custom question count for Speed/Blitz Mode
    timedModeButtons.forEach(btn => {
      btn.addEventListener('change', handleTimedModeQuestionCountVisibility);
    });
    // Validate and clamp input for Speed Mode
    if (speedModeQuestionCount) {
      speedModeQuestionCount.addEventListener('input', () => {
        let val = parseInt(speedModeQuestionCount.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        speedModeQuestionCount.value = val;
      });
    }
    // Validate and clamp input for Blitz Mode
    if (blitzModeQuestionCount) {
      blitzModeQuestionCount.addEventListener('input', () => {
        let val = parseInt(blitzModeQuestionCount.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        blitzModeQuestionCount.value = val;
      });
    }
  function handleTimedModeQuestionCountVisibility() {
    // Show only the relevant question count input
    const selectedType = document.querySelector('input[name="timed-mode-type"]:checked')?.value || 'speed';
    if (selectedType === 'speed') {
      speedModeQuestionCountRow.style.display = '';
      if (blitzModeQuestionCountRow) blitzModeQuestionCountRow.style.display = 'none';
    } else if (selectedType === 'blitz') {
      blitzModeQuestionCountRow.style.display = '';
      if (speedModeQuestionCountRow) speedModeQuestionCountRow.style.display = 'none';
    } else {
      if (speedModeQuestionCountRow) speedModeQuestionCountRow.style.display = 'none';
      if (blitzModeQuestionCountRow) blitzModeQuestionCountRow.style.display = 'none';
    }
  }
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
    handleTimedModeQuestionCountVisibility();
    updateGameConfiguration();
  }

  function updateGameConfiguration() {
    if (gameState.gameMode === 'timed') {
      const config = gameModeConfigs.timed[gameState.timedModeType];
      if (gameState.timedModeType === 'speed' && speedModeQuestionCount) {
        let val = parseInt(speedModeQuestionCount.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        gameState.totalQuestions = val;
      } else if (gameState.timedModeType === 'blitz' && blitzModeQuestionCount) {
        let val = parseInt(blitzModeQuestionCount.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        gameState.totalQuestions = val;
      } else {
        gameState.totalQuestions = config.questions;
      }
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

  // Game Logic
  function startNewQuestion() {
    generateNewDate();
    updateProgress();
    resetButtons();
    hideFeedback();
    hideNextControls();
    resumeGameTimer(); // Resume main timer when starting new question
    startQuestionTimer();
  }

  function generateNewDate() {
    if (gameState.dateMode === 'random') {
      const year = getRandomInt(gameState.yearRange.min, gameState.yearRange.max);
      const month = getRandomInt(1, 12);
      const daysInMonth = getDaysInMonth(year, month);
      const day = getRandomInt(1, daysInMonth);
      
      gameState.currentDate = new Date(year, month - 1, day);
    } else {
      // Use custom date
      const year = parseInt(customYear.value);
      const month = parseInt(customMonth.value);
      const day = parseInt(customDay.value);
      
      gameState.currentDate = new Date(year, month - 1, day);
    }
    
    displayDate();
    updateModeDisplay();
  }

  function updateProgress() {
    if (gameState.gameMode === 'endless' || gameState.gameMode === 'custom-practice') {
      return;
    }

    const current = gameState.currentQuestionIndex + 1;
    const total = gameState.totalQuestions;
    const percentage = (gameState.currentQuestionIndex / gameState.totalQuestions) * 100;

    progressText.textContent = `${current} / ${total}`;
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage);
    
    correctCount.textContent = gameState.correctAnswers;
    wrongCount.textContent = gameState.wrongAnswers;
  }

  function displayDate() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    const day = gameState.currentDate.getDate();
    const month = months[gameState.currentDate.getMonth()];
    const year = gameState.currentDate.getFullYear();
    
    dateDisplay.textContent = `${month} ${day}, ${year}`;
  }

  function updateModeDisplay() {
    let icon, badge, badgeClass;
    
    switch (gameState.gameMode) {
      case 'quick':
        icon = 'bi-lightning';
        badge = '<i class="bi bi-lightning me-1"></i>Quick';
        badgeClass = 'bg-success';
        break;
      case 'standard':
        icon = 'bi-star';
        badge = '<i class="bi bi-star me-1"></i>Standard';
        badgeClass = 'bg-primary';
        break;
      case 'challenge':
        icon = 'bi-fire';
        badge = '<i class="bi bi-fire me-1"></i>Challenge';
        badgeClass = 'bg-warning';
        break;
      case 'endless':
        icon = 'bi-infinity';
        badge = '<i class="bi bi-infinity me-1"></i>Endless';
        badgeClass = 'bg-info';
        break;
      case 'timed':
        icon = 'bi-stopwatch';
        const timeConfig = gameModeConfigs.timed[gameState.timedModeType];
        badge = `<i class="bi bi-stopwatch me-1"></i>${timeConfig.name}`;
        badgeClass = 'bg-danger';
        break;
      case 'custom-practice':
        icon = 'bi-calendar-plus';
        badge = '<i class="bi bi-calendar-plus me-1"></i>Custom';
        badgeClass = 'bg-secondary';
        break;
      default:
        icon = 'bi-shuffle';
        badge = '<i class="bi bi-shuffle me-1"></i>Practice';
        badgeClass = 'bg-primary';
    }

    modeIcon.className = `${icon} fs-3`;
    modeBadge.innerHTML = badge;
    modeBadge.className = `badge ${badgeClass} rounded-pill`;
  }

  function handleDayClick(e) {
    if (!gameState.isGameActive) return;

    const selectedDay = parseInt(e.target.dataset.day);
    const correctDay = gameState.currentDate.getDay();
    
    stopQuestionTimer();
    pauseGameTimer(); // Pause main timer after answering
    disableButtons();
    
    const questionTime = Date.now() - gameState.questionStartTime;
    
    // Debug logging to help identify the issue
    console.log(`Selected: ${selectedDay}, Correct: ${correctDay}, Date: ${gameState.currentDate}, Day name: ${dayNames[correctDay]}`);
    
    if (selectedDay === correctDay) {
      gameState.correctAnswers++;
      showCorrectFeedback(e.target, questionTime);
    } else {
      gameState.wrongAnswers++;
      showWrongFeedback(e.target, correctDay, questionTime);
    }
    
    gameState.currentQuestionIndex++;
    
    // Check if game should end
    if (shouldEndGame()) {
      setTimeout(() => {
        endGame();
      }, 2000);
    } else {
      showNextControls();
    }
  }

  function shouldEndGame() {
    // Endless mode never ends automatically
    if (gameState.gameMode === 'endless') {
      return false;
    }
    
    // Custom practice mode ends after one question
    if (gameState.gameMode === 'custom-practice') {
      return true;
    }
    
    // Check if we've reached the question limit
    return gameState.currentQuestionIndex >= gameState.totalQuestions;
  }

  function handleTimeUp() {
    if (!gameState.isGameActive) return;
    
    // Treat time up as wrong answer
    gameState.wrongAnswers++;
    gameState.currentQuestionIndex++;
    
    pauseGameTimer(); // Pause main timer when time is up
    disableButtons();
    showTimeUpFeedback();
    
    if (shouldEndGame()) {
      setTimeout(() => {
        endGame();
      }, 2000);
    } else {
      showNextControls();
    }
  }

  function showCorrectFeedback(button, questionTime) {
    button.classList.add('correct');
    const elapsed = (questionTime / 1000).toFixed(1);
    
    feedback.innerHTML = `
      <i class="bi bi-check-circle-fill me-2"></i>
      <strong>Correct!</strong> It was ${dayNames[gameState.currentDate.getDay()]}. 
      <br><small class="mt-1 d-block">Time: ${elapsed} seconds</small>
    `;
    feedback.className = 'alert alert-success d-block';
  }

  function showWrongFeedback(button, correctDay, questionTime) {
    button.classList.add('wrong');
    const correctButton = document.querySelector(`[data-day="${correctDay}"]`);
    correctButton.classList.add('correct');
    
    const elapsed = (questionTime / 1000).toFixed(1);
    feedback.innerHTML = `
      <i class="bi bi-x-circle-fill me-2"></i>
      <strong>Wrong!</strong> The correct answer was ${dayNames[correctDay]}. 
      <br><small class="mt-1 d-block">Time: ${elapsed} seconds</small>
    `;
    feedback.className = 'alert alert-danger d-block';
  }

  function showTimeUpFeedback() {
    const correctDay = gameState.currentDate.getDay();
    const correctButton = document.querySelector(`[data-day="${correctDay}"]`);
    correctButton.classList.add('correct');
    
    feedback.innerHTML = `
      <i class="bi bi-hourglass-bottom me-2"></i>
      <strong>Time's Up!</strong> The correct answer was ${dayNames[correctDay]}. 
      <br><small class="mt-1 d-block">Try to be faster next time!</small>
    `;
    feedback.className = 'alert alert-warning d-block';
  }

  function handleNext() {
    if (gameState.gameMode === 'endless') {
      startNewQuestion();
    } else {
      startNewQuestion();
    }
  }
  
  function handleNewDate() {
    showSetupScreen();
  }

  function handleBack() {
    gameState.isGameActive = false;
    showSetupScreen();
  }

  function handlePlayAgain() {
    handleStart();
  }

  function handleTryDifferent() {
    showSetupScreen();
  }

  // Timer Functions
  function startGameTimer() {
    gameState.startTime = Date.now();
    gameState.pausedTime = 0; // Track total paused time
    timeSpan.textContent = '0.0';
    
    gameState.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - gameState.startTime - gameState.pausedTime) / 1000;
      timeSpan.textContent = elapsed.toFixed(1);
    }, 100);
  }

  function pauseGameTimer() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
      gameState.pauseStartTime = Date.now(); // Record when pause started
    }
  }

  function resumeGameTimer() {
    if (!gameState.timerInterval && gameState.pauseStartTime) {
      // Add the paused duration to total paused time
      gameState.pausedTime += Date.now() - gameState.pauseStartTime;
      gameState.pauseStartTime = null;
      
      // Resume the timer
      gameState.timerInterval = setInterval(() => {
        const elapsed = (Date.now() - gameState.startTime - gameState.pausedTime) / 1000;
        timeSpan.textContent = elapsed.toFixed(1);
      }, 100);
    }
  }

  function startQuestionTimer() {
    gameState.questionStartTime = Date.now();
    
    if (gameState.questionTimeLimit) {
      let timeLeft = gameState.questionTimeLimit;
      timeRemaining.textContent = `${(timeLeft / 1000).toFixed(0)}s`;
      
      gameState.questionTimerInterval = setInterval(() => {
        timeLeft -= 100;
        const seconds = Math.max(0, timeLeft / 1000);
        timeRemaining.textContent = `${seconds.toFixed(1)}s`;
        
        const percentage = (timeLeft / gameState.questionTimeLimit) * 100;
        timeBar.style.width = `${Math.max(0, percentage)}%`;
        timeBar.setAttribute('aria-valuenow', Math.max(0, percentage));
        
        if (timeLeft <= 0) {
          clearInterval(gameState.questionTimerInterval);
          handleTimeUp();
        }
      }, 100);
    }
  }

  function stopQuestionTimer() {
    if (gameState.questionTimerInterval) {
      clearInterval(gameState.questionTimerInterval);
      gameState.questionTimerInterval = null;
    }
  }

  function stopAllTimers() {
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
      gameState.timerInterval = null;
    }
    stopQuestionTimer();
  }

  function endGame() {
    gameState.isGameActive = false;
    // Calculate total game time excluding paused time
    gameState.totalGameTime = Date.now() - gameState.gameStartTime - (gameState.pausedTime || 0);
    // If currently paused, subtract the current pause duration
    if (gameState.pauseStartTime) {
      gameState.totalGameTime -= (Date.now() - gameState.pauseStartTime);
    }
    stopAllTimers();
    
    if (gameState.gameMode === 'custom-practice') {
      // For custom practice, go back to setup instead of showing results
      setTimeout(() => {
        showSetupScreen();
      }, 1000);
    } else {
      showResultsScreen();
    }
  }

  function displayResults() {
    const accuracy = gameState.totalQuestions > 0 ? 
      Math.round((gameState.correctAnswers / (gameState.correctAnswers + gameState.wrongAnswers)) * 100) : 0;
    const totalTimeSeconds = (gameState.totalGameTime / 1000).toFixed(1);

    // Update result numbers
    finalCorrect.textContent = gameState.correctAnswers;
    finalWrong.textContent = gameState.wrongAnswers;
    finalAccuracy.textContent = `${accuracy}%`;
    finalTime.textContent = `${totalTimeSeconds}s`;

    // Determine performance level and message
    let iconClass, iconBg, title, subtitle, message, messageClass;

    if (accuracy >= 90) {
      iconClass = 'bi-trophy-fill';
      iconBg = 'bg-warning bg-opacity-10';
      title = 'Outstanding!';
      subtitle = 'Perfect performance!';
      message = '<strong>Incredible!</strong> You\'re a true day-of-the-week master!';
      messageClass = 'alert-warning';
    } else if (accuracy >= 80) {
      iconClass = 'bi-star-fill';
      iconBg = 'bg-success bg-opacity-10';
      title = 'Excellent Work!';
      subtitle = 'Great job on this challenge!';
      message = '<strong>Well done!</strong> You\'ve got excellent skills!';
      messageClass = 'alert-success';
    } else if (accuracy >= 60) {
      iconClass = 'bi-hand-thumbs-up-fill';
      iconBg = 'bg-primary bg-opacity-10';
      title = 'Good Job!';
      subtitle = 'Nice effort on this round!';
      message = '<strong>Good work!</strong> Keep practicing to improve even more!';
      messageClass = 'alert-primary';
    } else {
      iconClass = 'bi-arrow-clockwise';
      iconBg = 'bg-info bg-opacity-10';
      title = 'Keep Trying!';
      subtitle = 'Practice makes perfect!';
      message = '<strong>Don\'t give up!</strong> Every practice session helps you improve!';
      messageClass = 'alert-info';
    }

    // Update result display
    resultIcon.className = iconBg + ' rounded-circle d-inline-flex align-items-center justify-content-center mb-3';
    resultIcon.querySelector('i').className = iconClass + ' fs-1 text-' + iconBg.split(' ')[0].split('-')[1];
    resultTitle.textContent = title;
    resultSubtitle.textContent = subtitle;
    performanceMessage.innerHTML = `<i class="bi bi-star-fill me-2"></i>${message}`;
    performanceMessage.className = `alert ${messageClass} border-0 mb-4`;
  }

  // UI Helper Functions
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
    if (gameState.gameMode === 'endless') {
      nextBtn.style.display = 'inline-block';
      nextBtnText.textContent = 'Next Question';
    } else if (!shouldEndGame()) {
      nextBtn.style.display = 'inline-block';
      nextBtnText.textContent = 'Next Question';
    } else {
      nextBtn.style.display = 'none';
    }
    
    if (gameState.gameMode === 'custom-practice') {
      newDateBtn.classList.remove('d-none');
    } else {
      newDateBtn.classList.add('d-none');
    }
    
    nextControls.classList.remove('d-none');
  }

  function hideNextControls() {
    nextControls.classList.add('d-none');
  }
  // Validation Functions
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

  // Utility Functions
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  // Keyboard Navigation Support
  document.addEventListener('keydown', (e) => {
    if (!gameState.isGameActive) return;

    // Number keys 0-6 for day selection
    if (e.key >= '0' && e.key <= '6') {
      e.preventDefault();
      const dayIndex = parseInt(e.key);
      const button = document.querySelector(`[data-day="${dayIndex}"]`);
      if (button && !button.disabled) {
        button.click();
      }
    }
    
    // Enter key for next question
    if (e.key === 'Enter' && !nextControls.classList.contains('d-none')) {
      e.preventDefault();
      if (nextBtn.style.display !== 'none') {
        handleNext();
      }
    }
    
    // Escape key to go back
    if (e.key === 'Escape') {
      e.preventDefault();
      handleBack();
    }
  });

  // Initialize the application
  init();
})();
