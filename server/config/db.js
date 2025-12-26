const Pool = require("pg").Pool;
require("dotenv").config();

// PRO TIP: This config handles both Local and Cloud connections automatically
const devConfig = {
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
};

// Render/Neon gives us a single long URL string called DATABASE_URL
const proConfig = {
  connectionString: process.env.DATABASE_URL, // <--- Render will provide this
  ssl: {
    rejectUnauthorized: false, // Required for Neon/AWS
  },
};

const pool = new Pool(
  process.env.NODE_ENV === "production" ? proConfig : devConfig
);

module.exports = pool;