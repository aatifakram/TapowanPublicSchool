const { db } = require('./server/db-sqlite.js');
try {
  const triggers = db.prepare(\"SELECT name, sql FROM sqlite_master WHERE type='trigger';\").all();
  console.log(JSON.stringify(triggers, null, 2));
} catch (e) {
  console.error(e);
}
