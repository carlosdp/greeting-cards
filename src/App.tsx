import { Box, Text } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';

import { CardGenerationRequest } from './components/CardGenerationRequest';
import { CardGenerator } from './components/CardGenerator';

function Home() {
  return (
    <Box width="100%" maxWidth="936px">
      <CardGenerator />
    </Box>
  );
}

function App() {
  return (
    <Box alignItems="center" flexDirection="column" display="flex" width="100%">
      <Box justifyContent="center" display="flex" width="100%" paddingTop="36px" paddingBottom="36px">
        <Box alignItems="center" flexDirection="row" display="flex" width="100%" maxWidth="936px">
          <Text>Greeting Cards</Text>
          <Box marginLeft="auto"></Box>
        </Box>
      </Box>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requests/:id" element={<CardGenerationRequest />} />
      </Routes>
    </Box>
  );
}

export default App;
