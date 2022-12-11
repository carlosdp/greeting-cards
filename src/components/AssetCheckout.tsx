import { Box, Button, FormControl, FormHelperText, Heading, Text, Textarea } from '@chakra-ui/react';
import { AddressElement } from '@stripe/react-stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useClient } from 'react-supabase';

import { CardImage } from './CardImage';
import { CheckoutStepHeader } from './CheckoutStepHeader';
import { MessageCreator } from './MessageCreator';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -100,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

const AnimationLayout = () => {
  const { pathname } = useLocation();

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Outlet />
    </motion.div>
  );
};

type NameAndAddress = {
  name: string;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
};

type NameAndAddressFormProps = {
  onAddressChange: (address: NameAndAddress) => void;
  onNext?: () => void;
};

const NameAndAddressForm = ({ onAddressChange, onNext }: NameAndAddressFormProps) => {
  const [validNameAndAddress, setValidNameAndAddress] = useState(false);

  const onChange = useCallback(
    (e: { complete: boolean; value?: NameAndAddress }) => {
      if (e.complete && e.value) {
        onAddressChange(e.value);
        setValidNameAndAddress(true);
      }
    },
    [onAddressChange]
  );

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <Heading fontWeight="normal">Lastly, where are we sending it?</Heading>
      <AddressElement
        options={{
          mode: 'shipping',
          autocomplete: {
            mode: 'google_maps_api',
            apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY!,
          },
        }}
        onChange={onChange}
      />
      <Box alignItems="center" justifyContent="center" flexDirection="row" display="flex">
        <Button disabled={!validNameAndAddress} onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

type MessageFormProps = {
  assetId: string;
  onMessageChange: (message: string) => void;
  message: string;
  onNext?: () => void;
};

const MessageForm = ({ assetId, onMessageChange, message, onNext }: MessageFormProps) => {
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onMessageChange(e.target.value),
    [onMessageChange]
  );

  const onSelectStyle = useCallback(
    async (name: string, messageStyle: { id: string }) => {
      if (name.length === 0) {
        return;
      }

      try {
        setLoading(true);

        const res = await fetch('/.netlify/functions/generate-message', {
          body: JSON.stringify({
            asset_id: assetId,
            message_style_id: messageStyle.id,
          }),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          const data = await res.json();
          const mes = data.message.includes('[Name]')
            ? data.message.replace('[Name]', name)
            : `${data.message}\n\n- ${name}`;
          setGeneratedMessage(mes);
          onMessageChange(mes);
        }
      } finally {
        setLoading(false);
      }
    },
    [assetId, onMessageChange]
  );

  const content = generatedMessage ? (
    <>
      <FormControl>
        <Textarea
          onChange={onChange}
          placeholder="Write something nice! We'll print it on the inside of the card."
          rows={15}
          value={message}
        />
        <FormHelperText>Make sure to sign off with your name</FormHelperText>
      </FormControl>
      <Box alignItems="center" flexDirection="row" display="flex">
        <Button disabled={message.length === 0} onClick={onNext}>
          Review
        </Button>
      </Box>
    </>
  ) : (
    <MessageCreator onSelect={onSelectStyle} loading={loading} />
  );

  return (
    <Box alignItems="center" justifyContent={{ base: 'center', lg: 'flex-start' }} flex={1} display="flex">
      <Box flexDirection="column" gap="46px" display="flex">
        <Box>
          <Heading fontWeight="normal">Write a message</Heading>
          <Heading>for the inside of the card</Heading>
        </Box>
        {content}
      </Box>
    </Box>
  );
};

const DetailsReview = ({
  nameAndAddress,
  message,
  onNext,
}: {
  nameAndAddress: NameAndAddress;
  message: string;
  onNext?: () => Promise<void>;
}) => {
  const [loading, setLoading] = useState(false);
  const name = nameAndAddress.name;
  const address = `${nameAndAddress.address.line1}, ${nameAndAddress.address.city}, ${nameAndAddress.address.state} ${nameAndAddress.address.postal_code}`;

  const onClick = useCallback(async () => {
    if (onNext) {
      try {
        setLoading(true);
        await onNext();
      } finally {
        setLoading(false);
      }
    }
  }, [onNext]);

  return (
    <Box flexDirection="column" gap="12px" display="flex" paddingBottom="46px">
      <Heading fontWeight="normal">Here's your message</Heading>
      <Textarea isReadOnly rows={15} value={message} />
      <Heading fontWeight="normal">and we'll send it to</Heading>
      <Text>{name}</Text>
      <Text>{address}</Text>
      <Box alignItems="center" flexDirection="row" display="flex">
        <Button isLoading={loading} onClick={onClick}>
          Send Card
        </Button>
      </Box>
    </Box>
  );
};

const Success = () => {
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <Box>
        <Heading>Great!</Heading>
        <Heading fontWeight="normal">Your order is being processed.</Heading>
      </Box>
      <Text>Check your email for an order confirmation.</Text>
      <Box>
        <Button onClick={onClick} variant="outline">
          Make another card
        </Button>
      </Box>
    </Box>
  );
};

