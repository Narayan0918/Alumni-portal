const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

// 1. GET MY PROFILE (Dashboard)
router.get("/me", authorize, async (req, res) => {
  try {
    // req.user.id comes from the authorize middleware
    const user = await pool.query(
      "SELECT u.user_id, u.email, u.role, p.* FROM users u LEFT JOIN alumni_profiles p ON u.user_id = p.user_id WHERE u.user_id = $1",
      [req.user.id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 2. UPDATE PROFILE
router.put("/me", authorize, async (req, res) => {
  try {
    const { full_name, current_company, job_title, bio, skills, social_links } = req.body;
    
    // We update the alumni_profiles table
    const updateProfile = await pool.query(
      "UPDATE alumni_profiles SET full_name = $1, current_company = $2, job_title = $3, bio = $4, skills = $5, social_links = $6 WHERE user_id = $7 RETURNING *",
      [full_name, current_company, job_title, bio, skills, social_links, req.user.id]
    );

    res.json(updateProfile.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// 3. SEARCH ALUMNI DIRECTORY (Public to logged-in users)
router.get("/", authorize, async (req, res) => {
  try {
    const { name, year, major } = req.query;

    // Base query
    let query = "SELECT * FROM alumni_profiles WHERE 1=1";
    let values = [];
    let count = 1;

    // Dynamic filtering
    if (name) {
      query += ` AND full_name ILIKE $${count}`; // ILIKE is case-insensitive
      values.push(`%${name}%`);
      count++;
    }
    if (year) {
      query += ` AND graduation_year = $${count}`;
      values.push(year);
      count++;
    }
    if (major) {
      query += ` AND major ILIKE $${count}`;
      values.push(`%${major}%`);
      count++;
    }

    const users = await pool.query(query, values);
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;