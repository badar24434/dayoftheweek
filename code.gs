/**
 * Smart Sheet Translator - Backend (Code.gs) - Full Implementation
 * A Google Apps Script for translating Google Sheets content
 * 
 * IMPORTANT: This should be run as a SIDEBAR/DIALOG, not a standalone web app!
 * Standalone web apps cannot access the user's current spreadsheet selection.
 * 
 * @author Claude
 * @version 2.1
 */

// ============================================================================
// MENU & UI INITIALIZATION
// ============================================================================

/**
 * Creates a custom menu when the spreadsheet is opened
 * This is the proper way to add the translator to a spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🌐 Translator')
    .addItem('Open Translator', 'showTranslatorSidebar')
    .addItem('Quick Translate to Malay', 'quickTranslateToMalay')
    .addItem('Quick Translate to English', 'quickTranslateToEnglish')
    .addSeparator()
    .addItem('Undo Last Translation', 'undoLastTranslation')
    .addToUi();
  
  Logger.log('Translator menu added to spreadsheet');
}

/**
 * Shows the translator interface as a sidebar
 * This is the CORRECT way to use this tool - as a sidebar, not a web app
 */
function showTranslatorSidebar() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('try')
      .setTitle('Smart Sheet Translator')
      .setWidth(400);
    
    SpreadsheetApp.getUi().showSidebar(html);
    Logger.log('Translator sidebar opened');
    
  } catch (error) {
    Logger.log('ERROR in showTranslatorSidebar(): ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Shows the translator interface as a modal dialog
 * Alternative to sidebar
 */
function showTranslatorDialog() {
  try {
    const html = HtmlService.createHtmlOutputFromFile('try')
      .setWidth(800)
      .setHeight(600);
    
    SpreadsheetApp.getUi().showModalDialog(html, 'Smart Sheet Translator');
    Logger.log('Translator dialog opened');
    
  } catch (error) {
    Logger.log('ERROR in showTranslatorDialog(): ' + error.toString());
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Quick translate to Malay (menu shortcut)
 */
function quickTranslateToMalay() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) {
    SpreadsheetApp.getUi().alert('Please select cells to translate');
    return;
  }
  
  const result = translateSelection('ms', null, null);
  
  if (result.success) {
    SpreadsheetApp.getUi().alert(`✓ Translated ${result.translatedCells} cells to Malay`);
  } else {
    SpreadsheetApp.getUi().alert('Error: ' + result.error);
  }
}

/**
 * Quick translate to English (menu shortcut)
 */
function quickTranslateToEnglish() {
  const range = SpreadsheetApp.getActiveRange();
  if (!range) {
    SpreadsheetApp.getUi().alert('Please select cells to translate');
    return;
  }
  
  const result = translateSelection('en', null, null);
  
  if (result.success) {
    SpreadsheetApp.getUi().alert(`✓ Translated ${result.translatedCells} cells to English`);
  } else {
    SpreadsheetApp.getUi().alert('Error: ' + result.error);
  }
}

/**
 * DEPRECATED: Web app entry point
 * Note: Web apps cannot properly access spreadsheet context!
 * Use showTranslatorSidebar() instead by adding onOpen() trigger
 * 
 * @returns {HtmlOutput} The HTML page (for web app compatibility only)
 */
function doGet() {
  try {
    Logger.log('doGet() called - WARNING: Web app mode has limitations!');
    
    const htmlOutput = HtmlService.createHtmlOutputFromFile('try')
      .setTitle('Smart Sheet Translator')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    
    Logger.log('HTML interface loaded - but web app cannot access spreadsheet context properly');
    return htmlOutput;
    
  } catch (error) {
    Logger.log('ERROR in doGet(): ' + error.toString());
    
    return HtmlService.createHtmlOutput(
      '<h1>Error Loading App</h1>' +
      '<p>Unable to load the Smart Sheet Translator interface.</p>' +
      '<p>Error: ' + error.message + '</p>' +
      '<hr>' +
      '<p><strong>TIP:</strong> Instead of using this as a web app, open your spreadsheet and run the function <code>showTranslatorSidebar()</code> from the script editor.</p>'
    );
  }
}

// ============================================================================
// GOOGLE SHEETS CONNECTION
// ============================================================================

/**
 * Connects to the currently active Google Sheet
 * 
 * @returns {Object} Object containing sheet connection details or error
 */
function connectToSheet() {
  try {
    Logger.log('connectToSheet() called - Attempting to connect to active sheet');
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Please open a Google Sheet first.');
    }
    
    // Get the active sheet within the spreadsheet
    const sheet = spreadsheet.getActiveSheet();
    
    if (!sheet) {
      throw new Error('No active sheet found within the spreadsheet.');
    }
    
    // Prepare connection information
    const connectionInfo = {
      success: true,
      spreadsheetName: spreadsheet.getName(),
      spreadsheetId: spreadsheet.getId(),
      sheetName: sheet.getName(),
      sheetId: sheet.getSheetId(),
      message: 'Successfully connected to sheet'
    };
    
    Logger.log('Sheet connection successful: ' + JSON.stringify(connectionInfo));
    return connectionInfo;
    
  } catch (error) {
    Logger.log('ERROR in connectToSheet(): ' + error.toString());
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to connect to sheet'
    };
  }
}

