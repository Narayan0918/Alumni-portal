const router = require("express").Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("../utils/jwtGenerator");
const { body, validationResult } = require("express-validator");

// REGISTER ROUTE
router.post("/register", async (req, res) => {
  try {
    // 1. Destructure all possible fields (including new ones)
    const { email, password, full_name, graduation_year, major, institution_id, new_institute_name, new_institute_location } = req.body;

    // 2. Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length !== 0) {
      return res.status(401).send("User already exists");
    }

    // 3. Encrypt Password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 4. Handle Institute (Smart Check)
    let finalInstitutionId = institution_id;

    if (institution_id === 'other') {
        if (!new_institute_name || !new_institute_location) {
            return res.status(400).json("Please provide Institute Name and Location");
        }

        // TRIM whitespace (so " Harvard " becomes "Harvard")
        const cleanName = new_institute_name.trim();

        // CHECK: Does it already exist? (Case-insensitive)
        const existingInst = await pool.query(
            "SELECT institution_id FROM institutions WHERE name ILIKE $1", 
            [cleanName]
        );

        if (existingInst.rows.length > 0) {
            // FOUND IT! Reuse the existing ID
            finalInstitutionId = existingInst.rows[0].institution_id;
        } else {
            // DOES NOT EXIST: Create new one
            const newInst = await pool.query(
                "INSERT INTO institutions (name, location) VALUES ($1, $2) RETURNING institution_id",
                [cleanName, new_institute_location]
            );
            finalInstitutionId = newInst.rows[0].institution_id;
        }
    }

    // 5. Create User (Using the final ID)
    const newUser = await pool.query(
      "INSERT INTO users (full_name, email, password_hash, graduation_year, major, institution_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [full_name, email, bcryptPassword, graduation_year, major, finalInstitutionId]
    );

    // 6. Create Profile
    await pool.query(
      "INSERT INTO alumni_profiles (user_id, full_name) VALUES ($1, $2)",
      [newUser.rows[0].user_id, full_name]
    );

    // 7. Generate Token
    const token = jwtGenerator(newUser.rows[0].user_id);
    res.json({ token });

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
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json("Password or Email is incorrect");
    }

    // 2. Check if incoming password matches db password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
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
