import { stripe } from '@/service/stripe';

import jwt from 'jsonwebtoken';
import { authUserNotVisitor } from '@fastgpt/service/support/permission/auth/user';
import { Products } from '@/constants/products';
import { MongoPay } from '@fastgpt/service/support/pay/schema';
import { connectToDatabase } from '@/service/mongo';

const generateToken = (txnID, type) => {
  const key = process.env.STRIPE_WEBHOOK_SECRET as string;
  const expiresIn = '30m'; // Token expires in 30 minutes
  const token = jwt.sign({ junk0: genGarbage(5), txnID, type, junk1: genGarbage(5) }, key, {
    expiresIn
  });
  return token;
};

function formatAmountForStripe(amount: number, currency: string): number {
  let numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency: boolean = true;
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

export const genGarbage = (numDigits) => {
  const min = 10 ** (numDigits - 1);
  const max = 10 ** numDigits - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId } = await authUserNotVisitor({ req, authToken: true });

      /* get product */
      const { prodId } = req.body;
      const prod = Products.find((item) => item.id === Number(prodId));

      /* create transaction in database */
      const { _id } = await MongoPay.create({
        userId,
        price: prod?.price,
        product: prod.id
      });

      /* generate tokens for success and error */
      const token_scs = generateToken(_id, 'success');
      const token_err = generateToken(_id, 'error');

      /* create session */
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Buy Tokens'
              },
              unit_amount: formatAmountForStripe(prod.price, 'usd') // Convert to the correct amount format
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/api/pay/confirm?token=${token_scs}`,
        cancel_url: `${process.env.BASE_URL}/api/pay/confirm?token=${token_err}`
      });

      /* add session id */
      await MongoPay.findByIdAndUpdate(_id, {
        sessionId: session.id
      });

      /* send payment url */
      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Error processing the request:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
