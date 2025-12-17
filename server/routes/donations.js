const router = require("express").Router();
const pool = require("../config/db");
const authorize = require("../middleware/authorize");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. GET ALL CAMPAIGNS
router.get("/campaigns", async (req, res) => {
    try {
        const campaigns = await pool.query("SELECT * FROM donation_campaigns ORDER BY end_date DESC");
        res.json(campaigns.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// 2. INITIATE DONATION (Create Order)
router.post("/order", authorize, async (req, res) => {
    try {
        const { amount, campaign_id } = req.body;
        
        const options = {
            amount: amount * 100, // Razorpay works in paise (₹1 = 100 paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        // Save pending donation to DB
        await pool.query(
            "INSERT INTO donations (user_id, campaign_id, amount, status, razorpay_order_id) VALUES ($1, $2, $3, 'pending', $4)",
            [req.user.id, campaign_id, amount, order.id]
        );

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send("Order Creation Failed");
    }
});

// 3. VERIFY PAYMENT (Critical Security Step)
router.post("/verify", authorize, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, campaign_id, amount } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            // Signature matches -> Payment Successful!
            
            // 1. Update Donation Status
            await pool.query(
                "UPDATE donations SET status = 'successful', razorpay_payment_id = $1 WHERE razorpay_order_id = $2",
                [razorpay_payment_id, razorpay_order_id]
            );

            // 2. Update Campaign Total Amount
            await pool.query(
                "UPDATE donation_campaigns SET current_amount = current_amount + $1 WHERE campaign_id = $2",
                [amount, campaign_id]
            );

            res.json({ status: "success", message: "Payment Verified" });
        } else {
            res.status(400).json({ status: "failure", message: "Invalid Signature" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Verification Failed");
    }
});

module.exports = router;