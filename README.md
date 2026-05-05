# User-onboarding-automation-Google-Workspace-Apps-script-
Project showcasing  google workspace onboarding automation system with google apps scripting
It processes multiple user entries from a Google Sheet, validates the data, creates Drive folders, sends welcome emails, and logs both successful and invalid entries.

The system is designed to be:
Safe (no admin rights required — mock user creation)
Scalable (multi‑row processing)
Robust (centralized error logging + data validation)
User‑friendly (custom menu in Google Sheets)
Production‑ready structure (clear separation of concerns)
This project demonstrates practical automation skills relevant to IT support, Google Workspace administration, and process development.

Features

- Multi‑row onboarding
Processes every row in the spreadsheet and skips empty ones.

- Data validation
Ensures each row contains:
first name
last name
valid emai
at least one group
Invalid rows are logged and skipped safely.

- Mock Workspace user creation
Simulates:
user creation
group assignment
No admin privileges required.

- Real Drive folder creation
Each valid user receives a personal onboarding folder.

- Automated welcome email
A personalized welcome message is sent via Gmail.

- Logging
Three separate logs:
Taulukko1 → successful onboardings
InvalidRows → validation failures
Errors → runtime errors

Architecture

Google Sheet
getAllUsers()          > Reads all rows
validateUserData()     > Ensures data quality
processAllUsers()      > Main workflow

createWorkspaceUser()  > Mock user creation
addUserToGroups()      > Mock group assignment
createUserDriveFolder()> Real Drive folder
sendWelcomeEmail()     > Real Gmail email

logToSheet()           > Success log
logInvalidRow()        > Validation log
logError()             > Error log



Installation & Setup
1. Open Google Apps Script
Create a new project or open an existing one.

2. Copy the contents of Code.gs
Paste into your Apps Script editor.

3. Prepare your Google Sheet
Ensure the sheet contains the required columns (A–F).

4. Reload the sheet
A new menu appears: Onboarding > Run onboarding for all users

5. Run the onboarding
The script processes all rows automatically.



Example Workflow
1. HR fills in user data
2. IT opens the sheet
3. IT selects Run onboarding for all users
4. Script validates each row
5. Valid rows > onboarding
5. Invalid rows > logged
6. Errors > logged
7. Drive folders + emails sent


Author
Karoliina Kylmäkorpi  
IT Support Specialist
Vaasa, Finland