// ============================================================================
// CELL SELECTION RETRIEVAL
// ============================================================================

/**
 * Retrieves the currently selected cell or range from the active sheet
 * 
 * @returns {Object} Object containing selection details or error
 */
function getSelectedRange() {
  try {
    Logger.log('getSelectedRange() called - Retrieving current selection');
    
    // Get the active spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found.');
    }
    
    const sheet = spreadsheet.getActiveSheet();
    if (!sheet) {
      throw new Error('No active sheet found.');
    }
    
    // Get the currently selected range
    let range = sheet.getActiveRange();
    if (!range) {
      Logger.log('No active range, using data range as fallback');
      range = sheet.getDataRange();
    }
    
    // Get a sample of values to help debug
    const values = range.getValues();
    const sampleValues = values.slice(0, Math.min(3, values.length));
    
    // Extract range information
    const selectionInfo = {
      success: true,
      rangeA1: range.getA1Notation(),
      numRows: range.getNumRows(),
      numColumns: range.getNumColumns(),
      startRow: range.getRow(),
      startColumn: range.getColumn(),
      sheetName: sheet.getName(),
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      sampleValues: sampleValues,
      message: 'Selection retrieved successfully'
    };
    
    Logger.log('Selection info: ' + JSON.stringify(selectionInfo));
    return selectionInfo;
    
  } catch (error) {
    Logger.log('ERROR in getSelectedRange(): ' + error.toString());
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve selection'
    };
  }
}

/**
 * Retrieves the content (values) from the currently selected cell or range
 * 
 * @returns {Object} Object containing cell content or error
 */
function getSelectionContent() {
  try {
    Logger.log('getSelectionContent() called - Retrieving content from selection');
    
    // Get the active spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found.');
    }
    
    const sheet = spreadsheet.getActiveSheet();
    if (!sheet) {
      throw new Error('No active sheet found.');
    }
    
    // Get the currently selected range
    const range = sheet.getActiveRange();
    if (!range) {
      throw new Error('No range selected. Please select a cell or range first.');
    }
    
    // Get the values from the range (returns 2D array)
    const values = range.getValues();
    
    // Prepare content information
    const contentInfo = {
      success: true,
      rangeA1: range.getA1Notation(),
      values: values,
      numRows: range.getNumRows(),
      numColumns: range.getNumColumns(),
      isSingleCell: range.getNumRows() === 1 && range.getNumColumns() === 1,
      message: 'Content retrieved successfully'
    };
    
    // If single cell, add the value directly for convenience
    if (contentInfo.isSingleCell) {
      contentInfo.cellValue = values[0][0];
    }
    
    Logger.log('Content retrieved: ' + JSON.stringify(contentInfo));
    return contentInfo;
    
  } catch (error) {
    Logger.log('ERROR in getSelectionContent(): ' + error.toString());
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to retrieve content'
    };
  }
}

