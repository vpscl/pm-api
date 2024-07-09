const { Pool } = require("pg");
require("dotenv").config();

const DB_URL = process.env.DB_URL;

const pool = new Pool({
  connectionString: DB_URL,
});

module.exports = {
  pool,
};
