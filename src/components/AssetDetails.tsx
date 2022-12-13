import {
  Box,
  Button,
  Center,
  Heading,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  useBreakpoint,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from 'react-supabase';

import { CardImage } from './CardImage';

export const AssetDetails = () => {
  const { id } = useParams<{ requestId: string; id: string }>();
  const client = useClient();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const breakpoint = useBreakpoint();

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line promise/catch-or-return
      client
        .from('assets')
        .select()
        .eq('id', id)
        .single()
        .then(async res => {
          const url = await client.storage.from('assets').createSignedUrl(res.data.storage_key, 120);
          if (url.data) {
            setImageUrl(url.data.signedUrl);
          }
        }, console.error);
    }
  }, [client, id]);

  const checkout = useCallback(() => {
    navigate(`/assets/${id}/checkout`);
  }, [id, navigate]);

  return (
    <Box
      flexDirection={{ base: 'column', lg: 'row' }}
      gap={{ base: 0, lg: '46px' }}
      display="flex"
      width="100%"
      maxWidth="936px"
      padding="32px"
      paddingTop={0}
    >
      <Box display={{ base: 'block', lg: 'none' }} paddingBottom="12px">
        <Heading>Nice!</Heading>
      </Box>
      <Center>
        <CardImage size={['xl', '2xl'].includes(breakpoint) ? 'lg' : 'md'} imageUrl={imageUrl} />
      </Center>
      <Box flexDirection={{ base: 'row', lg: 'column' }} gap="25px" display="flex" width="100%">
        <Box display={{ base: 'none', lg: 'block' }}>
          <Heading>Nice!</Heading>
        </Box>
        <Box flexDirection="column" display="flex">
          <Stat flexGrow={0}>
            <StatLabel>Price</StatLabel>
            <StatNumber>$10</StatNumber>
            <StatHelpText>incl. printing & shipping</StatHelpText>
          </Stat>
          <Box alignItems="center" display="flex">
            <Button onClick={checkout}>Write Message</Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
