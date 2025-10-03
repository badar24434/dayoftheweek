// Day of the Week Practice App
(function() {
  'use strict';

  // State
  let yearRange = { min: 1900, max: 1999 };
  let currentDate = null;
  let startTime = null;
  let timerInterval = null;

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
  const backBtn = document.getElementById('back-btn');
  const timerDisplay = document.getElementById('timer');
  const timeSpan = document.getElementById('time');

  // Day names
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Initialize
  function init() {
    startBtn.addEventListener('click', handleStart);
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handleBack);
    
    dayButtons.forEach(btn => {
      btn.addEventListener('click', handleDayClick);
    });
  }

  // Handle Start button
  function handleStart() {
    const range = yearRangeSelect.value;
    const [min, max] = range.split('-').map(Number);
    yearRange = { min, max };
    
    showGameScreen();
    generateNewDate();
    startTimer();
  }

  // Show game screen
  function showGameScreen() {
    setupScreen.classList.remove('active');
    gameScreen.classList.add('active');
    timerDisplay.classList.remove('hidden');
  }

  // Show setup screen
  function showSetupScreen() {
    gameScreen.classList.remove('active');
    setupScreen.classList.add('active');
    timerDisplay.classList.add('hidden');
    stopTimer();
  }

  // Generate random date
  function generateNewDate() {
    const year = getRandomInt(yearRange.min, yearRange.max);
    const month = getRandomInt(1, 12);
    const daysInMonth = getDaysInMonth(year, month);
    const day = getRandomInt(1, daysInMonth);
    
    currentDate = new Date(year, month - 1, day);
    displayDate();
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
    feedback.textContent = `✓ Correct! It was ${dayNames[currentDate.getDay()]}`;
    feedback.className = 'feedback correct';
    feedback.classList.remove('hidden');
  }

  // Show wrong feedback
  function showWrongFeedback(button, correctDay) {
    button.classList.add('wrong');
    const correctButton = document.querySelector(`[data-day="${correctDay}"]`);
    correctButton.classList.add('correct');
    
    feedback.textContent = `✗ Wrong! The correct answer was ${dayNames[correctDay]}`;
    feedback.className = 'feedback wrong';
    feedback.classList.remove('hidden');
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
    feedback.classList.add('hidden');
  }

  function showNextControls() {
    nextControls.classList.remove('hidden');
  }

  function hideNextControls() {
    nextControls.classList.add('hidden');
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
