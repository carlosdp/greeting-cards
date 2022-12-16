import { Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CardTypeSelector } from './CardTypeSelector';
import { CheckoutStepHeader } from './CheckoutStepHeader';
import { Interest, InterestsSelector } from './InterestsSelector';
import { OccasionSelector } from './OccasionSelector';
import { Persona, PersonaSelector } from './PersonaSelector';
import { ScreenContainer } from './ScreenContainer';

export const CardGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [interests, setInterests] = useState<Interest[] | null>(null);

  useEffect(() => {
    if (
      (location.pathname.includes('/interests') && !persona) ||
      (location.pathname.includes('/persona') && !occasion) ||
      (location.pathname.includes('/card_type') && !interests)
    ) {
      navigate('/create');
    }
  }, [location, persona, navigate, occasion, searchParams, interests]);

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
    (selectedInterests: Interest[]) => {
      setInterests(selectedInterests);
      navigate('/create/card_type');
    },
    [navigate]
  );

  const onSelectCardType = useCallback(
    async (selectedCardType: string) => {
      if (!persona || !occasion || !interests) {
        return;
      }

      try {
        setLoading(true);

        const res = await fetch('/.netlify/functions/request-generations', {
          method: 'POST',
          body: JSON.stringify({
            persona_id: persona?.id,
            interest_ids: interests.map(el => el.id),
            card_type: selectedCardType,
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
    [persona, navigate, occasion, interests]
  );

  return (
    <ScreenContainer>
      <CheckoutStepHeader step={1}>Tell us about who will be receiving this card</CheckoutStepHeader>
      <Routes>
        <Route path="/" element={<OccasionSelector onSelect={onSelectOccasion} />} />
        <Route path="/persona" element={<PersonaSelector onSelect={onSelectPersona} />} />
        <Route path="/interests" element={<InterestsSelector onSelect={onSelectInterests} isLoading={loading} />} />
        <Route path="/card_type" element={<CardTypeSelector onSelect={onSelectCardType} isLoading={loading} />} />
      </Routes>
      {error && <Text>Oops! We're having some trouble, please try again later!</Text>}
    </ScreenContainer>
  );
};
