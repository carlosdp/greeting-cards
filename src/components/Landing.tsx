import { Box, Heading, Center, Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckoutStepHeader } from './CheckoutStepHeader';

export const Landing = () => {
  const navigate = useNavigate();

  const onDesignCard = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px">
      <Box
        justifyContent="flex-end"
        flexDirection="column"
        display="flex"
        width="100%"
        height="40vh"
        padding="25px"
        background="url(/images/hero.png)"
      >
        <Box width="fit-content" padding="12px" backgroundColor="white">
          <Heading fontWeight="normal">Personalized</Heading>
          <Heading fontWeight="normal">Christmas Greeting Cards</Heading>
          <Heading>in one minute</Heading>
        </Box>
      </Box>
      <Box flexDirection="column" gap="12px" display="flex" paddingRight="20px" paddingLeft="20px">
        <CheckoutStepHeader step={1} prompt="Tell us a little bit about the person that will be receiving the card" />
        <CheckoutStepHeader
          step={2}
          prompt="Our robot gnomes will design some options for you to look at within a minute"
        />
        <CheckoutStepHeader step={3} prompt="Choose a design you like, and we’ll mail it for you!" />
      </Box>
      <Center>
        <Button onClick={onDesignCard}>Design a Card</Button>
      </Center>
    </Box>
  );
};
