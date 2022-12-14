import { Box, Heading, useDisclosure, Fade, useMediaQuery, Button } from '@chakra-ui/react';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    window.document.querySelector('html')?.classList.add('elations-purple-background');
    window.document.querySelector('body')?.classList.add('elations-purple-background');
    window.document.querySelector('#elations-brand')?.classList.add('elations-brand-dark');

    return () => {
      window.document.querySelector('html')?.classList.remove('elations-purple-background');
      window.document.querySelector('body')?.classList.remove('elations-purple-background');
      window.document.querySelector('#elations-brand')?.classList.remove('elations-brand-dark');
    };
  }, []);

  const onCreate = useCallback(() => {
    navigate('/create');
  }, [navigate]);

  return (
    <Box
      flexDirection="column"
      gap={{ base: '12px', lg: '46px' }}
      display="flex"
      width="100%"
      minHeight="100vh"
      marginTop="-108px"
      backgroundColor="rgb(73,60,114)"
    >
      <Video />
      <Box
        position="absolute"
        left={0}
        justifyContent="flex-end"
        flexDirection="row"
        display="flex"
        width="100%"
        maxWidth={{
          base: '500px',
          lg: '800px',
          xl: '900px',
          '2xl': '1000px',
        }}
        margin={{
          base: '90px',
          md: '90px',
          lg: '90px',
          xl: '100px',
          '2xl': '240px',
        }}
        marginLeft={{
          base: '32px',
          md: '32px',
          xl: '130px',
          '2xl': '320px',
        }}
      >
        <Box
          flexDirection="column"
          gap="12px"
          display="flex"
          color="white"
          paddingBottom={{ base: '50px', lg: '32px' }}
        >
          <Heading fontSize={{ base: '36px', lg: '64px' }}>
            AI Designed Greeting Cards, printed & mailed for you
          </Heading>
          <Box paddingTop="20px" paddingBottom="20px">
            <Button onClick={onCreate} size="lg">
              Try it free
            </Button>
          </Box>
          <Heading as="h2" fontSize={{ base: '18px', lg: '24px' }} fontWeight="normal">
            In just a few taps, impress your friends and loved ones with a personalized greeting card, designed by you
            (and our AI)
          </Heading>
        </Box>
      </Box>
    </Box>
  );
};
