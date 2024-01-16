import React, { useState, useCallback } from 'react';
import { ModalFooter, ModalBody, Button, Input, Box, Grid, Text, Link } from '@chakra-ui/react';
import { getPayCode, checkPayResult } from '@/web/support/wallet/pay/api';
import { useToast } from '@/web/common/hooks/useToast';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useTranslation } from 'next-i18next';
import Markdown from '@/components/Markdown';
import MyModal from '@/components/MyModal';
import { Products } from '@/constants/products';

const BuyTokenModal = ({ onClose }: { onClose: () => void }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [inputVal, setInputVal] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [payId, setPayId] = useState('');

  const handleClickPay = useCallback(async () => {
    if (!inputVal || inputVal <= 0 || isNaN(+inputVal)) return;
    setLoading(true);

    try {
      const response = await fetch('/api/pay/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prodId: inputVal })
      });

      const data = await response.json();
      if (data.url !== undefined) {
        window.location.href = data.url;
      } else {
        alert('Payment Failed');
      }
    } catch (error) {
      alert('Payment Failed');
    }

    // try {
    //   // 获取支付二维码
    //   const res = await getPayCode(inputVal);
    //   new window.QRCode(document.getElementById('payQRCode'), {
    //     text: res.codeUrl,
    //     width: 128,
    //     height: 128,
    //     colorDark: '#000000',
    //     colorLight: '#ffffff',
    //     correctLevel: window.QRCode.CorrectLevel.H
    //   });
    //   setPayId(res.payId);
    // } catch (err) {
    //   toast({
    //     title: getErrText(err),
    //     status: 'error'
    //   });
    // }
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
          title: '充值成功',
          status: 'success'
        });
        router.reload();
      }
    }
  );

  const [input, setInput] = useState<{ customDonation: number }>({
    customDonation: Math.round(1000 / 10)
  });
  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (e): void =>
    setInput({
      ...input,
      [e.currentTarget.name]: e.currentTarget.value
    });

  return (
    <MyModal
      isOpen={true}
      onClose={payId ? undefined : onClose}
      title={'Buy Tokens'}
      iconSrc="/imgs/modal/pay.svg"
      isCentered={!payId}
    >
      <ModalBody px={0} minH={payId ? 'auto' : '20vh'} display={'flex'} flexDirection={'column'}>
        {!payId && (
          <>
            <Grid gridTemplateColumns={'repeat(4,1fr)'} gridGap={5} mb={4} px={6}>
              {Products.map((item) => (
                <p
                  key={item.id}
                  style={{
                    userSelect: 'none',
                    border:
                      item.id === inputVal
                        ? '1px solid transparent'
                        : '1px solid var(--chakra-colors-gray-300)',
                    padding: 10,
                    textAlign: 'center',
                    borderRadius: 5,
                    background: item.id === inputVal ? 'var(--chakra-colors-myBlue-300)' : '',
                    color: item.id === inputVal ? 'var(--chakra-colors-myBlue-800)' : ''
                  }}
                  onClick={() => setInputVal(item.id)}
                >
                  <Text style={{ fontWeight: 'bold' }}>{item.tokens} TKN</Text>
                  <Text>Price: ${item.price}</Text>
                </p>
              ))}
            </Grid>
          </>
        )}
        {/* 付费二维码 */}
        <Box textAlign={'center'}>
          {payId && (
            <Box mb={3}>
              Please pay for WeChat code to pay: {inputVal}Yuan, please do not close the page
            </Box>
          )}
          <Box id={'payQRCode'} display={'inline-block'}></Box>
        </Box>

        {/* <form>
          <CustomDonationInput
            className="checkout-style"
            name="customDonation"
            min={10}
            max={100}
            step={10}
            currency={'usd'}
            onChange={handleInputChange}
            value={input.customDonation}
          />
          <StripeTestCards />
          <button
            className="checkout-style-background"
            type="submit"
            disabled={loading}
          >
            Donate {formatAmountForDisplay(input.customDonation, 'usd')}
          </button>
        </form> */}
      </ModalBody>

      <ModalFooter>
        {!payId && (
          <>
            <Button variant={'base'} onClick={onClose}>
              Cancel
            </Button>
            <Button
              ml={3}
              isLoading={loading}
              isDisabled={!inputVal || inputVal === 0}
              onClick={handleClickPay}
            >
              Buy
            </Button>
          </>
        )}
      </ModalFooter>
    </MyModal>
  );
};

export default BuyTokenModal;
