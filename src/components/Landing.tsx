import { Box, Heading, useDisclosure, Fade, useMediaQuery, Button, Image, Center } from '@chakra-ui/react';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { CheckoutStepHeader } from './CheckoutStepHeader';

const Video = () => {
  const { isOpen, onOpen } = useDisclosure();
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videoRef = useRef<any>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [isMobile]);

  return (
    <Fade in={isOpen}>
      <Box ref={videoRef} as="video" width="100%" border="none" autoPlay loop muted onCanPlay={onOpen} playsInline>
        {isMobile ? (
          <Box as="source" src="/images/landing-animation-1080.mp4" type="video/mp4" />
        ) : (
          <Box as="source" src="/images/landing-animation.mp4" type="video/mp4" />
        )}
      </Box>
    </Fade>
  );
};

export const Landing = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   window.document.querySelector('html')?.classList.add('elations-purple-background');
  //   window.document.querySelector('body')?.classList.add('elations-purple-background');
  //   window.document.querySelector('#elations-brand')?.classList.add('elations-brand-dark');

  //   return () => {
  //     window.document.querySelector('html')?.classList.remove('elations-purple-background');
  //     window.document.querySelector('body')?.classList.remove('elations-purple-background');
  //     window.document.querySelector('#elations-brand')?.classList.remove('elations-brand-dark');
  //   };
  // }, []);

  const onCreate = useCallback(() => {
    navigate('/upload');
  }, [navigate]);

  return (
    <Box
      alignItems="center"
      justifyContent="center"
      flexDirection="row"
      display="flex"
      minHeight="60vh"
      paddingRight="32px"
      paddingLeft="32px"
    >
      <Box flexDirection="column" gap="25px" display="flex" width="100%" maxWidth="1300px">
        <Box flexDirection="column" gap="12px" display="flex" width="100%" paddingBottom={{ base: '50px', lg: '32px' }}>
          <Heading fontSize={{ base: '36px', lg: '64px' }}>Send Personalized Greeting Cards, easy</Heading>
          <Center paddingTop="20px" paddingBottom="20px">
            <Button onClick={onCreate} size="lg">
              Create a Card
            </Button>
          </Center>
          <Heading as="h2" fontSize={{ base: '18px', lg: '24px' }} fontWeight="normal">
            With a few photos and a couple taps, create and mail a personalized greeting card designed specifically for
            your friend or family member.
          </Heading>
        </Box>
        <Box
          alignItems={{ base: 'center', lg: 'flex-start' }}
          justifyContent={{ base: 'flex-start', lg: 'space-around' }}
          flexDirection={{ base: 'column', lg: 'row' }}
          display="flex"
        >
          <Box flexDirection="column" gap="18px" display="flex" maxWidth="300px">
            <CheckoutStepHeader step={1}>Upload 10-20 photos</CheckoutStepHeader>
            <Image maxWidth="300px" src="/images/uploaded-images.png" />
          </Box>
          <Box flexDirection="column" gap="18px" display="flex" maxWidth="300px">
            <CheckoutStepHeader step={2}>Choose a design you like</CheckoutStepHeader>
            <Image maxWidth="300px" src="/images/generated-images.png" />
          </Box>
          <Box flexDirection="column" gap="18px" display="flex" maxWidth="300px">
            <CheckoutStepHeader step={3}>Write a message, and we'll print & mail it for you!</CheckoutStepHeader>
            <Image maxWidth="300px" src="/images/mailbox.png" />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
