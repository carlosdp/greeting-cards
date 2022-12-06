/* eslint-disable unicorn/prefer-spread, unicorn/new-for-builtins, promise/no-nesting */
import { Box, Center, Heading, Image, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClient } from 'react-supabase';

import { CheckoutStepHeader } from './CheckoutStepHeader';

type GenerationRequest = {
  description: string;
  expected_asset_count: number;
};

type Asset = {
  id: number;
  imageUrl: string;
};

export type CardGenerationRequestProps = {
  onSelectAsset: (requestId: string, id: number) => void;
};

export const CardGenerationRequest = ({ onSelectAsset }: CardGenerationRequestProps) => {
  const { id } = useParams<{ id: string }>();
  const client = useClient();
  const [request, setRequest] = useState<GenerationRequest | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line promise/catch-or-return
      client
        .from('asset_generation_requests')
        .select()
        .eq('id', id)
        .single()
        .then(res => {
          setRequest(res.data);

          // eslint-disable-next-line promise/catch-or-return
          client
            .from('assets')
            .select()
            .eq('asset_generation_request_id', id)
            .then(r => {
              if (r.error) {
                console.error(r.error);
              }
              if (r.data) {
                Promise.all(
                  r.data.map(async asset => {
                    const url = await client.storage.from('assets').createSignedUrl(asset.storage_key, 120);

                    return { id: asset.id, imageUrl: url.data?.signedUrl || '' };
                  })
                )
                  .then(setAssets)
                  .catch(console.error);
              }
            }, console.error);
        }, console.error);
    }
  }, [client, id]);

  if (!id || !request) {
    return <Spinner />;
  }

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <Heading>Ok, how do these look?</Heading>
      <CheckoutStepHeader step={2} prompt="Choose the card you love the most" />
      <Box justifyContent="center" flexWrap="wrap" flexDirection="row" flex={1} gap="10px" display="flex">
        {Array.from(Array(request.expected_asset_count)).map((_, i) => (
          <Box key={i} width="300px" height="300px">
            {assets[i] ? (
              <Image
                width="300px"
                height="300px"
                cursor="pointer"
                onClick={() => onSelectAsset(id, assets[i].id)}
                src={assets[i].imageUrl}
              />
            ) : (
              <Center width="100%" height="100%">
                <Spinner />
              </Center>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
