import jwt from 'jsonwebtoken';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { connectToDatabase } from '@/service/mongo';
import { Products } from '@/constants/products';
import { MongoPay } from '@fastgpt/service/support/pay/schema';
import type { Stripe } from 'stripe';
import { stripe } from '@/service/stripe';

async function getInfo(res, token) {
  const key = process.env.STRIPE_WEBHOOK_SECRET as string;

  try {
    const info = await jwt.verify(token, key);
    return info;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
  return false;
}

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) return res.status(400).json({ error: 'token required' });

  try {
    await connectToDatabase();

    /* decode token */
    const tkn = await getInfo(res, token);
    if (!tkn) return;

    /* get trnasaction */
    const txn = await MongoPay.findById(tkn.txnID);

    /* get product info */
    const prod = Products.find((item) => item.id === Number(txn.product));

    /* validate payment */
    const checkoutSession: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(
      txn.sessionId,
      {
        expand: ['line_items', 'payment_intent']
      }
    );

    const { status } = checkoutSession.payment_intent as Stripe.PaymentIntent;
    if (status != 'succeeded') return res.redirect(302, '/account?pay=false');

    /* update transaction info */
    if (txn?.status !== 'INITIATED') return res.status(401).json({ message: 'Token expired' });
    await MongoPay.findByIdAndUpdate(tkn.txnID, {
      status: tkn.type == 'success' ? 'SUCCESS' : 'FAILED'
    });

    /* failed payment */
    if (tkn.type != 'success') return res.redirect(302, '/account?pay=false');

    /* find user */
    const user = await MongoUser.findOne({ _id: txn.userId });
    if (!user) res.redirect(302, '/account?pay=false');

    /* update balance */
    await MongoUser.findByIdAndUpdate(user._id, {
      token: user.token + prod?.tokens
    });

    /* payment successfull */
    res.redirect(302, '/account?pay=true');
  } catch (err) {
    res.status(401).json({ message: 'Invalid Request' });
  }
}
