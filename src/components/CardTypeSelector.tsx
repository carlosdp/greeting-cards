import { Box, Button, Heading, Image, Text } from '@chakra-ui/react';

const CARD_TYPES = [
  {
    id: 'greeting_card',
    label: 'Greeting Card',
    price: '$9.99',
    image: '/images/portrait-cover.png',
  },
  {
    id: 'handwritten',
    label: 'Handwritten Postcard',
    price: '$14.99',
    image: '/images/landscape-cover.png',
  },
];

export type CardTypeSelectorProps = {
  onSelect: (cardType: string) => void;
};

export const CardTypeSelector = ({ onSelect }: CardTypeSelectorProps) => {
  return (
    <Box flexDirection="column" gap="46px" display="flex" width="100%" maxWidth="936px" padding="20px">
      <Heading>What type of card do you want to send?</Heading>
      <Text>Price includes printing & shipping</Text>
      <Box flexDirection="row" gap="12px" display="flex">
        {CARD_TYPES.map(cardType => (
          <Button
            key={cardType.id}
            flexDirection="row"
            gap="16px"
            display="flex"
            padding="36px"
            colorScheme="gray"
            onClick={() => onSelect(cardType.id)}
            size="lg"
            variant="outline"
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
