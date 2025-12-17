const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

// 1. GET ALL PUBLIC STORIES (Approved only)
router.get("/", authorize, async (req, res) => {
    try {
        const query = `
            SELECT s.*, p.full_name as author_name, p.job_title, p.current_company 
            FROM success_stories s
            JOIN alumni_profiles p ON s.user_id = p.user_id
            WHERE s.status = 'approved'
            ORDER BY s.created_at DESC
        `;
        const stories = await pool.query(query);
        res.json(stories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. GET PENDING STORIES (Admin Only)
router.get("/pending", authorize, async (req, res) => {
    try {
        // In a real app, check req.user.role === 'admin' here
        const query = `
            SELECT s.*, p.full_name as author_name 
            FROM success_stories s
            JOIN alumni_profiles p ON s.user_id = p.user_id
            WHERE s.status = 'pending'
            ORDER BY s.created_at ASC
        `;
        const stories = await pool.query(query);
        res.json(stories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. SUBMIT A STORY
router.post("/", authorize, async (req, res) => {
    try {
        const { title, content } = req.body;
        const newStory = await pool.query(
            "INSERT INTO success_stories (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
            [req.user.id, title, content]
        );
        res.json(newStory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. APPROVE/REJECT STORY (Admin Only)
router.put("/:id/status", authorize, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        const { id } = req.params;

        await pool.query(
            "UPDATE success_stories SET status = $1 WHERE story_id = $2",
            [status, id]
        );
        res.json({ msg: `Story ${status}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;