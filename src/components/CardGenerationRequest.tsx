/* eslint-disable unicorn/prefer-spread, unicorn/new-for-builtins, promise/no-nesting */
import { Box, Center, Image, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClient } from 'react-supabase';

type GenerationRequest = {
  description: string;
  expected_asset_count: number;
};

type Asset = {
  id: number;
  imageUrl: string;
};

export const CardGenerationRequest = () => {
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
                setAssets(
                  r.data.map(asset => {
                    const url = client.storage.from('assets').getPublicUrl(asset.storage_key);

                    return { id: asset.id, imageUrl: url.data.publicUrl };
                  })
                );
              }
            }, console.error);
        }, console.error);
    }
  }, [client, id]);

  if (!request) {
    return <Spinner />;
  }

  return (
    <Box justifyContent="center" flexWrap="wrap" flexDirection="row" flex={1} display="flex">
      {Array.from(Array(request.expected_asset_count)).map((_, i) => (
        <Box key={i} width="300px" height="300px">
          {assets[i] ? (
            <Image width="300px" height="300px" src={assets[i].imageUrl} />
          ) : (
            <Center width="100%" height="100%">
              <Spinner />
            </Center>
          )}
        </Box>
      ))}
    </Box>
  );
};
