import React, { useState, useCallback } from 'react';
import { ModalFooter, ModalBody, Button, Input, Box, Grid } from '@chakra-ui/react';
import { getPayCode, checkPayResult } from '@/web/support/wallet/pay/api';
import { useToast } from '@/web/common/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useTranslation } from 'next-i18next';
import Markdown from '@/components/Markdown';
import MyModal from '@/components/MyModal';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentElement, Elements, useStripe, useElements } from '@stripe/react-stripe-js';

const PayModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [inputVal, setInputVal] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [payId, setPayId] = useState('');

  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleClickPay = useCallback(async () => {
    if (!inputVal || inputVal <= 0 || isNaN(+inputVal)) return;
    setLoading(true);
    try {
      // 获取支付二维码
      if (elements == null) {
        return;
      }

      // Trigger form validation and wallet collection
      const { error: submitError } = await elements.submit();
      if (submitError) {
        // Show error to your customer
        setErrorMessage(submitError.message);
        return;
      }

      const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

      const options = {
        mode: 'payment',
        amount: 1099,
        currency: 'usd',
        // Fully customizable with appearance API.
        appearance: {
          /*...*/
        }
      };

      // Create the PaymentIntent and obtain clientSecret from your server endpoint
      const res = await fetch('/create-intent', {
        method: 'POST'
      });

      const { client_secret: clientSecret } = await res.json();

      const { error } = await stripe.confirmPayment({
        //`Elements` instance that was used to create the Payment Element
        elements,
        clientSecret,
        confirmParams: {
          return_url: 'https://example.com/order/123/complete'
        }
      });

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (for example, payment
        // details incomplete)
        setErrorMessage(error.message);
      } else {
        // Your customer will be redirected to your `return_url`. For some payment
        // methods like iDEAL, your customer will be redirected to an intermediate
        // site first to authorize the payment, then redirected to the `return_url`.
      }
    } catch (err) {
      toast({
        title: getErrText(err),
        status: 'error'
      });
    }
    setLoading(false);
  }, [inputVal, toast]);

  useQuery(
    [payId],
    () => {
      if (!payId) return null;
      return checkPayResult(payId);
    },
    {
      enabled: !!payId,
      refetchInterval: 3000,
      onSuccess(res) {
        if (!res) return;
        toast({
          title: res,
          status: 'success'
        });
        router.reload();
      }
    }
  );

  return (
    <MyModal
      isOpen={true}
      onClose={payId ? undefined : onClose}
      title={t('user.Pay')}
      iconSrc="/imgs/modal/pay.svg"
    >
      <ModalBody px={0} display={'flex'} flexDirection={'column'}>
        {!payId && (
          <>
            <Grid gridTemplateColumns={'repeat(3,1fr)'} gridGap={5} mb={4} px={6}>
              {[10, 20, 50, 100, 200, 500].map((item) => (
                <Button
                  key={item}
                  variant={item === inputVal ? 'solid' : 'outline'}
                  onClick={() => setInputVal(item)}
                >
                  {item}元
                </Button>
              ))}
            </Grid>
            <PaymentElement />
            <Box px={6}>
              <Input
                value={inputVal}
                type={'number'}
                step={1}
                placeholder={'For other amounts, please take an integer'}
                onChange={(e) => {
                  setInputVal(Math.floor(+e.target.value));
                }}
              ></Input>
            </Box>
          </>
        )}
        {/* 付费二维码 */}
        <Box textAlign={'center'}>
          {payId && <Box mb={3}>Please pay for WeChat code to pay: {inputVal}元，请勿关闭页面</Box>}
          <Box id={'payQRCode'} display={'inline-block'}></Box>
        </Box>
      </ModalBody>

      <ModalFooter>
        {!payId && (
          <>
            <Button variant={'whiteBase'} onClick={onClose}>
              {t('common.Close')}
            </Button>
            <Button
              ml={3}
              isLoading={loading}
              isDisabled={!inputVal || inputVal === 0}
              onClick={handleClickPay}
            >
              Get the recharge QR code
            </Button>
          </>
        )}
      </ModalFooter>
    </MyModal>
  );
};

export default PayModal;
