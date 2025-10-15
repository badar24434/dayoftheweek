# Google Sheets Translator - Setup Instructions

## 🚨 IMPORTANT: The Real Problem

**Your translator only translates A1 because you're running it as a STANDALONE WEB APP!**

Standalone web apps **CANNOT** access your current spreadsheet selection. They run in a completely separate context.

## ✅ The Correct Solution

You need to run this as a **SIDEBAR** or **DIALOG** within your Google Sheets document, NOT as a web app.

---

## 📋 Setup Steps (Choose ONE method)

### Method 1: Sidebar Mode (RECOMMENDED) ⭐

This adds a menu to your spreadsheet and opens the translator in a sidebar.

#### Steps:

1. **Open your Google Sheet** where you want to use the translator

2. **Open the Script Editor**:
   - Click `Extensions` > `Apps Script`

3. **Copy the code**:
   - Replace all code in `Code.gs` with the fixed version
   - Create a file called `try.html` and paste the HTML code

4. **Add the onOpen trigger**:
   - The `onOpen()` function is already in the code
   - It will automatically run when you open the spreadsheet

5. **Save the project**:
   - Click the save icon (💾)
   - Give it a name like "Sheet Translator"

6. **Close and reopen your spreadsheet**:
   - Close the spreadsheet tab
   - Reopen it
   - You should see a new menu: **🌐 Translator**

7. **Use the translator**:
   - Select cells you want to translate (e.g., A1:A10)
   - Click **🌐 Translator** > **Open Translator**
   - A sidebar will appear on the right
   - Choose your language and click "Translate Now"

---

### Method 2: Run Directly from Script Editor (Quick Testing)

If you just want to test quickly:

1. Open your Google Sheet
2. Select the cells you want to translate (e.g., A1:A5)
3. Open `Extensions` > `Apps Script`
4. In the script editor, select function: `showTranslatorSidebar`
5. Click the Run button (▶️)
6. Grant permissions when asked
7. The sidebar will appear with the translator

---

### Method 3: Dialog Mode (Alternative)

Similar to sidebar, but opens as a popup dialog:

1. Follow steps 1-5 from Method 1
2. Instead of `Open Translator`, add a menu item that calls `showTranslatorDialog()`
3. This will open the translator in a centered popup window

---

## 🔧 Why Web App Mode Doesn't Work

### The Problem:
```
User's Browser (Standalone Web App)
       ↓
   [NO CONNECTION TO SPREADSHEET]
       ↓
Cannot see selected cells ❌
```

### The Solution:
```
Google Sheet (with embedded Sidebar)
       ↓
   [DIRECT CONNECTION]
       ↓
Can see selected cells ✅
```

When you deploy as a web app and access it via URL:
- The web app runs in isolation
- `SpreadsheetApp.getActiveSpreadsheet()` doesn't know which sheet you're working on
- `getActiveRange()` always returns A1 or fails
- The app has no context of your selection

When you run as a sidebar/dialog:
- The code runs INSIDE the spreadsheet
- It can access your current selection
- All functions work correctly

---

## 🎯 Usage After Setup

### Option A: Using the Sidebar (Recommended)

1. **Select cells** in your spreadsheet (e.g., A1:A10)
2. Click **🌐 Translator** menu > **Open Translator**
3. Choose target language from dropdown
4. Click **Translate Now**
5. Confirm if prompted
6. ✓ All selected cells are translated!

### Option B: Quick Menu Shortcuts

For faster translation:

1. **Select cells** in your spreadsheet
2. Click **🌐 Translator** menu > **Quick Translate to Malay**
3. ✓ Instant translation!

Available shortcuts:
- Quick Translate to Malay
- Quick Translate to English
- Undo Last Translation

---

## 🐛 Troubleshooting

### Issue: Menu doesn't appear after reopening spreadsheet

**Solution:**
1. Run the function `onOpen()` manually once:
   - Open Extensions > Apps Script
   - Select `onOpen` from dropdown
   - Click Run (▶️)
   - Grant permissions
   - Close and reopen spreadsheet

### Issue: "Authorization required" error

**Solution:**
1. When you first run the script, Google will ask for permissions
2. Click "Review Permissions"
3. Choose your Google account
4. Click "Advanced" > "Go to [Your Project Name] (unsafe)"
5. Click "Allow"
6. This is normal - you're giving your own script permission to access your sheets

### Issue: Still only translating A1

**Possible causes:**
1. You're still using the web app URL instead of sidebar
   - **Fix:** Use the sidebar method above
   
2. You're not selecting cells before clicking translate
   - **Fix:** Select cells FIRST, then open translator
   
3. The spreadsheet isn't the active window
   - **Fix:** Click inside the spreadsheet before selecting cells

### Issue: Can't find the 🌐 Translator menu

**Solution:**
1. Make sure you saved the script
2. Make sure the `onOpen()` function exists in your code
3. Close and reopen the spreadsheet completely
4. If still missing, run `onOpen()` manually from script editor

---

## 📊 Testing Your Setup

### Test 1: Single Cell
1. Put "Hello World" in cell A1
2. Select cell A1
3. Open translator sidebar
4. Translate to Malay
5. Expected: A1 should now show "Halo Dunia"

### Test 2: Multiple Cells
1. Put text in cells A1:A5 (different text in each)
2. Select range A1:A5 (highlight all 5 cells)
3. Open translator sidebar
4. Translate to Malay
5. Expected: All 5 cells translated

### Test 3: Range with Empty Cells
1. Put text in A1, A2, A4 (leave A3, A5 empty)
2. Select A1:A5
3. Translate to Malay
4. Expected: A1, A2, A4 translated; A3, A5 remain empty

### Test 4: Undo
1. After any translation
2. Click menu: 🌐 Translator > Undo Last Translation
3. Expected: Original text restored

---

## 💡 Pro Tips

1. **Select before translate**: Always select your cells BEFORE opening the translator
2. **Large ranges**: For 1000+ cells, use Quick Translate menu for faster results
3. **Formulas safe**: Cells with formulas are automatically skipped
4. **Undo available**: You can always undo your last translation
5. **Batch mode**: Select entire columns (e.g., column A) to translate all at once

---

## 📝 Summary

✅ **DO THIS**: Use sidebar mode (Extensions > Apps Script > create menu)
❌ **DON'T DO THIS**: Deploy as web app and access via URL

The key difference:
- **Sidebar**: Runs INSIDE your spreadsheet ✓
- **Web App**: Runs OUTSIDE your spreadsheet ✗

That's why web app mode only sees A1 - it has no context of what you actually selected!

---

## 🆘 Still Having Issues?

If you've followed all steps and it's still not working:

1. Check the Execution Log:
   - In Script Editor, click "Executions" (clock icon)
   - Look for error messages

2. Check the Logger:
   - Add `Logger.log()` statements
   - View > Logs (or Ctrl+Enter)

3. Verify your selection:
   - Make sure cells are actually highlighted in blue
   - The selection must be made BEFORE clicking translate

4. Try the Quick Translate menu option instead of the sidebar

---

Need more help? Check the logs and error messages - they'll tell you exactly what's going wrong!
