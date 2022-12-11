import { Box, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { CheckoutStepHeader } from './CheckoutStepHeader';
import { Interest, InterestsSelector } from './InterestsSelector';
import { Persona, PersonaSelector } from './PersonaSelector';

export const CardGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/interests') && !persona) {
      navigate(`/create`);
    }
  }, [location, persona, navigate]);

  const onSelectPersona = useCallback(
    (selectedPersona: Persona) => {
      setPersona(selectedPersona);
      navigate('/create/interests');
    },
    [navigate]
  );

  const onSelectInterests = useCallback(
    async (interests: Interest[]) => {
      try {
        setLoading(true);

        const res = await fetch('/.netlify/functions/request-generations', {
          method: 'POST',
          body: JSON.stringify({ persona_id: persona?.id, interest_ids: interests.map(el => el.id) }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          setError('could not generate assets');
        } else {
          const request = await res.json();
          navigate(`/requests/${request.id}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [persona, navigate]
  );

  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
      <CheckoutStepHeader step={1} prompt="Who's going to be receiving this card?" />
      <Routes>
        <Route path="/" element={<PersonaSelector onSelect={onSelectPersona} />} />
        <Route path="/interests" element={<InterestsSelector onSelect={onSelectInterests} isLoading={loading} />} />
      </Routes>
      {error && <Text>Oops! We're having some trouble, please try again later!</Text>}
    </Box>
  );
};