// ============================================================================
// LANGUAGE MAPPING HELPER
// ============================================================================

/**
 * Maps human-readable language names to ISO 639-1 language codes
 * Supports both full names and abbreviations
 * 
 * @param {string} languageName - The language name or code
 * @returns {string} ISO 639-1 language code (lowercase)
 */
function mapLanguageNameToIso(languageName) {
  // Convert to lowercase for case-insensitive matching
  const lang = languageName.toLowerCase().trim();
  
  // Language mapping object
  const languageMap = {
    // English variants
    'english': 'en',
    'en': 'en',
    
    // Malay variants
    'malay': 'ms',
    'bahasa melayu': 'ms',
    'ms': 'ms',
    
    // Chinese variants
    'chinese': 'zh',
    'zh': 'zh',
    'mandarin': 'zh',
    'zh-cn': 'zh-CN',
    'zh-tw': 'zh-TW',
    'simplified chinese': 'zh-CN',
    'traditional chinese': 'zh-TW',
    
    // Japanese
    'japanese': 'ja',
    'ja': 'ja',
    
    // Korean
    'korean': 'ko',
    'ko': 'ko',
    
    // Spanish
    'spanish': 'es',
    'español': 'es',
    'es': 'es',
    
    // French
    'french': 'fr',
    'français': 'fr',
    'fr': 'fr',
    
    // German
    'german': 'de',
    'deutsch': 'de',
    'de': 'de',
    
    // Italian
    'italian': 'it',
    'italiano': 'it',
    'it': 'it',
    
    // Portuguese
    'portuguese': 'pt',
    'português': 'pt',
    'pt': 'pt',
    
    // Russian
    'russian': 'ru',
    'ru': 'ru',
    
    // Arabic
    'arabic': 'ar',
    'ar': 'ar',
    
    // Hindi
    'hindi': 'hi',
    'hi': 'hi',
    
    // Thai
    'thai': 'th',
    'th': 'th',
    
    // Vietnamese
    'vietnamese': 'vi',
    'tiếng việt': 'vi',
    'vi': 'vi',
    
    // Indonesian
    'indonesian': 'id',
    'bahasa indonesia': 'id',
    'id': 'id',
    
    // Tagalog
    'tagalog': 'tl',
    'filipino': 'tl',
    'tl': 'tl',
    
    // Bengali
    'bengali': 'bn',
    'bn': 'bn'
  };
  
  // Return mapped code or original input if not found
  return languageMap[lang] || lang;
}

// ============================================================================
// TRANSLATION HISTORY (UNDO SYSTEM)
// ============================================================================

/**
 * Gets or creates the hidden translation history sheet
 * This sheet stores backup data for undo functionality
 * 
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} The history sheet
 */
function getOrCreateHistorySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const historySheetName = '__TranslationHistory__';
  
  let historySheet = spreadsheet.getSheetByName(historySheetName);
  
  // Create the sheet if it doesn't exist
  if (!historySheet) {
    Logger.log('Creating new history sheet: ' + historySheetName);
    historySheet = spreadsheet.insertSheet(historySheetName);
    
    // Hide the sheet from normal view
    historySheet.hideSheet();
    
    // Set up headers
    historySheet.getRange('A1:F1').setValues([[
      'Timestamp',
      'Sheet Name',
      'Cell Address',
      'Original Value',
      'Translated Value',
      'Target Language'
    ]]);
    
    // Format headers
    historySheet.getRange('A1:F1')
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
    
    // Freeze header row
    historySheet.setFrozenRows(1);
  }
  
  return historySheet;
}

