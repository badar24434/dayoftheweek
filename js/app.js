// Day of the Week Practice App
(function() {
  'use strict';

  // State
  let yearRange = { min: 1900, max: 1999 };
  let currentDate = null;
  let startTime = null;
  let timerInterval = null;
  let dateMode = 'random'; // 'random' or 'custom'

  // DOM Elements
  const setupScreen = document.getElementById('setup-screen');
  const gameScreen = document.getElementById('game-screen');
  const yearRangeSelect = document.getElementById('year-range');
  const startBtn = document.getElementById('start-btn');
  const dateDisplay = document.getElementById('date-display');
  const dayButtons = document.querySelectorAll('.btn-day');
  const feedback = document.getElementById('feedback');
  const nextControls = document.getElementById('next-controls');
  const nextBtn = document.getElementById('next-btn');
  const nextBtnText = document.getElementById('next-btn-text');
  const newDateBtn = document.getElementById('new-date-btn');
  const backBtn = document.getElementById('back-btn');
  const timerDisplay = document.getElementById('timer');
  const timeSpan = document.getElementById('time');
  
  // Mode selection elements
  const randomModeBtn = document.getElementById('random-mode');
  const customModeBtn = document.getElementById('custom-mode');
  const randomSettings = document.getElementById('random-settings');
  const customSettings = document.getElementById('custom-settings');
  
  // Custom date elements
  const customMonth = document.getElementById('custom-month');
  const customDay = document.getElementById('custom-day');
  const customYear = document.getElementById('custom-year');
  
  // Mode indicators
  const modeIcon = document.getElementById('mode-icon');
  const modeBadge = document.getElementById('mode-badge');

  // Day names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Initialize
  function init() {
    startBtn.addEventListener('click', handleStart);
    nextBtn.addEventListener('click', handleNext);
    newDateBtn.addEventListener('click', handleNewDate);
    backBtn.addEventListener('click', handleBack);
    
    // Mode selection
    randomModeBtn.addEventListener('change', handleModeChange);
    customModeBtn.addEventListener('change', handleModeChange);
    
    // Custom date validation
    customMonth.addEventListener('change', validateCustomDate);
    customDay.addEventListener('change', validateCustomDate);
    customYear.addEventListener('change', validateCustomDate);
    
    dayButtons.forEach(btn => {
      btn.addEventListener('click', handleDayClick);
    });
    
    // Set default current date for custom mode
    const now = new Date();
    customMonth.value = now.getMonth() + 1;
    customDay.value = now.getDate();
    customYear.value = now.getFullYear();
  }

  // Handle Start button
  function handleStart() {
    if (dateMode === 'random') {
      const range = yearRangeSelect.value;
      const [min, max] = range.split('-').map(Number);
      yearRange = { min, max };
    } else {
      // Validate custom date before starting
      if (!validateCustomDate()) {
        return;
      }
    }
    
    showGameScreen();
    generateNewDate();
    startTimer();
  }

  // Show game screen
  function showGameScreen() {
    setupScreen.classList.remove('active');
    setTimeout(() => {
      gameScreen.classList.add('active');
      timerDisplay.classList.remove('d-none');
    }, 300);
  }

  // Show setup screen
  function showSetupScreen() {
    gameScreen.classList.remove('active');
    setTimeout(() => {
      setupScreen.classList.add('active');
      timerDisplay.classList.add('d-none');
    }, 300);
    stopTimer();
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
    generateNewDate();
    startTimer();
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
