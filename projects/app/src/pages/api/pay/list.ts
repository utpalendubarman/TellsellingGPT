import { stripe } from '@/service/stripe';
import { formatAmountForStripe } from '@/utils/stripe-helpers';
import { authUserNotVisitor } from '@fastgpt/service/support/permission/auth/user';
import { Products } from '@/constants/products';
import { MongoPay } from '@fastgpt/service/support/pay/schema';
import { connectToDatabase } from '@/service/mongo';
import type { PayModelSchema } from '@fastgpt/global/support/wallet/pay/type';
import { jsonRes } from '@fastgpt/service/common/response';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { userId } = await authUserNotVisitor({ req, authToken: true });
    await connectToDatabase();

    //   const { prodId } = req.body;
    //   const prod = Products.find(item => item.id === Number(prodId));
    const txns = await MongoPay.find({ userId }).sort({ createTime: -1 });

    jsonRes<PayModelSchema[]>(res, {
      data: txns.map((txn) => ({
        _id: txn._id,
        userId: txn.userId,
        createTime: txn.createTime,
        price: txn.price,
        product: txn.product,
        status: txn.status
      }))
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
