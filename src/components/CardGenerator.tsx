import { Box, FormControl, Input, FormLabel, FormHelperText, Button, FormErrorMessage } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClient } from 'react-supabase';

export const CardGenerator = () => {
  const client = useClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const onChangeDescription: React.ChangeEventHandler<HTMLInputElement> = useCallback(e => {
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
        navigate(`/requests/${request.id}`);
      }
    } finally {
      setLoading(false);
    }
  }, [client, description, navigate]);

  return (
    <Box>
      <FormControl>
        <FormLabel>Tell us a little about who you want to make a card for</FormLabel>
        <Input
          onChange={onChangeDescription}
          placeholder='Example: "my dad, who likes boats a lot and lives in Miami"'
          value={description}
        />
        <FormHelperText>
          Describe the person you are sending this card to, be as specific as possible for the best results
        </FormHelperText>
        {!!error && (
          <FormErrorMessage>Oops! We're having trouble at the moment, please try again later!</FormErrorMessage>
        )}
      </FormControl>
      <Button isDisabled={description.length === 0} isLoading={loading} onClick={onSubmit}>
        Show me some options
      </Button>
    </Box>
  );
};
