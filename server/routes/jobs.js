const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

// 1. GET ALL JOBS (With Search)
router.get("/", authorize, async (req, res) => {
    try {
        const { title, location } = req.query;
        
        let query = `
            SELECT j.*, u.email as poster_email, p.full_name as poster_name 
            FROM jobs j 
            JOIN users u ON j.posted_by_user_id = u.user_id 
            JOIN alumni_profiles p ON u.user_id = p.user_id 
            WHERE 1=1
        `;
        let values = [];
        let count = 1;

        if (title) {
            query += ` AND j.job_title ILIKE $${count}`;
            values.push(`%${title}%`);
            count++;
        }
        if (location) {
            query += ` AND j.location ILIKE $${count}`;
            values.push(`%${location}%`);
            count++;
        }

        query += " ORDER BY j.posted_at DESC"; // Newest first

        const jobs = await pool.query(query, values);
        res.json(jobs.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. POST A NEW JOB
router.post("/", authorize, async (req, res) => {
    try {
        const { company_name, job_title, location, job_type, description, apply_link } = req.body;

        const newJob = await pool.query(
            "INSERT INTO jobs (posted_by_user_id, company_name, job_title, location, job_type, description, apply_link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [req.user.id, company_name, job_title, location, job_type, description, apply_link]
        );

        res.json(newJob.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. DELETE A JOB (Only if you posted it)
router.delete("/:id", authorize, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if job exists and belongs to user
        const job = await pool.query("SELECT * FROM jobs WHERE job_id = $1", [id]);
        
        if (job.rows.length === 0) {
            return res.status(404).json("Job not found");
        }
        
        if (job.rows[0].posted_by_user_id !== req.user.id) {
            return res.status(403).json("Not authorized to delete this job");
        }

        await pool.query("DELETE FROM jobs WHERE job_id = $1", [id]);
        res.json("Job deleted");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;