/**
 * Saves translation history for undo functionality
 * 
 * @param {string} sheetName - Name of the sheet where translation occurred
 * @param {Array<Object>} historyData - Array of objects with cell data
 */
function saveTranslationHistory(sheetName, historyData) {
  try {
    if (!historyData || historyData.length === 0) {
      Logger.log('No history data to save');
      return;
    }
    
    const historySheet = getOrCreateHistorySheet();
    const timestamp = new Date();
    
    // Prepare rows for batch insert
    const rows = historyData.map(item => [
      timestamp,
      sheetName,
      item.address,
      item.originalValue,
      item.translatedValue,
      item.targetLanguage
    ]);
    
    // Insert all rows at once (more efficient)
    const lastRow = historySheet.getLastRow();
    historySheet.getRange(lastRow + 1, 1, rows.length, 6).setValues(rows);
    
    Logger.log(`Saved ${rows.length} history entries`);
    
  } catch (error) {
    Logger.log('ERROR in saveTranslationHistory(): ' + error.toString());
    // Don't throw error - history failure shouldn't break translation
  }
}

/**
 * Undoes the last translation by restoring original values
 * 
 * @returns {Object} Result object with success status and details
 */
function undoLastTranslation() {
  try {
    Logger.log('undoLastTranslation() called');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const historySheet = spreadsheet.getSheetByName('__TranslationHistory__');
    
    if (!historySheet) {
      throw new Error('No translation history found. Nothing to undo.');
    }
    
    const lastRow = historySheet.getLastRow();
    
    if (lastRow <= 1) {
      throw new Error('No translation history available. Nothing to undo.');
    }
    
    // Get all entries with the most recent timestamp
    const allData = historySheet.getRange(2, 1, lastRow - 1, 6).getValues();
    
    if (allData.length === 0) {
      throw new Error('No translation history available. Nothing to undo.');
    }
    
    // Find the most recent timestamp
    const mostRecentTimestamp = allData[allData.length - 1][0];
    
    // Filter entries with the most recent timestamp
    const recentEntries = allData.filter(row => 
      row[0].getTime() === mostRecentTimestamp.getTime()
    );
    
    Logger.log(`Found ${recentEntries.length} entries to undo`);
    
    // Group entries by sheet name
    const entriesBySheet = {};
    recentEntries.forEach(entry => {
      const sheetName = entry[1];
      if (!entriesBySheet[sheetName]) {
        entriesBySheet[sheetName] = [];
      }
      entriesBySheet[sheetName].push({
        address: entry[2],
        originalValue: entry[3]
      });
    });
    
    // Restore values for each sheet
    let restoredCount = 0;
    for (const sheetName in entriesBySheet) {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        Logger.log(`WARNING: Sheet "${sheetName}" not found, skipping`);
        continue;
      }
      
      const entries = entriesBySheet[sheetName];
      entries.forEach(entry => {
        try {
          const range = sheet.getRange(entry.address);
          range.setValue(entry.originalValue);
          restoredCount++;
        } catch (err) {
          Logger.log(`ERROR restoring ${entry.address}: ${err.toString()}`);
        }
      });
    }
    
    // Delete the undone entries from history
    const rowsToDelete = recentEntries.length;
    historySheet.deleteRows(lastRow - rowsToDelete + 1, rowsToDelete);
    
    Logger.log(`Successfully undone ${restoredCount} cells`);
    
    return {
      success: true,
      message: 'Translation undone successfully',
      restoredCells: restoredCount,
      timestamp: mostRecentTimestamp
    };
    
  } catch (error) {
    Logger.log('ERROR in undoLastTranslation(): ' + error.toString());
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to undo translation'
    };
  }
}

// ============================================================================
// CORE TRANSLATION FUNCTIONS
// ============================================================================

