const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "Attachment db",
  password: "1234",
  port: 5432,
});

module.exports = pool;