import { Box, Button } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'react-supabase';

export type Interest = {
  id: string;
  label: string;
};

export type InterestsSelectorProps = {
  onSelect: (inerests: Interest[]) => void;
  isLoading?: boolean;
};

export const InterestsSelector = ({ onSelect, isLoading }: InterestsSelectorProps) => {
  const client = useClient();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Record<string, Interest>>({} as Record<string, Interest>);

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    client
      .from('interests')
      .select('id, label')
      .then(({ data, error }) => {
        if (!error) {
          setInterests(data);
        }
      });
  }, [client]);

  const select = useCallback(() => {
    onSelect(Object.values(selectedInterests));
  }, [selectedInterests, onSelect]);

  const onClick = (id: string) => {
    const interest = interests.find(el => el.id === id);

    if (interest) {
      if (id in selectedInterests) {
        const { [id]: _, ...rest } = selectedInterests;
        setSelectedInterests(rest);
      } else {
        setSelectedInterests(selected => ({ ...selected, [interest.id]: interest }));
      }
    }
  };

  return (
    <Box flexDirection="column" gap="25px" display="flex">
      <Box flexWrap="wrap" flexDirection="row" gap="8px" display="flex">
        {interests.map(interest => (
          <Button
            key={interest.id}
            isActive={!!selectedInterests[interest.id]}
            onClick={() => onClick(interest.id)}
            size="sm"
            variant="outline"
          >
            {interest.label}
          </Button>
        ))}
      </Box>
      <Button isLoading={isLoading} onClick={select}>
        Next
      </Button>
    </Box>
  );
};
