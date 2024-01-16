import { connectionMongo, type Model } from '../../common/mongo';
const { Schema, model, models } = connectionMongo;
import { hashStr } from '@fastgpt/global/common/string/tools';
import { PRICE_SCALE } from '@fastgpt/global/support/wallet/bill/constants';
import type { UserModelSchema } from '@fastgpt/global/support/user/type';
import type { BrandingType } from '@fastgpt/global/support/branding/branding';
import { UserStatusEnum, userStatusMap } from '@fastgpt/global/support/user/constant';

export const userCollectionName = 'brandings';

const BrandingSchema = new Schema({
  userid: {
    type: String,
    default: 'testuser'
  },
  font: {
    type: String,
    default: 'test data'
  },
  logo: {
    type: String,
    default: 'test data'
  },
  primarycolor: {
    type: String,
    default: 'test data'
  },
  secondarycolor: {
    type: String,
    default: 'test data'
  },
  tertiarycolor: {
    type: String,
    default: 'test data'
  },
  quarternarycolor: {
    type: String,
    default: 'test data'
  }
});

export const MongoBranding: Model<BrandingType> =
  models[userCollectionName] || model(userCollectionName, BrandingSchema);
MongoBranding.syncIndexes();
