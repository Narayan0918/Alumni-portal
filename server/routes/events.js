const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

// 1. GET ALL EVENTS (With RSVP status for the current user)
router.get("/", authorize, async (req, res) => {
    try {
        // This query fetches the event AND checks if the logged-in user has RSVP'd
        const query = `
            SELECT e.*, 
            (SELECT COUNT(*) FROM event_rsvps r WHERE r.event_id = e.event_id) as attendee_count,
            (SELECT status FROM event_rsvps r WHERE r.event_id = e.event_id AND r.user_id = $1) as my_status
            FROM events e 
            ORDER BY e.event_date ASC
        `;
        const events = await pool.query(query, [req.user.id]);
        res.json(events.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. CREATE EVENT (Admin only - simplified for MVP to all users)
router.post("/", authorize, async (req, res) => {
    try {
        const { title, description, event_date, location, type } = req.body;
        const newEvent = await pool.query(
            "INSERT INTO events (title, description, event_date, location, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [title, description, event_date, location, type]
        );
        res.json(newEvent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 3. RSVP TO EVENT
router.post("/:id/rsvp", authorize, async (req, res) => {
    try {
        const { id } = req.params; // Event ID
        const user_id = req.user.id;

        // Check if already RSVP'd
        const existing = await pool.query(
            "SELECT * FROM event_rsvps WHERE event_id = $1 AND user_id = $2",
            [id, user_id]
        );

        if (existing.rows.length > 0) {
            // Update existing RSVP
            await pool.query(
                "UPDATE event_rsvps SET status = 'Going' WHERE event_id = $1 AND user_id = $2",
                [id, user_id]
            );
        } else {
            // Create new RSVP
            await pool.query(
                "INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1, $2, 'Going')",
                [id, user_id]
            );
        }

        res.json({ msg: "RSVP Successful" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 4. CANCEL RSVP
router.delete("/:id/rsvp", authorize, async (req, res) => {
    try {
        await pool.query(
            "DELETE FROM event_rsvps WHERE event_id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        );
        res.json({ msg: "RSVP Cancelled" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;