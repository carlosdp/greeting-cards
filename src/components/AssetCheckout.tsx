import { Box, Button, FormControl, FormHelperText, Heading, Image, Spinner, Text, Textarea } from '@chakra-ui/react';
import { AddressElement } from '@stripe/react-stripe-js';
import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { useClient } from 'react-supabase';

import { CheckoutStepHeader } from './CheckoutStepHeader';

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
  const onChange = useCallback(
    (e: { complete: boolean; value?: NameAndAddress }) => {
      if (e.complete && e.value) {
        onAddressChange(e.value);
      }
    },
    [onAddressChange]
  );

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <Heading fontWeight="normal">Where are we sending it?</Heading>
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
        <Button onClick={onNext}>Next</Button>
      </Box>
    </Box>
  );
};

type MessageFormProps = {
  onMessageChange: (message: string) => void;
  message: string;
  onNext?: () => void;
};

const MessageForm = ({ onMessageChange, message, onNext }: MessageFormProps) => {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => onMessageChange(e.target.value),
    [onMessageChange]
  );

  return (
    <Box alignItems="center" justifyContent="center" flex={1} display="flex">
      <Box flexDirection="column" gap="46px" display="flex">
        <Box>
          <Heading fontWeight="normal">Lastly, write a message</Heading>
          <Heading>for the inside of the card</Heading>
        </Box>
        <FormControl>
          <Textarea
            onChange={onChange}
            placeholder="Write something nice! We'll print it on the inside of the card."
            value={message}
          />
          <FormHelperText>Make sure to sign off with your name</FormHelperText>
        </FormControl>
        <Box alignItems="center" justifyContent="center" flexDirection="row" display="flex">
          <Button onClick={onNext}>Review</Button>
        </Box>
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
  onNext?: () => void;
}) => {
  const name = nameAndAddress.name;
  const address = `${nameAndAddress.address.line1}, ${nameAndAddress.address.city}, ${nameAndAddress.address.state} ${nameAndAddress.address.postal_code}`;

  return (
    <Box>
      <Heading fontWeight="normal">Here's your message</Heading>
      <Text>{message}</Text>
      <Heading fontWeight="normal">and we'll send it to</Heading>
      <Text>{name}</Text>
      <Text>{address}</Text>
      <Box alignItems="center" justifyContent="center" flexDirection="row" display="flex">
        <Button onClick={onNext}>Send Card</Button>
      </Box>
    </Box>
  );
};

export const AssetCheckout = () => {
  const { id } = useParams<{ id: string }>();
  const client = useClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [nameAndAddress, setNameAndAddress] = useState<NameAndAddress | null>(null);
  const [message, setMessage] = useState<string>('');

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

  if (!imageUrl) {
    return <Spinner />;
  }

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <CheckoutStepHeader step={3} prompt="Fill in the name and address, and write your personalized message" />
      <Image src={imageUrl} />
      <Routes>
        <Route path="/" element={<NameAndAddressForm onAddressChange={setNameAndAddress} />} />
        <Route path="/message" element={<MessageForm onMessageChange={setMessage} message={message} />} />
        <Route path="/review" element={<DetailsReview nameAndAddress={nameAndAddress!} message={message} />} />
      </Routes>
    </Box>
  );
};
