import { connectionMongo, type Model } from '../../common/mongo';
const { Schema, model, models } = connectionMongo;
import { hashStr } from '@fastgpt/global/common/string/tools';
import type { PaySchema } from '@fastgpt/global/support/wallet/pay/type';

export const userCollectionName = 'transactions';

const PaySchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String
  },
  createTime: {
    type: Date,
    default: () => new Date()
  },
  price: {
    type: String
  },
  product: {
    type: String
  },
  status: {
    type: String,
    default: 'INITIATED'
  }
});

export const MongoPay: Model<PaySchema> =
  models[userCollectionName] || model(userCollectionName, PaySchema);
MongoPay.syncIndexes();
