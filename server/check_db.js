const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join('C:', 'Users', 'Admin', 'Desktop', 'My Project', 'Slip & Receipt', 'TapowanPublicSchool-fixed', 'server', 'school.db');
const db = new Database(dbPath);

console.log("Searching for Maryam Fatima...");
const rows = db.prepare("SELECT * FROM students WHERE fullName LIKE '%Maryam%'").all();
console.log(JSON.stringify(rows, null, 2));
db.close();
