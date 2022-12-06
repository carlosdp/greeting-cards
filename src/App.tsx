import { Box } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';

import { Brand } from './components/Brand';
import { CardCreationFlow } from './components/CardCreationFlow';
import { CardGenerationRequest } from './components/CardGenerationRequest';

function App() {
  return (
    <Box alignItems="center" flexDirection="column" display="flex" width="100%">
      <Box justifyContent="center" display="flex" width="100%" paddingTop="36px" paddingBottom="36px">
        <Box alignItems="center" flexDirection="row" display="flex" width="100%" maxWidth="936px">
          <Brand />
          <Box marginLeft="auto"></Box>
        </Box>
      </Box>
      <Routes>
        <Route path="/*" element={<CardCreationFlow />} />
      </Routes>
    </Box>
  );
}

export default App;
