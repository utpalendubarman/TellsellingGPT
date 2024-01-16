import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { connectToDatabase } from '@/service/mongo';
import { getUserDetail } from '@/service/support/user/controller';
import type { PostRegisterByEmail } from '@fastgpt/global/support/user/api.d';
import { hashStr } from '@fastgpt/global/common/string/tools';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { email, password, name } = req.body as PostRegisterByEmail;

    if (!email || !password) {
      throw new Error('Missing parameters');
    }

    const userExists = await MongoUser.findOne({ email: email });

    if (userExists) throw new Error('User with this email already exists');

    const { _id } = await MongoUser.create({
      fullname: name,
      password: password,
      email
    });

    console.log('register user (email):', {
      name,
      email,
      password,
      id: _id.toString()
    });

    const userDetail = await getUserDetail({ tmbId: '', userId: _id });

    const token = createJWT(userDetail);
    setCookie(res, token);

    jsonRes(res, {
      data: {
        user: userDetail,
        token
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
