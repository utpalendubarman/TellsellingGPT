import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { MongoBranding } from '@fastgpt/service/support/user/branding_schema';
import { connectToDatabase } from '@/service/mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    await connectToDatabase();
    const { userid, font, logo, primarycolor, secondarycolor, tertiarycolor, quarternarycolor } =
      req.body as {
        _id: string;
        userid: string;
        font: string;
        logo: string;
        primarycolor: string;
        secondarycolor: string;
        tertiarycolor: string;
        quarternarycolor: string;
      };

    const branding = await MongoBranding.findOne({ userid });
    if (!branding) {
      await MongoBranding.create({
        userid,
        font,
        logo,
        primarycolor,
        secondarycolor,
        tertiarycolor,
        quarternarycolor
      });
      jsonRes(res, {
        data: {
          userid,
          font,
          logo
        }
      });
    } else {
      await MongoBranding.findOneAndUpdate(
        { userid },
        {
          font,
          logo,
          primarycolor,
          secondarycolor,
          tertiarycolor,
          quarternarycolor
        }
      );
      jsonRes(res, {
        data: {
          userid,
          font,
          logo
        }
      });
    }
    if (!userid) {
      throw new Error('Params is missing');
    }
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
