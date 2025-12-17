const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");

// GET CONVERSATION HISTORY
router.get("/:contactId", authorize, async (req, res) => {
    try {
        const { contactId } = req.params;
        const myId = req.user.id;

        // Fetch messages between Me and Contact (both sent and received)
        const query = `
            SELECT * FROM messages 
            WHERE (sender_id = $1 AND receiver_id = $2) 
            OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `;
        
        const messages = await pool.query(query, [myId, contactId]);
        res.json(messages.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;