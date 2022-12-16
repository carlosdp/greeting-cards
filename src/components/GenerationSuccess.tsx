import { CheckIcon } from '@chakra-ui/icons';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

import { ScreenContainer } from './ScreenContainer';

export const GenerationSuccess = () => {
  return (
    <ScreenContainer>
      <Heading alignItems="center" gap="18px" display="flex">
        <Box display="inline-block">
          <Box
            alignItems="center"
            justifyContent="center"
            display="flex"
            padding="18px"
            borderRadius="full"
            backgroundColor="green.500"
          >
            <CheckIcon color="white" />
          </Box>
        </Box>
        Success!
      </Heading>
      <Text>We'll email you when your card options are ready to review.</Text>
      <Box>
        <Button as={Link} to="/">
          Create more cards
        </Button>
      </Box>
    </ScreenContainer>
  );
};
