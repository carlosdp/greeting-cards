import { Box, Button, FormControl, FormLabel, Input, Spinner, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'react-supabase';

export type MessageStyle = {
  id: string;
  label: string;
};

export type MessageCreatorProps = {
  onSelect: (name: string, messageStyle: MessageStyle) => void;
  loading?: boolean;
};

export const MessageCreator = ({ onSelect, loading }: MessageCreatorProps) => {
  const client = useClient();
  const [name, setName] = useState('');
  const [messageStyles, setMessageStyles] = useState<MessageStyle[]>([]);

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    client
      .from('message_styles')
      .select('id, label')
      .then(({ data, error }) => {
        if (!error) {
          setMessageStyles(data);
        }
      });
  }, [client]);

  const onClick = (id: string) => {
    const messageStyle = messageStyles.find(el => el.id === id);

    if (messageStyle) {
      onSelect(name, messageStyle);
    }
  };

  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);

  return (
    <Box flexDirection="column" gap="12px" display="flex">
      <Text>We can generate a message for you to get started!</Text>
      <FormControl>
        <FormLabel>What's your name?</FormLabel>
        <Input onChange={onNameChange} />
      </FormControl>
      <Text>What kind of note do you want to write?</Text>
      <Box flexWrap="wrap" flexDirection="row" gap="8px" display="flex">
        {messageStyles.map(messageStyle => (
          <Button
            key={messageStyle.id}
            isDisabled={loading}
            onClick={() => onClick(messageStyle.id)}
            size="sm"
            variant="outline"
          >
            {messageStyle.label}
          </Button>
        ))}
      </Box>
      {loading && <Spinner size="lg" />}
    </Box>
  );
};