export const AssetCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const client = useClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [nameAndAddress, setNameAndAddress] = useState<NameAndAddress | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (location.pathname.includes('/review') && (!nameAndAddress || message.length === 0)) {
      navigate(`/assets/${id}/checkout`);
    }
  }, [location, nameAndAddress, message, navigate, id]);

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

  const onFinishedMessage = useCallback(() => {
    if (message.length > 0) {
      navigate(`/assets/${id}/checkout/address`);
    }
  }, [id, message, navigate]);

  const onFinishedNameAndAddress = useCallback(() => {
    if (nameAndAddress) {
      navigate(`/assets/${id}/checkout/review`);
    }
  }, [id, nameAndAddress, navigate]);

  const onFinalize = useCallback(async () => {
    if (nameAndAddress && message) {
      const checkoutRes = await fetch('/.netlify/functions/create-checkout', {
        body: JSON.stringify({
          order: {
            asset_id: id,
            message,
            name: nameAndAddress.name,
            line1: nameAndAddress.address.line1,
            line2: nameAndAddress.address.line2,
            city: nameAndAddress.address.city,
            state: nameAndAddress.address.state,
            postal_code: nameAndAddress.address.postal_code,
            country: nameAndAddress.address.country,
          },
        }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (checkoutRes.ok) {
        const checkoutData = await checkoutRes.json();
        window.location.href = checkoutData.checkoutUrl;
      }
    }
  }, [nameAndAddress, message, id]);

  return (
    <Box
      flexDirection={{ base: 'column', lg: 'row' }}
      gap="46px"
      display="flex"
      width="100%"
      maxWidth="936px"
      padding="32px"
    >
      <Box justifyContent="center" display="flex">
        <CardImage imageUrl={imageUrl} />
      </Box>
      <Box flexDirection="column" gap="25px" display="flex">
        <CheckoutStepHeader step={3} prompt="Fill in the name and address, and write your personalized message" />
        <AnimatePresence exitBeforeEnter>
          <Routes location={location} key={location.pathname}>
            <Route element={<AnimationLayout />}>
              <Route
                path="/"
                element={
                  <MessageForm
                    assetId={id!}
                    onMessageChange={setMessage}
                    message={message}
                    onNext={onFinishedMessage}
                  />
                }
              />
              <Route
                path="/address"
                element={<NameAndAddressForm onAddressChange={setNameAndAddress} onNext={onFinishedNameAndAddress} />}
              />
              <Route
                path="/review"
                element={<DetailsReview nameAndAddress={nameAndAddress!} message={message} onNext={onFinalize} />}
              />
              <Route path="/success" element={<Success />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Box>
    </Box>
  );
};
