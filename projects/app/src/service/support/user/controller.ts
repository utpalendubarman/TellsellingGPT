import { ERROR_ENUM } from '@fastgpt/global/common/error/errorCode';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { UserType } from '@fastgpt/global/support/user/type';
import {
  getTeamInfoByTmbId,
  getUserDefaultTeam
} from '@fastgpt/service/support/user/team/controller';

export async function getUserDetail({
  tmbId,
  userId
}: {
  tmbId?: string;
  userId?: string;
}): Promise<UserType> {
  // const team = await (async () => {
  //   if (tmbId) {
  //     return getTeamInfoByTmbId({ tmbId });
  //   }
  //   if (userId) {
  //     return getUserDefaultTeam({ userId });
  //   }
  //   return Promise.reject(ERROR_ENUM.unAuthorization);
  // })();
  const user = await MongoUser.findById(userId);
  const team = {
    userId,
    teamId: '65745212d2d68e74f3d17ea0',
    teamName: 'My Team',
    memberName: 'Owner',
    avatar: '/icon/logo.svg',
    balance: 999900000,
    tmbId: '65745212d2d68e74f3d17ea3',
    role: 'owner',
    status: 'active',
    defaultTeam: true,
    canWrite: true,
    maxSize: 1
  };
  // if (!user) {
  //   return Promise.reject(ERROR_ENUM.unAuthorization);
  // }
  return {
    _id: user._id,
    username: user?.username,
    email: user?.email,
    phone: user?.phone,
    avatar: user?.avatar,
    balance: user.balance,
    token: user.token,
    fullname: user.fullname,
    timezone: user.timezone,
    promotionRate: user.promotionRate,
    openaiAccount: user.openaiAccount,
    team
  };
}
