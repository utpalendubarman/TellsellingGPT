import React, { useCallback, useState } from 'react';
import {
  Box,
  Flex,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  Grid,
  useTheme,
  Card
} from '@chakra-ui/react';
import { useSelectFile } from '@/web/common/file/hooks/useSelectFile';
import { useForm } from 'react-hook-form';
import { compressImgFileAndUpload } from '@/web/common/file/controller';
import { getErrText } from '@fastgpt/global/common/error/utils';
import { useToast } from '@/web/common/hooks/useToast';
import { postCreateApp } from '@/web/core/app/api';
import { useRouter } from 'next/router';
import { useUserStore } from '@/web/support/user/useUserStore';
import { appTemplates } from '@/web/core/app/templates';
import { useSystemStore } from '@/web/common/system/useSystemStore';
import { useRequest } from '@/web/common/hooks/useRequest';
import { feConfigs } from '@/web/common/system/staticData';
import Avatar from '@/components/Avatar';
import MyTooltip from '@/components/MyTooltip';
import MyModal from '@/components/MyModal';
import { useTranslation } from 'next-i18next';
import type { OutLinkEditType, OutLinkSchema } from '@fastgpt/global/support/outLink/type.d';

const EmbedModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const { isPc } = useSystemStore();

  const { userInfo, setUserInfo } = useUserStore();

  const [embed, setEmbed] = useState('Click to view');
  const [embedScript, setEmbedScript] = useState('Click to view');

  const Generate = async () => {
    try {
      await fetch('https://app-dev.onwintop.com/api/findlinks.php', {
        method: 'POST',
        body: JSON.stringify({ userId: userInfo._id })
      })
        .then((out) => {
          return out.json();
        })
        .then((out) => {
          if (out.result.length != 0) {
            var result = out.result;
            var share = result[0];
            setEmbed('http://34.42.216.243/chat/share?shareId=' + share['share']);
            setEmbedScript(
              '<script src="http://localhost/embed/embed.js" data-type="embed" data-id="' +
                share['share'] +
                '"></script>'
            );
          } else {
            setEmbed('It seems you dont have sufficient apps to embed!');
          }
          console.log(out);
        });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <MyModal
      iconSrc="/imgs/module/ai.svg"
      title={'Embed your app'}
      isOpen
      onClose={onClose}
      isCentered={!isPc}
    >
      <ModalBody>
        <Box color={'myGray.800'} fontWeight={'bold'}>
          App URL : {process.env.BASE_URL}
        </Box>
        <Flex mt={3} alignItems={'center'}>
          <Input
            flex={1}
            autoFocus
            onChange={() => {}}
            readOnly={true}
            bg={'myWhite.600'}
            value={embed}
            onClick={Generate}
          />
        </Flex>

        {embed != 'Click to view' ? (
          <>
            <Box color={'myGray.800'} fontWeight={'bold'}>
              Chat Head Script : {process.env.BASE_URL}
            </Box>
            <Flex mt={3} alignItems={'center'}>
              <Input
                flex={1}
                autoFocus
                onChange={() => {}}
                readOnly={true}
                bg={'myWhite.600'}
                value={embedScript}
                onClick={Generate}
              />
            </Flex>
          </>
        ) : (
          <></>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant={'base'} mr={3} onClick={onClose}>
          Dismiss
        </Button>
        <Button
          onClick={() => {
            navigator.clipboard.writeText(embed);
          }}
        >
          Copy
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default EmbedModal;
