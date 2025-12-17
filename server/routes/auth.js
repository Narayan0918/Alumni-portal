const router = require("express").Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("../utils/jwtGenerator");
const { body, validationResult } = require('express-validator');

// REGISTER ROUTE
router.post("/register", [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty()
], async (req, res) => {
  try {
    // 1. Validate Input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name, graduation_year, major } = req.body;

    // 2. Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exists!");
    }

    // 3. Bcrypt the password (Best Practice)
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Enter user inside Database (Transaction recommended)
    const newUser = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *",
      [email, bcryptPassword]
    );

    const newProfile = await pool.query(
        "INSERT INTO alumni_profiles (user_id, full_name, graduation_year, major) VALUES ($1, $2, $3, $4)",
        [newUser.rows[0].user_id, full_name, graduation_year, major]
    );

    // 5. Generate JWT Token
    const token = jwtGenerator(newUser.rows[0].user_id, newUser.rows[0].role);

    res.json({ token, user: { id: newUser.rows[0].user_id, name: full_name } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 2. Check if incoming password matches db password
    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 3. Give them the token
    const token = jwtGenerator(user.rows[0].user_id, user.rows[0].role);
    res.json({ token });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;