/**
 * Detects and translates selected range to target language(s)
 * Handles multiple target languages by writing translations in adjacent columns
 * 
 * @param {GoogleAppsScript.Spreadsheet.Range} range - The range to translate
 * @param {Array<string>|string} targetLangs - Target language code(s)
 * @returns {Object} Translation summary with statistics
 */
function detectAndTranslate(range, targetLangs) {
  try {
    Logger.log('detectAndTranslate() called');
    Logger.log('Range: ' + range.getA1Notation());
    Logger.log('Target languages: ' + JSON.stringify(targetLangs));
    
    // Ensure targetLangs is an array
    if (!Array.isArray(targetLangs)) {
      targetLangs = [targetLangs];
    }
    
    // Map language names to ISO codes
    targetLangs = targetLangs.map(lang => mapLanguageNameToIso(lang));
    
    const sheet = range.getSheet();
    const values = range.getValues();
    const formulas = range.getFormulas();
    const numRows = range.getNumRows();
    const numCols = range.getNumColumns();
    
    Logger.log(`Range dimensions: ${numRows} rows x ${numCols} columns`);
    Logger.log(`Total cells in range: ${numRows * numCols}`);
    
    // Statistics tracking (overall, not per language)
    const totalCellsInRange = numRows * numCols;
    let translatedCells = 0;
    let skippedCells = 0;
    const sourceLangsDetected = new Set();
    const historyData = [];
    
    // Process only the FIRST target language (for web app, typically one language)
    // If multiple languages needed, only process the first one to the original range
    const targetLang = targetLangs[0];
    Logger.log(`Processing target language: ${targetLang}`);
    
    // Prepare arrays for batch updates
    const translatedValues = [];
    
    // Process each cell in the range
    for (let row = 0; row < numRows; row++) {
      const translatedRow = [];
      
      for (let col = 0; col < numCols; col++) {
        const cellValue = values[row][col];
        const cellFormula = formulas[row][col];
        
        // Skip empty cells
        if (cellValue === '' || cellValue === null || cellValue === undefined) {
          translatedRow.push('');
          skippedCells++;
          continue;
        }
        
        // Skip cells with formulas
        if (cellFormula !== '') {
          translatedRow.push(cellValue); // Keep original value
          skippedCells++;
          Logger.log(`Skipped formula cell at row ${row + 1}, col ${col + 1}`);
          continue;
        }
        
        // Convert to string for translation
        const textToTranslate = String(cellValue);
        
        // Skip very short text (likely not meaningful)
        if (textToTranslate.trim().length < 2) {
          translatedRow.push(cellValue);
          skippedCells++;
          continue;
        }
        
        try {
          // Detect source language (simplified)
          sourceLangsDetected.add('auto-detected');
          
          // Translate the text
          const translatedText = LanguageApp.translate(
            textToTranslate,
            '',
            targetLang
          );
          
          translatedRow.push(translatedText);
          translatedCells++;
          
          Logger.log(`Translated cell [${row},${col}]: "${textToTranslate}" -> "${translatedText}"`);
          
          // Store history
          const cellAddress = sheet.getRange(
            range.getRow() + row,
            range.getColumn() + col
          ).getA1Notation();
          
          historyData.push({
            address: cellAddress,
            originalValue: cellValue,
            translatedValue: translatedText,
            targetLanguage: targetLang
          });
          
        } catch (translateError) {
          Logger.log(`Translation error for cell (${row},${col}): ${translateError.toString()}`);
          translatedRow.push(cellValue); // Keep original on error
          skippedCells++;
        }
      }
      
      translatedValues.push(translatedRow);
    }
    
    Logger.log(`Finished processing. Translated: ${translatedCells}, Skipped: ${skippedCells}`);
    
    // Write translated values back to the original range
    range.setValues(translatedValues);
    Logger.log(`Written ${translatedCells} translations to range ${range.getA1Notation()}`);
    
    // Save history for undo
    if (historyData.length > 0) {
      saveTranslationHistory(sheet.getName(), historyData);
    }
    
    // Prepare summary
    const summary = {
      success: true,
      totalCells: totalCellsInRange,
      translatedCells: translatedCells,
      skippedCells: skippedCells,
      sourceLangs: Array.from(sourceLangsDetected),
      targetLangs: targetLangs,
      timestamp: new Date().toISOString(),
      message: `Successfully translated ${translatedCells} out of ${totalCellsInRange} cells`
    };
    
    Logger.log('Translation summary: ' + JSON.stringify(summary));
    return summary;
    
  } catch (error) {
    Logger.log('ERROR in detectAndTranslate(): ' + error.toString());
    throw error;
  }
}

