const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

// GET THE INSTITUTE WALL (Aggregated Data)
router.get("/", authorize, async (req, res) => {
    try {
        // 1. Fetch Latest 3 Approved Success Stories
        const stories = await pool.query(`
            SELECT s.story_id, s.title, left(s.content, 100) as preview, p.full_name as author 
            FROM success_stories s
            JOIN alumni_profiles p ON s.user_id = p.user_id
            WHERE s.status = 'approved' 
            ORDER BY s.created_at DESC LIMIT 3
        `);

        // 2. Fetch Latest 3 Upcoming Events
        const events = await pool.query(`
            SELECT event_id, title, event_date, type 
            FROM events 
            WHERE event_date > NOW() 
            ORDER BY event_date ASC LIMIT 3
        `);

        // 3. Fetch Latest 3 Jobs
        const jobs = await pool.query(`
            SELECT job_id, job_title, company_name, job_type 
            FROM jobs 
            ORDER BY posted_at DESC LIMIT 3
        `);

        res.json({
            stories: stories.rows,
            events: events.rows,
            jobs: jobs.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;