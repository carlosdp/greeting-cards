import { Box, FormControl, FormHelperText, Button, FormErrorMessage, Heading, Textarea } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { useClient } from 'react-supabase';

import { CheckoutStepHeader } from './CheckoutStepHeader';

export type CardGeneratorProps = {
  onCardRequested: (id: string) => void;
};

export const CardGenerator = ({ onCardRequested }: CardGeneratorProps) => {
  const client = useClient();
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangeDescription: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(e => {
    setDescription(e.target.value);
  }, []);

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);

      const result = await client
        .from('asset_generation_requests')
        .insert({
          style: 'christmas',
          description,
          expected_asset_count: 4,
        })
        .select();

      if (result.error) {
        console.error(result.error);
        setError(result.error.message);
      } else {
        const request = result.data[0];

        await fetch('/.netlify/functions/request-generation', {
          method: 'POST',
          body: JSON.stringify({ assetGenerationRequestId: request.id }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        onCardRequested(request.id);
      }
    } finally {
      setLoading(false);
    }
  }, [client, description, onCardRequested]);

  return (
    <Box flexDirection="column" gap="46px" display="flex">
      <Box>
        <Heading fontWeight="normal">Send a custom</Heading>
        <Heading>Christmas</Heading>
        <Heading>Greeting Card</Heading>
      </Box>
      <CheckoutStepHeader step={1} prompt="Tell us a little bit about the person that will be receiving this card" />
      <FormControl>
        <Textarea
          onChange={onChangeDescription}
          placeholder='Example: "my dad, he loves football (he is a Jets fan), and he is a writer for a travel blog"'
          value={description}
        />
        <FormHelperText>
          Tip: Be as descriptive as possible! What are their interests? Their hobbies? Do they have a job they love?
        </FormHelperText>
        {!!error && (
          <FormErrorMessage>Oops! We're having trouble at the moment, please try again later!</FormErrorMessage>
        )}
      </FormControl>
      <Box alignItems="center" justifyContent="center" display="flex">
        <Button isDisabled={description.length === 0} isLoading={loading} onClick={onSubmit}>
          Next
        </Button>
      </Box>
    </Box>
  );
};