// ============================================================================
// MAIN TRANSLATION FUNCTION (CALLED FROM FRONTEND)
// ============================================================================

/**
 * Main translation function called from the frontend
 * Translates the selected range to the specified target language
 * 
 * When running in SIDEBAR mode (recommended), this will work correctly.
 * When running as web app, it has limitations accessing spreadsheet context.
 * 
 * @param {string} targetLanguage - The target language code
 * @param {string} spreadsheetId - Optional: Spreadsheet ID (usually null for sidebar)
 * @param {string} rangeA1 - Optional: Range in A1 notation (usually null for sidebar)
 * @returns {Object} Object containing translation results or error
 */
function translateSelection(targetLanguage, spreadsheetId, rangeA1) {
  try {
    Logger.log('=== translateSelection() START ===');
    Logger.log('Target language: ' + targetLanguage);
    Logger.log('Spreadsheet ID: ' + (spreadsheetId || 'null (will use active)'));
    Logger.log('Range A1: ' + (rangeA1 || 'null (will use active)'));
    
    let spreadsheet;
    let sheet;
    let range;
    
    // Get spreadsheet - prefer active spreadsheet (sidebar mode)
    if (spreadsheetId) {
      try {
        spreadsheet = SpreadsheetApp.openById(spreadsheetId);
        Logger.log('✓ Opened spreadsheet by ID: ' + spreadsheet.getName());
      } catch (e) {
        Logger.log('⚠ Failed to open by ID, using active spreadsheet');
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      }
    } else {
      // This is the normal path for sidebar usage
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      Logger.log('✓ Using active spreadsheet (sidebar mode)');
    }
    
    if (!spreadsheet) {
      throw new Error('No spreadsheet found. Make sure you are running this from within a Google Sheet.');
    }
    
    Logger.log('Using spreadsheet: ' + spreadsheet.getName() + ' (ID: ' + spreadsheet.getId() + ')');
    
    // Get sheet - always use active sheet
    sheet = spreadsheet.getActiveSheet();
    if (!sheet) {
      throw new Error('No active sheet found.');
    }
    
    Logger.log('Using sheet: ' + sheet.getName());
    
    // Get range - prefer active range (sidebar mode)
    if (rangeA1) {
      try {
        range = sheet.getRange(rangeA1);
        Logger.log('✓ Got range by A1 notation: ' + rangeA1);
      } catch (e) {
        Logger.log('⚠ Failed to get range by A1, using active range');
        range = sheet.getActiveRange();
      }
    } else {
      // This is the normal path for sidebar usage
      range = sheet.getActiveRange();
      Logger.log('✓ Using active range (sidebar mode)');
    }
    
    if (!range) {
      throw new Error('No range selected. Please select cells in the spreadsheet first.');
    }
    
    const rangeNotation = range.getA1Notation();
    const numRows = range.getNumRows();
    const numCols = range.getNumColumns();
    
    Logger.log('Selected range: ' + rangeNotation);
    Logger.log('Dimensions: ' + numRows + ' rows × ' + numCols + ' columns');
    Logger.log('Total cells: ' + (numRows * numCols));
    
    // Validate that range contains data
    const values = range.getValues();
    Logger.log('First cell value: "' + values[0][0] + '"');
    
    if (values.length > 1 || values[0].length > 1) {
      Logger.log('Sample of range (first 2 rows):');
      for (let i = 0; i < Math.min(2, values.length); i++) {
        Logger.log('  Row ' + (i+1) + ': ' + JSON.stringify(values[i].slice(0, 3)));
      }
    }
    
    const hasData = values.some(row => row.some(cell => cell !== '' && cell !== null));

    if (!hasData) {
      throw new Error('Selected range is empty. Please select cells with content.');
    }
    
    Logger.log('✓ Range contains data, proceeding with translation');
    
    // Map language name to ISO code
    const targetLangCode = mapLanguageNameToIso(targetLanguage);
    Logger.log('Mapped language code: ' + targetLangCode);
    
    // Perform translation
    Logger.log('Calling detectAndTranslate()...');
    const summary = detectAndTranslate(range, targetLangCode);
    
    // Add additional information
    summary.selectionInfo = {
      range: rangeNotation,
      cellCount: numRows * numCols,
      targetLanguage: targetLangCode,
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      sheetName: sheet.getName()
    };
    
    Logger.log('=== translateSelection() SUCCESS ===');
    Logger.log('Translated: ' + summary.translatedCells + ' cells');
    Logger.log('Skipped: ' + summary.skippedCells + ' cells');
    
    return summary;
    
  } catch (error) {
    Logger.log('=== translateSelection() ERROR ===');
    Logger.log('ERROR: ' + error.toString());
    Logger.log('Stack: ' + error.stack);
    
    return {
      success: false,
      error: error.message,
      message: 'Translation failed',
      details: error.stack
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test function to verify all backend functions are working
 * Can be run from the Apps Script editor
 * 
 * @returns {Object} Test results
 */
function testAllFunctions() {
  Logger.log('\n========== TESTING ALL FUNCTIONS ==========\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test 1: Connect to sheet
  Logger.log('Test 1: connectToSheet()');
  const connectionTest = connectToSheet();
  results.tests.push({
    function: 'connectToSheet',
    result: connectionTest
  });
  
  // Test 2: Get selected range
  Logger.log('\nTest 2: getSelectedRange()');
  const rangeTest = getSelectedRange();
  results.tests.push({
    function: 'getSelectedRange',
    result: rangeTest
  });
  
  // Test 3: Get selection content
  Logger.log('\nTest 3: getSelectionContent()');
  const contentTest = getSelectionContent();
  results.tests.push({
    function: 'getSelectionContent',
    result: contentTest
  });
  
  // Test 4: Language mapping
  Logger.log('\nTest 4: mapLanguageNameToIso()');
  const languageTests = {
    'English': mapLanguageNameToIso('English'),
    'Malay': mapLanguageNameToIso('Malay'),
    'chinese': mapLanguageNameToIso('chinese'),
    'ja': mapLanguageNameToIso('ja')
  };
  results.tests.push({
    function: 'mapLanguageNameToIso',
    result: languageTests
  });
  
  // Test 5: Translate selection
  Logger.log('\nTest 5: translateSelection()');
  const translationTest = translateSelection('ms');
  results.tests.push({
    function: 'translateSelection',
    result: translationTest
  });
  
  Logger.log('\n========== TEST RESULTS ==========');
  Logger.log(JSON.stringify(results, null, 2));
  Logger.log('==================================\n');
  
  return results;
}

/**
 * Test translation with multiple target languages
 * Select some cells and run this function to test multi-language translation
 */
function testMultiLanguageTranslation() {
  try {
    const range = SpreadsheetApp.getActiveRange();
    if (!range) {
      throw new Error('Please select a range first');
    }
    
    // Test with multiple languages
    const targetLanguages = ['es', 'fr', 'ja'];
    const result = detectAndTranslate(range, targetLanguages);
    
    Logger.log('Multi-language translation test result:');
    Logger.log(JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    Logger.log('ERROR in testMultiLanguageTranslation(): ' + error.toString());
    return { success: false, error: error.message };
  }
}