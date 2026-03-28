module.exports = process.env.DATABASE_URL
  ? require("./db-postgres")
  : require("./db-sqlite");
