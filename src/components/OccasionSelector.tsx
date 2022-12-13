import { Box, Button, Heading, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useClient } from 'react-supabase';

type Occasion = {
  id: string;
  name: string;
  description: string | null;
};

export type OccasionSelectorProps = {
  onSelect: (occasion: string) => void;
};

export const OccasionSelector = ({ onSelect }: OccasionSelectorProps) => {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const client = useClient();

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    client
      .from('occasions')
      .select('*')
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        }
        if (data) {
          setOccasions(data);
        }
      });
  }, [client]);

  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
      <Heading>What's the ocassion?</Heading>
      <Text>Price includes printing & shipping</Text>
      {occasions.length === 0 && <Spinner />}
      <Box flexDirection="row" gap="12px" display="flex">
        {occasions.map(occasion => (
          <Button
            key={occasion.id}
            flexDirection="column"
            gap="16px"
            display="flex"
            padding="36px"
            colorScheme="gray"
            onClick={() => onSelect(occasion.id)}
            size="lg"
            variant="outline"
          >
            <Text>{occasion.name}</Text>
          </Button>
        ))}
      </Box>
    </Box>
  );
};
