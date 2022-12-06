import { Box, Text } from '@chakra-ui/react';

export const Brand = () => {
  return (
    <Box alignItems="center" flexDirection="row" display="flex">
      <Text as="span" textStyle="brand" color="purple.500">
        Elations
      </Text>
    </Box>
  );
};
