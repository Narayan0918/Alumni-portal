const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

router.get("/", authorize, async (req, res) => {
    try {
        // 1. Get current user's institution ID AND Name
        const userCheck = await pool.query(`
            SELECT u.institution_id, i.name as institution_name 
            FROM users u
            JOIN institutions i ON u.institution_id = i.institution_id
            WHERE u.user_id = $1
        `, [req.user.id]);

        if (userCheck.rows.length === 0) {
             return res.status(400).json({ msg: "User not found" });
        }

        // Destructure the variables here
        const { institution_id, institution_name } = userCheck.rows[0];

        // 2. Fetch Stories (Using institution_id)
        const stories = await pool.query(`
            SELECT s.story_id, s.title, left(s.content, 100) as preview, p.full_name as author 
            FROM success_stories s
            JOIN alumni_profiles p ON s.user_id = p.user_id
            WHERE s.status = 'approved' AND s.institution_id = $1 
            ORDER BY s.created_at DESC LIMIT 3
        `, [institution_id]); // <--- FIXED VAR NAME

        // 3. Fetch Events (Using institution_id)
        const events = await pool.query(`
            SELECT event_id, title, event_date, type 
            FROM events 
            WHERE event_date > NOW() AND institution_id = $1
            ORDER BY event_date ASC LIMIT 3
        `, [institution_id]); // <--- FIXED VAR NAME

        // 4. Fetch Jobs (Using institution_id)
        const jobs = await pool.query(`
            SELECT job_id, job_title, company_name, job_type 
            FROM jobs 
            WHERE institution_id = $1
            ORDER BY posted_at DESC LIMIT 3
        `, [institution_id]); // <--- FIXED VAR NAME

        // Send response
        res.json({
            institution_name, 
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