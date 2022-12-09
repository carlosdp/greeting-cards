/* eslint-disable unicorn/prefer-spread, unicorn/new-for-builtins, promise/no-nesting */
import { Box, Center, Heading, Image, ScaleFade, Spinner, useDisclosure } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClient } from 'react-supabase';

import { CheckoutStepHeader } from './CheckoutStepHeader';

const Loading = () => {
  useEffect(() => {
    window.document.querySelector('html')?.classList.add('elations-purple-background');
    window.document.querySelector('body')?.classList.add('elations-purple-background');
    window.document.querySelector('#elations-brand')?.classList.add('elations-brand-dark');

    return () => {
      window.document.querySelector('html')?.classList.remove('elations-purple-background');
      window.document.querySelector('body')?.classList.remove('elations-purple-background');
      window.document.querySelector('#elations-brand')?.classList.remove('elations-brand-dark');
    };
  }, []);

  return (
    <Box justifyContent="center" flexDirection="column" gap="46px" display="flex" minHeight="80vh">
      <Box>
        <Heading fontWeight="normal">Give us a minute...</Heading>
        <Heading>Our gnomes are designing your cards</Heading>
      </Box>
      <Spinner size="xl" thickness="4px" />
    </Box>
  );
};

const CardImage = ({
  id,
  imageUrl,
  onSelectAsset,
}: {
  id: string;
  assetId: number;
  imageUrl: string;
  onSelectAsset: (_id: string) => void;
}) => {
  const { isOpen, onOpen } = useDisclosure();

  return (
    <ScaleFade in={isOpen}>
      <Image maxWidth="300px" cursor="pointer" onClick={() => onSelectAsset(id)} onLoad={onOpen} src={imageUrl} />
    </ScaleFade>
  );
};

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
  const navigate = useNavigate();
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

      const channel = client
        .channel(`public:assets`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assets' }, async payload => {
          if (payload.new.asset_generation_request_id === id) {
            const url = await client.storage.from('assets').createSignedUrl(payload.new.storage_key, 120);

            setAssets(prev => [...prev, { id: payload.new.id, imageUrl: url.data?.signedUrl || '' }]);
          }
        })
        .subscribe();

      return () => {
        client.removeChannel(channel);
      };
    }
  }, [client, id]);

  const onSelectAsset = useCallback(
    (assetId: string) => {
      navigate(`/assets/${assetId}`);
    },
    [navigate]
  );

  if (!id || !request) {
    return <Loading />;
  }

  if (assets.length === 0) {
    return <Loading />;
  }

  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
      <Heading>Ok, how do these look?</Heading>
      <CheckoutStepHeader step={2} prompt="Choose the card you love the most" />
      <Box justifyContent="center" flexWrap="wrap" flexDirection="row" flex={1} gap="10px" display="flex">
        {assets.map((asset, i) => (
          <CardImage key={i} id={id} assetId={asset.id} imageUrl={asset.imageUrl} onSelectAsset={onSelectAsset} />
        ))}
        {assets.length < request.expected_asset_count && (
          <Center width="100%" height="100%">
            <Spinner />
          </Center>
        )}
      </Box>
    </Box>
  );
};
