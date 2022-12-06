import { Box, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const Brand = () => {
  const navigate = useNavigate();

  const onClick = useCallback(() => navigate('/'), [navigate]);

  return (
    <Box alignItems="center" flexDirection="row" display="flex" cursor="pointer" onClick={onClick}>
      <Text as="span" textStyle="brand" color="purple.500">
        Elations
      </Text>
    </Box>
  );
};
