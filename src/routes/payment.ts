import {Router} from "express"
require('dotenv').config();
const stripe = require('stripe')(process.env.CLIENT_SECRET_STRIPE);

const app = Router();

app.post('/secret', async (req, res) => {
  try {
    // const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 20,
      currency: 'eur',
      // confirmation_method: "manual",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({client_secret: paymentIntent.client_secret});

  } catch (e: any) {
    console.error(e);
    res.status(e.statusCode);
  }
});

export default app;