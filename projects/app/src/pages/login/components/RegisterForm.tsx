import React, { useState, Dispatch, useCallback } from 'react';
import { FormControl, Box, Input, Button, FormErrorMessage, Flex } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageTypeEnum } from '@/constants/user';
import { postRegister } from '@/web/support/user/api';
import { useSendCode } from '@/web/support/user/hooks/useSendCode';
import type { ResLogin } from '@/global/support/api/userRes';
import { useToast } from '@/web/common/hooks/useToast';
import { postCreateApp } from '@/web/core/app/api';
import { appTemplates } from '@/web/core/app/templates';
import { feConfigs } from '@/web/common/system/staticData';

interface Props {
  loginSuccess: (e: ResLogin) => void;
  setPageType: Dispatch<`${PageTypeEnum}`>;
}

interface RegisterType {
  username: string;
  password: string;
  password2: string;
  email: string;
}

const RegisterForm = ({ setPageType, loginSuccess }: Props) => {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<RegisterType>({
    mode: 'onBlur'
  });

  const { sendCodeText, sendCode, codeCountDown } = useSendCode();

  const [requesting, setRequesting] = useState(false);

  const onclickRegister = useCallback(
    async ({ username, password }: RegisterType) => {
      setRequesting(true);
      try {
        loginSuccess(
          await postRegister({
            email: username,
            name: 'Utpal',
            password
          })
        );

        /* toast({
          title: `registration success`,
          status: 'success'
        });
        // auto register template app
        setTimeout(() => {
          appTemplates.forEach((template) => {
            postCreateApp({
              avatar: template.avatar,
              name: template.name,
              modules: template.modules,
              type: template.type
            });
          });
        }, 100);*/
      } catch (error: any) {
        toast({
          title: error.message || 'Registered abnormalities',
          status: 'error'
        });
      }
      setRequesting(false);
    },
    [loginSuccess, toast]
  );

  return (
    <>
      <Box fontWeight={'bold'} fontSize={'2xl'} textAlign={'center'}>
        Create an account
      </Box>
      <Box
        mt={'42px'}
        onKeyDown={(e) => {
          if (e.keyCode === 13 && !e.shiftKey && !requesting) {
            handleSubmit(onclickRegister)();
          }
        }}
      >
        <FormControl isInvalid={!!errors.username}>
          <Input
            bg={'myGray.50'}
            placeholder="Mailbox/mobile phone number"
            {...register('username', {
              required: 'The mailbox/mobile phone number cannot be empty',
              pattern: {
                value:
                  /(^1[3456789]\d{9}$)|(^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$)/,
                message: 'Email/mobile phone number format error'
              }
            })}
          ></Input>
        </FormControl>
        {/*
        <FormControl
          mt={6}
          isInvalid={!!errors.code}
          display={'flex'}
          alignItems={'center'}
          position={'relative'}
        >
          <Input
            bg={'myGray.50'}
            flex={1}
            maxLength={8}
            placeholder="Verification code"
            {...register('code', {
              required: 'verification code must be filled'
            })}
          ></Input>
          <Box
            position={'absolute'}
            right={3}
            zIndex={1}
            fontSize={'sm'}
            {...(codeCountDown > 0
              ? {
                  color: 'myGray.500'
                }
              : {
                  color: 'primary.700',
                  cursor: 'pointer',
                  onClick: onclickSendCode
                })}
          >
            Send Code
          </Box>
              </FormControl>*/}
        <FormControl mt={6} isInvalid={!!errors.password}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="Password (4 ~ 20 digits)"
            {...register('password', {
              required: 'password can not be blank',
              minLength: {
                value: 4,
                message: 'At least 4 digits of passwords up to 20 digits'
              },
              maxLength: {
                value: 20,
                message: 'At least 4 digits of passwords up to 20 digits'
              }
            })}
          ></Input>
        </FormControl>
        <FormControl mt={6} isInvalid={!!errors.password2}>
          <Input
            bg={'myGray.50'}
            type={'password'}
            placeholder="Confirm Password"
            {...register('password2', {
              validate: (val) =>
                getValues('password') === val ? true : 'Two passwords are inconsistent'
            })}
          ></Input>
        </FormControl>
        <Button
          type="submit"
          mt={6}
          w={'100%'}
          size={['md', 'lg']}
          colorScheme="blue"
          isLoading={requesting}
          onClick={handleSubmit(onclickRegister)}
        >
          Confirm the registration
        </Button>
        <Box
          float={'right'}
          fontSize="sm"
          mt={2}
          mb={'50px'}
          color={'primary.700'}
          cursor={'pointer'}
          _hover={{ textDecoration: 'underline' }}
          onClick={() => setPageType('login')}
        >
          Existing account, log in
        </Box>
      </Box>
    </>
  );
};

export default RegisterForm;
