import { Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useClient } from 'react-supabase';

export type Persona = {
  id: string;
  label: string;
};

export type PersonaSelectorProps = {
  onSelect: (persona: Persona) => void;
};

export const PersonaSelector = ({ onSelect }: PersonaSelectorProps) => {
  const client = useClient();
  const [personas, setPersonas] = useState<Persona[]>([]);

  useEffect(() => {
    // eslint-disable-next-line promise/catch-or-return
    client
      .from('personas')
      .select('id, label')
      .then(({ data, error }) => {
        if (!error) {
          setPersonas(data);
        }
      });
  }, [client]);

  const onClick = (id: string) => {
    const persona = personas.find(el => el.id === id);

    if (persona) {
      onSelect(persona);
    }
  };

  return (
    <Box flexWrap="wrap" flexDirection="row" gap="8px" display="flex">
      {personas.map(persona => (
        <Button key={persona.id} onClick={() => onClick(persona.id)} size="sm" variant="outline">
          {persona.label}
        </Button>
      ))}
    </Box>
  );
};
