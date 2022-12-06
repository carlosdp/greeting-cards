import { Box } from '@chakra-ui/react';
import { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import { AssetCheckout } from './AssetCheckout';
import { AssetDetails } from './AssetDetails';
import { CardGenerationRequest } from './CardGenerationRequest';
import { CardGenerator } from './CardGenerator';

export const CardCreationFlow = () => {
  const navigate = useNavigate();

  const onCardRequested = useCallback(
    (id: string) => {
      navigate(`/requests/${id}`);
    },
    [navigate]
  );

  const onSelectAsset = useCallback(
    (requestId: string, id: number) => {
      navigate(`/requests/${requestId}/assets/${id}`);
    },
    [navigate]
  );

  return (
    <Box width="100%" maxWidth="936px">
      <Routes>
        <Route path="/" element={<CardGenerator onCardRequested={onCardRequested} />} />
        <Route path="/requests/:id" element={<CardGenerationRequest onSelectAsset={onSelectAsset} />} />
        <Route path="/requests/:requestId/assets/:id" element={<AssetDetails />} />
        <Route path="/requests/:requestId/assets/:id/checkout/*" element={<AssetCheckout />} />
      </Routes>
    </Box>
  );
};
