// Centralized error logging utility
// Automatically creates an "Errors" sheet if missing
function logError(functionName, error) {
  const ss = SpreadsheetApp.openById("1p_w5os7N8DQHCM_Mf5LoazWA9YYia3jaeQknp2OMsWM");
  let sheet = ss.getSheetByName("Errors");

  if (!sheet) {
    sheet = ss.insertSheet("Errors");
    sheet.appendRow(["Timestamp", "Function", "Error Message", "Stack Trace"]);
  }

  sheet.appendRow([
    new Date(),
    functionName,
    error.message || error.toString(),
    error.stack || "No stack trace"
  ]);
}



// Logs invalid user rows into a dedicated sheet
// Used when validation fails
function logInvalidRow(user, errors) {
  const ss = SpreadsheetApp.openById("1p_w5os7N8DQHCM_Mf5LoazWA9YYia3jaeQknp2OMsWM");
  let sheet = ss.getSheetByName("InvalidRows");

  if (!sheet) {
    sheet = ss.insertSheet("InvalidRows");
    sheet.appendRow(["Timestamp", "Email", "Full Name", "Errors"]);
  }

  sheet.appendRow([
    new Date(),
    user.email || "N/A",
    (user.firstName || "") + " " + (user.lastName || ""),
    errors.join(", ")
  ]);
}



// Validates user data before onboarding
// Returns an array of validation error messages
function validateUserData(user) {
  const errors = [];

  if (!user.firstName) errors.push("Missing first name");
  if (!user.lastName) errors.push("Missing last name");
  if (!user.email) errors.push("Missing email address");

  // Basic email format validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (user.email && !emailPattern.test(user.email)) {
    errors.push("Invalid email format");
  }

  if (!user.groups || user.groups.length === 0) {
    errors.push("No groups specified");
  }

  return errors;
}



// Reads ALL user rows from the spreadsheet
// Returns an array of user objects
// Skips empty rows automatically
function getAllUsers() {
  try {
    const sheet = SpreadsheetApp.openById("1p_w5os7N8DQHCM_Mf5LoazWA9YYia3jaeQknp2OMsWM")
      .getSheetByName("Taulukko1");

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return []; // No data rows

    const data = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
    const users = [];

    data.forEach(row => {
      // Skip completely empty rows
      if (!row[0] && !row[1] && !row[2]) return;

      users.push({
        firstName: row[0],
        lastName: row[1],
        email: row[2],
        department: row[3],
        role: row[4],
        groups: row[5] ? row[5].split(",").map(g => g.trim()) : []
      });
    });

    return users;

  } catch (error) {
    logError("getAllUsers", error);
    throw error;
  }
}



// Processes ALL users in the sheet
// Validates each row, logs invalid ones,
// and runs onboarding for valid rows
function processAllUsers() {
  try {
    const users = getAllUsers();

    users.forEach(user => {
      const validationErrors = validateUserData(user);

      if (validationErrors.length > 0) {
        logInvalidRow(user, validationErrors);
        Logger.log("Validation failed for " + (user.email || "N/A") +
          ": " + validationErrors.join(", "));
        return; // Skip this user
      }

      // Create mock user
      const createdUser = createWorkspaceUser(user);

      if (!createdUser || !createdUser.name) {
        logError("processAllUsers", new Error("Invalid createdUser object"));
        return;
      }

      // Continue onboarding
      addUserToGroups(createdUser, user.groups);
      const folderId = createUserDriveFolder(createdUser);
      sendWelcomeEmail(createdUser, folderId);
      logToSheet(createdUser, folderId);
    });

  } catch (error) {
    logError("processAllUsers", error);
    throw error;
  }
}



// Adds a custom menu to Google Sheets UI
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Onboarding")
    .addItem("Run onboarding for all users", "processAllUsers")
    .addToUi();
}



// MOCK: Creates a fake Workspace user object
function createWorkspaceUser(user) {
  try {
    return {
      id: "mock-user-" + Date.now(),
      primaryEmail: user.email,
      name: {
        givenName: user.firstName,
        familyName: user.lastName,
        fullName: user.firstName + " " + user.lastName
      }
    };

  } catch (error) {
    logError("createWorkspaceUser", error);
    throw error;
  }
}



// MOCK: Simulates adding the user to Google Groups
function addUserToGroups(createdUser, groups) {
  try {
    Logger.log("MOCK: User would be added to groups: " + groups.join(", "));

  } catch (error) {
    logError("addUserToGroups", error);
    throw error;
  }
}


// Creates a Drive folder for the user
function createUserDriveFolder(createdUser) {
  try {
    const folder = DriveApp.createFolder("Onboarding - " + createdUser.name.fullName);
    return folder.getId();

  } catch (error) {
    logError("createUserDriveFolder", error);
    throw error;
  }
}


// Sends a personalized welcome email to the newly created user.
// This function requires a valid createdUser object and a Drive folder ID.
// If called without proper arguments, execution stops and the error is logged.
function sendWelcomeEmail(createdUser, folderId) {
  try {

    // Safety check: Prevents this function from running without valid parameters.
    // This commonly happens if someone accidentally runs sendWelcomeEmail()
    // directly from the Apps Script editor (Run → sendWelcomeEmail),
    // which provides no arguments.
    if (!createdUser || !createdUser.name) {
      throw new Error("sendWelcomeEmail called without a valid createdUser object");
    }

    // Build the email subject line using the user's first name.
    const subject = "Welcome to the team, " + createdUser.name.givenName + "!";

    // Build the email body. Includes a greeting, a mock onboarding message,
    // and the ID of the Drive folder created for the user.
    const body =
      "Hi " + createdUser.name.givenName + ",\n\n" +
      "This is a mock welcome email.\n" +
      "Your Drive folder ID is: " + folderId + "\n\n" +
      "Best regards,\nOnboarding Bot";

    // Sends the email using GmailApp.
    // In mock mode, this is the only real action performed.
    GmailApp.sendEmail(createdUser.primaryEmail, subject, body);

  } catch (error) {

    // Logs the error to the central error log sheet.
    logError("sendWelcomeEmail", error);

    // Re-throws the error so it appears in execution logs.
    throw error;
  }
}



// Logs successful onboarding results into the spreadsheet
function logToSheet(createdUser, folderId) {
  try {
    const sheet = SpreadsheetApp.openById("1p_w5os7N8DQHCM_Mf5LoazWA9YYia3jaeQknp2OMsWM")
      .getSheetByName("Taulukko1");

    sheet.appendRow([
      new Date(),
      createdUser.primaryEmail,
      createdUser.name.fullName,
      folderId,
      "MOCK USER CREATED"
    ]);

  } catch (error) {
    logError("logToSheet", error);
    throw error;
  }
}
