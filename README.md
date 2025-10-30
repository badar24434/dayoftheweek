# Day of the Week Practice

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.txt)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

> An interactive web application to help you master the art of identifying days of the week from dates. Test your mental calculation skills with multiple game modes, historical events, and time challenges!

![Day of the Week Practice](https://img.shields.io/badge/Status-Active-success)

## 🌟 Features

### 🎮 Multiple Game Modes

- **Quick Practice** - 5 questions for a quick warm-up session
- **Standard Practice** - 10 questions for regular training
- **Challenge Mode** - 20 questions to test your mastery
- **Endless Mode** - Unlimited questions for continuous practice
- **Time Challenge** - Race against the clock with two intensity levels:
  - **Speed Mode**: 30 seconds per question (customizable)
  - **Blitz Mode**: 10 seconds per question (customizable)
- **Custom Date Practice** - Test yourself with specific dates
- **Leap Year Challenge** - Focus on February 29th dates
- **Historical Events** - Learn famous dates in history while practicing

### 📅 Flexible Date Options

- **Random Dates** - Generate dates from any century (1400-2299)
- **Custom Date Ranges** - Narrow down to specific years within a century
- **Historical Database** - 75+ pre-loaded historical events from 1492-2008

### 🎨 User Experience

- **Beautiful Glassmorphic UI** - Modern gradient background with frosted glass effects
- **Smooth Animations** - Elegant transitions and feedback animations
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **Dark Theme** - Eye-friendly color scheme with vibrant accents
- **Keyboard Navigation** - Use number keys (0-6), Enter, and Esc for quick interaction
- **Real-time Timer** - Track your performance with millisecond precision
- **Progress Tracking** - Visual progress bars and score counters

### 📊 Detailed Analytics

- **Comprehensive Results** - View accuracy, total time, and performance metrics
- **Question History** - Review each question with your answers and time taken
- **Performance Feedback** - Receive encouraging messages based on your score
- **Time Statistics** - See how long you spent on each question

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/badar24434/dayoftheweek.git
   cd dayoftheweek
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm start
   ```
   The app will open automatically at `http://localhost:8080`

4. **Build for production**
   ```bash
   npm run build
   ```
   The optimized files will be in the `dist` folder.


## 📖 How to Use

### Basic Workflow

1. **Select Game Mode** - Choose from Quick, Standard, Challenge, Endless, Timed, or Custom modes
2. **Choose Date Source** - Pick a century and optionally narrow down the year range
3. **Start Practice** - Click "Start Practice" to begin
4. **Answer Questions** - Select the correct day of the week for each date
5. **Review Results** - See your score, time, and detailed question history

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `0-6` | Select days (0=Sunday, 1=Monday, ..., 6=Saturday) |
| `Enter` | Next question |
| `Esc` | Return to setup |

### Game Mode Details

#### Quick Practice (5 Questions)
Perfect for a quick brain exercise or warming up before longer sessions.

#### Standard Practice (10 Questions)
The default mode for regular practice sessions, balancing quantity with quality.

#### Challenge Mode (20 Questions)
For advanced learners who want to push their limits and build stamina.

#### Endless Mode (Unlimited)
Practice continuously without limits. Perfect for extended training sessions.

#### Time Challenge
Race against the clock to answer questions before time runs out:
- **Speed Mode**: 30 seconds per question (default 10 questions, customizable 1-100)
- **Blitz Mode**: 10 seconds per question (default 10 questions, customizable 1-100)

#### Custom Date Practice
Enter any specific date (month, day, year) to test your knowledge of that particular date.

#### Leap Year Challenge
Focus exclusively on February 29th dates from your selected century. Great for mastering the unique leap year patterns.

#### Historical Events
Learn while you practice! Each question includes a famous historical event with its date. Features 75+ events including:
- Independence Day (1776)
- Moon Landing (1969)
- Fall of the Berlin Wall (1989)
- September 11 Attacks (2001)
- And many more pivotal moments in history

## 🏗️ Project Structure

```
dayoftheweek/
├── css/
│   └── style.css           # Custom styles with glassmorphic design
├── js/
│   ├── app.js              # Main application logic
│   └── vendor/             # Third-party libraries
├── img/                    # Image assets
├── dist/                   # Production build output
├── index.html              # Main entry point
├── try.html                # Alternative translator interface
├── code.gs                 # Google Apps Script integration
├── package.json            # Project dependencies
├── vercel.json             # Vercel deployment configuration
├── webpack.common.js       # Webpack base configuration
├── webpack.config.dev.js   # Development configuration
├── webpack.config.prod.js  # Production configuration
└── README.md               # This file
```

## 🎯 Core Functions

### Game State Management

#### `init()`
Initializes the application, sets up event listeners, and configures default values.

#### `handleGameModeChange()`
Responds to game mode selection, showing/hiding relevant UI elements and updating game configuration.

#### `updateGameConfiguration()`
Updates total questions and time limits based on the selected game mode.

### Date Generation

#### `generateNewDate()`
Creates a new random date based on the current game mode and settings:
- For **Random Mode**: Generates dates within the selected century/year range
- For **Leap Year Mode**: Only generates February 29th dates from leap years
- For **Historical Events**: Randomly selects from the historical events database
- For **Custom Practice**: Uses the user-provided date

#### `getLeapYearsInRange(startYear, endYear)`
Returns an array of all leap years within the specified range.

**Algorithm:**
```javascript
// A year is a leap year if:
// - Divisible by 4 AND not divisible by 100
// - OR divisible by 400
return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
```

### Game Logic

#### `startNewQuestion()`
Prepares a new question by:
1. Generating a new date
2. Updating progress indicators
3. Resetting button states
4. Clearing previous feedback
5. Starting/resuming timers

#### `handleDayClick(event)`
Processes the user's answer when they click a day button:
1. Validates the answer against the correct day
2. Records the question in history
3. Updates score counters
4. Provides visual feedback (correct/wrong animations)
5. Determines if the game should end

#### `shouldEndGame()`
Checks if the game should end based on:
- Question count reaching the limit (for finite modes)
- Custom practice mode (always ends after one question)
- Endless mode (never ends automatically)

### Timer Management

#### `startGameTimer()`
Initiates the main game timer that tracks total elapsed time across all questions.

#### `pauseGameTimer()` / `resumeGameTimer()`
Pauses and resumes the main timer between questions, ensuring accurate time tracking by excluding time spent viewing feedback.

#### `startQuestionTimer()`
Starts the countdown timer for timed challenge modes:
- Updates the time remaining display every 100ms
- Triggers `handleTimeUp()` when time expires
- Animates the progress bar from 100% to 0%

#### `stopQuestionTimer()`
Stops the countdown timer when a question is answered or time expires.

### Results & Analytics

#### `displayResults()`
Calculates and displays comprehensive results:
- **Accuracy**: Percentage of correct answers
- **Total Time**: Time spent answering questions (excludes paused time)
- **Performance Level**: Rating based on accuracy (Outstanding 90%+, Excellent 80%+, Good 60%+)
- **Question History**: Detailed breakdown of each question

#### `displayQuestionHistory()`
Renders a detailed history of all answered questions showing:
- Question number and date
- User's answer vs. correct answer
- Time spent on each question
- Whether the question timed out
- Visual indicators (✓ for correct, ✗ for wrong, ⌛ for timed out)

### UI Helper Functions

#### `showGameScreen()` / `showSetupScreen()` / `showResultsScreen()`
Manages screen transitions with smooth fade-in/fade-out animations.

#### `updateProgress()`
Updates the visual progress indicators:
- Progress bar percentage
- Current/total question counters
- Correct/wrong answer badges

#### `displayDate()`
Formats and displays the current question's date in a human-readable format.
For historical events, also displays the event description.

#### `updateModeDisplay()`
Updates the game mode badge and icon to reflect the current mode.

### Validation Functions

#### `validateCustomDate()`
Validates user input for custom dates:
- Ensures year is between 1-9999
- Validates month is 1-12
- Checks day is valid for the selected month and year
- Accounts for leap years when validating February dates
- Provides visual feedback with green/red borders

#### `getDaysInMonth(year, month)`
Returns the number of days in a given month, accounting for leap years in February.

## 🛠️ Technology Stack

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with gradients, animations, and glassmorphism
- **JavaScript (ES6+)** - Vanilla JS with modern syntax
- **Bootstrap 5** - Responsive grid and components
- **Bootstrap Icons** - Vector icon library
- **Webpack 5** - Module bundler and build tool
- **Google Fonts (Inter)** - Typography

## 📦 Build Configuration

### Webpack Setup

The project uses Webpack 5 with three configuration files:

#### `webpack.common.js`
Base configuration shared between development and production:
- Entry point: `./js/app.js`
- Output directory: `dist/`
- Clean output directory before each build

#### `webpack.config.dev.js`
Development configuration:
- Webpack Dev Server for hot reloading
- Source maps for debugging
- Fast rebuild times

#### `webpack.config.prod.js`
Production configuration:
- Minification and optimization
- Asset optimization
- Production-ready bundle

### NPM Scripts

```json
{
  "start": "webpack serve --open --config webpack.config.dev.js",
  "build": "webpack --config webpack.config.prod.js",
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

## 🎨 Design System

### Color Palette

- **Primary**: `#0d6efd` (Blue) - Main actions and progress
- **Success**: `#198754` (Green) - Correct answers
- **Danger**: `#dc3545` (Red) - Wrong answers, urgent actions
- **Warning**: `#ffc107` (Yellow) - Time challenges, cautions
- **Info**: `#0dcaf0` (Cyan) - Information, endless mode
- **Secondary**: `#6c757d` (Gray) - Custom options

### Gradients

- **Background**: `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`
- **Buttons**: `linear-gradient(135deg, [color], [darker-shade])`

### Typography

- **Font Family**: Inter with fallbacks
- **Font Features**: `cv01`, `cv03`, `cv04`, `cv11` (stylistic alternates)
- **Headings**: 700-800 weight
- **Body**: 400-600 weight

### Animations

- **Screen Transitions**: `slideInUp` - 0.6s cubic-bezier easing
- **Button Hover**: Transform scale and box-shadow
- **Success/Error**: `successPulse` / `errorShake` - 0.6s animations
- **Alert Entry**: `alertSlideIn` - 0.5s with scale

## 🧪 Testing

### Manual Testing Checklist

- [ ] All game modes work correctly
- [ ] Timer accuracy in timed modes
- [ ] Custom date validation
- [ ] Keyboard navigation
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Progress tracking across questions
- [ ] Results screen accuracy
- [ ] Historical events display properly
- [ ] Leap year dates generate correctly
- [ ] Undo functionality (if applicable)

### Browser Compatibility

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)


### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Test on multiple browsers
- Update documentation as needed
- Keep commits atomic and descriptive

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## 👤 Author

**badar24434**
- GitHub: [@badar24434](https://github.com/badar24434)

## 📚 Additional Resources

- [Day of the Week Calculation Methods](https://en.wikipedia.org/wiki/Determination_of_the_day_of_the_week)
- [Doomsday Algorithm](https://en.wikipedia.org/wiki/Doomsday_rule)
- [Perpetual Calendar](https://en.wikipedia.org/wiki/Perpetual_calendar)

## 🗺️ Roadmap

### Planned Features
- [ ] User accounts and progress saving
- [ ] Leaderboards and achievements
- [ ] More historical events database expansion
- [ ] Multiple language support
- [ ] Tutorial mode for learning calculation methods
- [ ] PWA support for offline usage
- [ ] Statistics dashboard
- [ ] Social sharing of scores

## ⭐ Star History

If you find this project helpful, please consider giving it a star on GitHub!

---

**Made with ❤️ for mental math enthusiasts**
