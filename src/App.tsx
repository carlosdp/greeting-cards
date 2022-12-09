import { Box } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';

import { AssetCheckout } from './components/AssetCheckout';
import { AssetDetails } from './components/AssetDetails';
import { Brand } from './components/Brand';
import { CardGenerationRequest } from './components/CardGenerationRequest';
import { CardGenerator } from './components/CardGenerator';
import { Landing } from './components/Landing';

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

  return (
    <motion.div
      key={pathname}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Outlet />
    </motion.div>
  );
};

function App() {
  const location = useLocation();

  return (
    <Box alignItems="center" flexDirection="column" display="flex" width="100%">
      <Box
        justifyContent="center"
        display="flex"
        width="100%"
        paddingTop="36px"
        paddingRight="20px"
        paddingLeft="20px"
        paddingBottom="36px"
      >
        <Box alignItems="center" flexDirection="row" display="flex" width="100%" maxWidth="936px">
          <Brand />
          <Box marginLeft="auto"></Box>
        </Box>
      </Box>
      <AnimatePresence exitBeforeEnter>
        <Routes location={location} key={location.pathname}>
          <Route element={<AnimationLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/create" element={<CardGenerator />} />
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
