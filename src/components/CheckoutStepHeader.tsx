import { Box, Text } from '@chakra-ui/react';
import React from 'react';

export type CheckoutStepHeaderProps = {
  step: number;
  children: React.ReactNode;
};

export const CheckoutStepHeader = ({ step, children }: CheckoutStepHeaderProps) => {
  return (
    <Box alignItems="center" flexDirection="row" gap="10px" display="flex">
      <Box
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        display="flex"
        width="52px"
        height="52px"
        color="white"
        fontSize="24px"
        fontWeight="bold"
        background="purple.500"
        borderRadius="full"
      >
        {step}
      </Box>
      <Text fontSize="18px">{children}</Text>
    </Box>
  );
};
