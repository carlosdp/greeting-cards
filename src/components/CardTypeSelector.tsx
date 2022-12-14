import { Box, Button, Heading, Image, Text } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CARD_TYPES = [
  {
    id: 'greeting_card',
    label: 'Greeting Card',
    price: '$9.99',
    image: '/images/greeting-card.png',
  },
  {
    id: 'handwritten',
    label: 'Handwritten Postcard',
    price: '$14.99',
    image: '/images/handwritten.png',
  },
];

export const CardTypeSelector = () => {
  const navigate = useNavigate();

  const onSelect = useCallback(
    (cardType: string) => {
      navigate(`/create?cardType=${cardType}`);
    },
    [navigate]
  );

  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
      <Box
        alignItems="flex-start"
        justifyContent="flex-start"
        flexDirection={{ base: 'column', xl: 'row' }}
        gap="12px"
        display="flex"
      >
        {CARD_TYPES.map(cardType => (
          <Button
            key={cardType.id}
            flexDirection="row"
            gap="16px"
            display="flex"
            padding="36px"
            colorScheme="blackAlpha"
            onClick={() => onSelect(cardType.id)}
            size={{ base: 'sm', lg: 'lg' }}
            variant="solid"
          >
            <Image width="50px" alt={cardType.label} src={cardType.image} />
            <Box>
              <Text>{cardType.label}</Text>
              <Text>{cardType.price}</Text>
            </Box>
          </Button>
        ))}
      </Box>
    </Box>
  );
};
