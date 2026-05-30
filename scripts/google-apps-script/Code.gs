/**
 * FitForge Leaderboard & Users - Google Apps Script
 * 
 * SETUP:
 * 1. Create a new Google Sheet: https://sheets.google.com
 * 2. Extensions > Apps Script
 * 3. Replace the default Code.gs with this file
 * 4. Create sheets: "Submissions", "Leaderboard", "Users" (or they will be auto-created)
 * 5. Deploy: Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL and add it to your app's LEADERBOARD_API_URL config
 * 7. Add a trigger: Triggers > Add trigger > aggregateLeaderboard > Time-driven > Day timer > 12am-1am
 */

const SHEET_SUBMISSIONS = 'Submissions';
const SHEET_LEADERBOARD = 'Leaderboard';
const SHEET_USERS = 'Users';
const LEADERBOARD_LIMIT = 10;

/**
 * Handle POST - PR submission, createUser, updateUser
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'createUser') {
      return handleCreateUser(data);
    }
    if (action === 'updateUser') {
      return handleUpdateUser(data);
    }

    // Default: PR submission
    const sheet = getSubmissionsSheet();
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    const timestamp = new Date().toISOString();
    const userId = data.userId || 'anonymous';
    const userName = data.userName || 'Athlete';
    const exerciseName = data.exerciseName || '';
    const weight = Number(data.weight) || 0;
    const reps = Number(data.reps) || 0;
    const oneRepMax = Number(data.oneRepMax) || 0;
    const date = data.date || new Date().toISOString().split('T')[0];
    
    if (!exerciseName || weight <= 0 || reps <= 0) {
      return createResponse(400, { error: 'Invalid submission' });
    }
    
    sheet.getRange(nextRow, 1, nextRow, 8).setValues([[
      timestamp, userId, userName, exerciseName, weight, reps, oneRepMax, date
    ]]);
    
    aggregateLeaderboard();
    return createResponse(200, { success: true, message: 'PR submitted' });
  } catch (err) {
    return createResponse(500, { error: String(err) });
  }
}

/**
 * Handle GET - Leaderboard or user by email
 */
function doGet(e) {
  try {
    const params = e?.parameter || {};
    const action = params.action;

    if (action === 'user') {
      const email = params.email;
      if (!email) return createResponse(400, { error: 'Missing email' });
      const user = getUserByEmail(email);
      if (!user) return createResponse(200, { user: null });
      return createResponse(200, { user: user });
    }

    const leaderboard = getLeaderboardData();
    return createResponse(200, { leaderboard });
  } catch (err) {
    return createResponse(500, { error: String(err) });
  }
}

function handleCreateUser(data) {
  const email = String(data.email || '').trim().toLowerCase();
  if (!email) return createResponse(400, { error: 'Email required' });

  const sheet = getUsersSheet();
  const existing = findUserRow(sheet, email);
  if (existing >= 0) {
    return createResponse(400, { error: 'User already exists' });
  }

  const createdAt = new Date().toISOString();
  const row = [
    email,
    String(data.name || 'Athlete'),
    Number(data.weight) || 70,
    Number(data.height) || 175,
    Number(data.age) || 25,
    String(data.gender || 'male'),
    String(data.activityLevel || 'moderate'),
    Number(data.dailyCalorieGoal) || 2500,
    createdAt
  ];
  const nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, nextRow, 9).setValues([row]);
  return createResponse(200, {
    user: {
      email: row[0],
      name: row[1],
      weight: row[2],
      height: row[3],
      age: row[4],
      gender: row[5],
      activityLevel: row[6],
      dailyCalorieGoal: row[7],
      createdAt: row[8]
    }
  });
}

function handleUpdateUser(data) {
  const email = String(data.email || '').trim().toLowerCase();
  if (!email) return createResponse(400, { error: 'Email required' });

  const sheet = getUsersSheet();
  const rowIndex = findUserRow(sheet, email);
  if (rowIndex < 0) return createResponse(404, { error: 'User not found' });

  const row = sheet.getRange(rowIndex, 1, rowIndex, 9).getValues()[0];
  if (data.name !== undefined) row[1] = String(data.name);
  if (data.weight !== undefined) row[2] = Number(data.weight);
  if (data.height !== undefined) row[3] = Number(data.height);
  if (data.age !== undefined) row[4] = Number(data.age);
  if (data.gender !== undefined) row[5] = String(data.gender);
  if (data.activityLevel !== undefined) row[6] = String(data.activityLevel);
  if (data.dailyCalorieGoal !== undefined) row[7] = Number(data.dailyCalorieGoal);

  sheet.getRange(rowIndex, 1, rowIndex, 9).setValues([row]);
  return createResponse(200, { success: true });
}

function getUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_USERS);
    sheet.getRange(1, 1, 1, 9).setValues([['Email', 'Name', 'Weight', 'Height', 'Age', 'Gender', 'ActivityLevel', 'DailyCalorieGoal', 'CreatedAt']]);
  }
  return sheet;
}

function findUserRow(sheet, email) {
  const data = sheet.getDataRange().getValues();
  const emailLower = String(email).toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0] || '').toLowerCase() === emailLower) return i + 1;
  }
  return -1;
}

function getUserByEmail(email) {
  const sheet = getUsersSheet();
  const rowIndex = findUserRow(sheet, email);
  if (rowIndex < 0) return null;
  const row = sheet.getRange(rowIndex, 1, rowIndex, 9).getValues()[0];
  return {
    email: String(row[0] || ''),
    name: String(row[1] || ''),
    weight: Number(row[2]) || 0,
    height: Number(row[3]) || 0,
    age: Number(row[4]) || 0,
    gender: String(row[5] || 'male'),
    activityLevel: String(row[6] || 'moderate'),
    dailyCalorieGoal: Number(row[7]) || 2500,
    createdAt: String(row[8] || '')
  };
}

/**
 * Aggregate submissions into leaderboard - run daily at 12 AM via trigger
 */
function aggregateLeaderboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const subSheet = ss.getSheetByName(SHEET_SUBMISSIONS);
  let lbSheet = ss.getSheetByName(SHEET_LEADERBOARD);
  
  if (!subSheet) {
    Logger.log('Submissions sheet not found');
    return;
  }
  
  if (!lbSheet) {
    lbSheet = ss.insertSheet(SHEET_LEADERBOARD);
    lbSheet.getRange(1, 1, 1, 7).setValues([['Rank', 'UserName', 'ExerciseName', 'Weight', 'Reps', 'OneRepMax', 'Date']]);
  }
  
  const data = subSheet.getDataRange().getValues();
  if (data.length < 2) {
    lbSheet.getRange(2, 1, 100, 7).clearContent();
    return;
  }
  
  // data[0] = headers, data[1+] = rows
  // Cols: 0=Timestamp, 1=UserId, 2=UserName, 3=ExerciseName, 4=Weight, 5=Reps, 6=OneRepMax, 7=Date
  const byKey = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const userName = String(row[2] || '').trim();
    const exerciseName = String(row[3] || '').trim();
    const weight = Number(row[4]) || 0;
    const reps = Number(row[5]) || 0;
    const oneRepMax = Number(row[6]) || 0;
    const date = String(row[7] || '').trim();
    
    if (!userName || !exerciseName || oneRepMax <= 0) continue;
    
    const key = userName + '|' + exerciseName;
    if (!byKey[key] || oneRepMax > byKey[key].oneRepMax) {
      byKey[key] = { userName, exerciseName, weight, reps, oneRepMax, date };
    }
  }
  
  const all = Object.values(byKey).sort((a, b) => b.oneRepMax - a.oneRepMax).slice(0, LEADERBOARD_LIMIT);
  
  lbSheet.getRange(2, 1, 100, 7).clearContent();
  if (all.length > 0) {
    const rows = all.map((e, i) => [i + 1, e.userName, e.exerciseName, e.weight, e.reps, e.oneRepMax, e.date]);
    lbSheet.getRange(2, 1, 1 + rows.length, 7).setValues(rows);
  }
}

function getSubmissionsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_SUBMISSIONS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_SUBMISSIONS);
    sheet.getRange(1, 1, 1, 8).setValues([['Timestamp', 'UserId', 'UserName', 'ExerciseName', 'Weight', 'Reps', 'OneRepMax', 'Date']]);
  }
  return sheet;
}

function getLeaderboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_LEADERBOARD);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) break;
    result.push({
      rank: Number(row[0]) || i,
      userName: String(row[1] || ''),
      exerciseName: String(row[2] || ''),
      weight: Number(row[3]) || 0,
      reps: Number(row[4]) || 0,
      oneRepMax: Number(row[5]) || 0,
    });
  }
  return result;
}

function createResponse(status, body) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
