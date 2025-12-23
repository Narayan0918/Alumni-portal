const router = require("express").Router();
const pool = require("../config/db");

// GET ALL INSTITUTIONS (Public)
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT institution_id, name FROM institutions ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;