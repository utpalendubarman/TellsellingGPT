import { OAuthEnum } from './constant';

export type PostLoginProps = {
  username: string;
  password: string;
  tmbId?: string;
};

export type PostRegisterByEmail = {
  email: string;
  password: string;
  name: string;
};

export type OauthLoginProps = {
  type: `${OAuthEnum}`;
  code: string;
  callbackUrl: string;
  inviterId?: string;
  tmbId?: string;
};

export type FastLoginProps = {
  token: string;
  code: string;
};
