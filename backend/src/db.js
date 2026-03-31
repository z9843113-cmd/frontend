const { Pool } = require('pg');
require('dotenv').config({ path: 'C:/Users/amitr/Videos/crypto/backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
