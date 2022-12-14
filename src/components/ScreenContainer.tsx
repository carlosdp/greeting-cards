import { Box } from '@chakra-ui/react';
import React from 'react';

export const ScreenContainer = ({ children }: React.PropsWithChildren<unknown>) => {
  return (
    <Box justifyContent="center" flexDirection="row" display="flex" width="100%">
      <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
        {children}
      </Box>
    </Box>
  );
};
