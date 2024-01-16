import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoUser } from '@fastgpt/service/support/user/schema';
//import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { connectToDatabase } from '@/service/mongo';
import type { PostRegisterByEmail } from '@fastgpt/global/support/user/api.d';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();
    const { email, password, name } = req.body as PostRegisterByEmail;

    if (!email || !password) {
      throw new Error('Missing parameters');
    }

    const userExists = await MongoUser.findOne({ username: email });

    if (userExists) throw new Error('User with this email already exists');

    const { _id } = await MongoUser.create({
      username: email,
      password: password,
      email
    });

    /*const userDetail = await getUserDetail({ tmbId: '', userId: _id });

    const token = createJWT(userDetail);
    setCookie(res, token);*/

    jsonRes(res, {
      data: {
        success: true,
        message: 'User successfully created!'
      }
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
