import { Box, Button, Heading, Image, Spinner } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from 'react-supabase';

export const AssetDetails = () => {
  const { requestId, id } = useParams<{ requestId: string; id: string }>();
  const client = useClient();
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
    navigate(`/requests/${requestId}/assets/${id}/checkout`);
  }, [id, requestId, navigate]);

  if (!imageUrl) {
    return <Spinner />;
  }

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <Image src={imageUrl} />
      <Box>
        <Heading>Looks great!</Heading>
        <Heading fontWeight="normal">Let's figure out where we're sending it, and write a thoughtful message</Heading>
      </Box>
      <Box alignItems="center" justifyContent="center" display="flex">
        <Button onClick={checkout}>Send Card</Button>
      </Box>
    </Box>
  );
};
