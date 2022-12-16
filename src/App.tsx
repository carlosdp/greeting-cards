import { Box } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';

import { AssetCheckout } from './components/AssetCheckout';
import { AssetDetails } from './components/AssetDetails';
import { Brand } from './components/Brand';
import { CardGenerationRequest } from './components/CardGenerationRequest';
import { CardGenerator } from './components/CardGenerator';
import { GenerationSuccess } from './components/GenerationSuccess';
import { Landing } from './components/Landing';
import { TrainSetUpload } from './components/TrainSetUpload';

const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

const AnimationLayout = () => {
  const { pathname } = useLocation();
  const normalizedPathname = useMemo(
    () => (pathname.includes('checkout') ? 'checkout' : pathname.includes('create') ? 'create' : pathname),
    [pathname]
  );

  return (
    <motion.div
      key={normalizedPathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      style={{ width: '100%' }}
    >
      <Outlet />
    </motion.div>
  );
};

function App() {
  const location = useLocation();
  const normalizedPathname = useMemo(
    () =>
      location.pathname.includes('checkout')
        ? 'checkout'
        : location.pathname.includes('create')
        ? 'create'
        : location.pathname,
    [location]
  );

  return (
    <Box alignItems="center" flexDirection="column" display="flex" width="100%">
      <Box
        justifyContent="center"
        display="flex"
        width="100%"
        paddingTop="36px"
        paddingRight="32px"
        paddingLeft="32px"
        paddingBottom="36px"
      >
        <Box zIndex="docked" alignItems="center" flexDirection="row" display="flex" width="100%" maxWidth="1300px">
          <Brand />
          <Box marginLeft="auto"></Box>
        </Box>
      </Box>
      <AnimatePresence exitBeforeEnter>
        <Routes location={location} key={normalizedPathname}>
          <Route element={<AnimationLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/upload" element={<TrainSetUpload />} />
            <Route path="/generation/success" element={<GenerationSuccess />} />
            <Route path="/create/*" element={<CardGenerator />} />
            <Route path="/requests/:id" element={<CardGenerationRequest />} />
            <Route path="/assets/:id" element={<AssetDetails />} />
            <Route path="/assets/:id/checkout/*" element={<AssetCheckout />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Box>
  );
}

export default App;
