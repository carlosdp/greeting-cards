import { Box, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { CardTypeSelector } from './CardTypeSelector';
import { CheckoutStepHeader } from './CheckoutStepHeader';
import { Interest, InterestsSelector } from './InterestsSelector';
import { OccasionSelector } from './OccasionSelector';
import { Persona, PersonaSelector } from './PersonaSelector';

export const CardGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardType, setCardType] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<string | null>(null);

  useEffect(() => {
    if (
      (location.pathname.includes('/interests') && !persona) ||
      (location.pathname.includes('/persona') && !occasion) ||
      (location.pathname.includes('/occasion') && !cardType)
    ) {
      navigate(`/create`);
    }
  }, [location, persona, navigate, occasion, cardType]);

  const onSelectCardType = useCallback(
    (type: string) => {
      setCardType(type);
      navigate('/create/occasion');
    },
    [navigate]
  );

  const onSelectOccasion = useCallback(
    (occ: string) => {
      setOccasion(occ);
      navigate('/create/persona');
    },
    [navigate]
  );

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
          body: JSON.stringify({
            persona_id: persona?.id,
            interest_ids: interests.map(el => el.id),
            card_type: cardType,
            occasion,
          }),
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
    [persona, navigate, cardType, occasion]
  );

  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
      <CheckoutStepHeader step={1} prompt="Tell us about who will be receiving this card" />
      <Routes>
        <Route path="/" element={<CardTypeSelector onSelect={onSelectCardType} />} />
        <Route path="/occasion" element={<OccasionSelector onSelect={onSelectOccasion} />} />
        <Route path="/persona" element={<PersonaSelector onSelect={onSelectPersona} />} />
        <Route path="/interests" element={<InterestsSelector onSelect={onSelectInterests} isLoading={loading} />} />
      </Routes>
      {error && <Text>Oops! We're having some trouble, please try again later!</Text>}
    </Box>
  );
};
