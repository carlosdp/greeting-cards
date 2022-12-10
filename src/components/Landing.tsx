import { Box, Heading, Center, Button, useDisclosure, Fade } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Video = () => {
  const { isOpen, onOpen } = useDisclosure();

  return (
    <Fade in={isOpen}>
      <Box as="video" border="none" autoPlay loop muted onCanPlay={onOpen} playsInline>
        <Box as="source" src="/images/landing-animation.mp4" type="video/mp4" />
      </Box>
    </Fade>
  );
};

export const Landing = () => {
  const navigate = useNavigate();

  const onDesignCard = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  return (
    <Box
      flexDirection={{ base: 'column-reverse', lg: 'column' }}
      gap={{ base: '12px', lg: '46px' }}
      display="flex"
      width="100%"
      maxWidth="1240px"
    >
      <Box>
        <Box
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap="12px"
          display="flex"
          padding="20px"
          backgroundColor="white"
        >
          <Heading fontSize={{ base: '48px', md: '64px' }} textAlign="center">
            Impress your loved ones with a unique, personalized greeting card
          </Heading>
          <Heading as="h2" fontSize="24px" fontWeight="normal">
            Send friends & family personalized, physical messages mailed to their home, in a just a few taps
          </Heading>
        </Box>
        <Center>
          <Button onClick={onDesignCard} size="lg">
            Design a Card
          </Button>
        </Center>
      </Box>
      <Video />
    </Box>
  );
};
