//import { Stripe } from "stripe";
import { Stripe } from '@stripe/stripe-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2020-08-27' // Use the latest API version
});

export { stripe };
