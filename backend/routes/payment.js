// routes/payment.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Donation = require('../models/Donation'); // Make sure this path is correct

router.post('/create-payment-intent', async (req, res) => {
  const { amount, name, email } = req.body;

  if (!amount || isNaN(amount) || amount < 50) {
    return res.status(400).json({ error: 'Minimum donation is ₹50' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // ₹ to paisa
      currency: 'inr',
      payment_method_types: ['card'],
      receipt_email: email,
    });

    // Save donation info to DB
    await Donation.create({
      name,
      email,
      amount,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe Payment Error:', err.message);
    res.status(500).json({ error: 'Payment intent creation failed' });
  }
});
// GET /api/donations — Fetch all donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations:', err.message);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});


module.exports = router;
