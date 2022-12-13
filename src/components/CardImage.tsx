import { Box, Image, ScaleFade, useDisclosure } from '@chakra-ui/react';
import { useCallback } from 'react';

const sizes = {
  sm: {
    width: '90px',
    height: '130px',
  },
  md: {
    width: '200px',
    height: '300px',
  },
  lg: {
    width: '300px',
    height: '500px',
  },
};

export const CardImage = ({
  id,
  imageUrl,
  onSelectAsset,
  size,
}: {
  imageUrl?: string | null;
  id?: string | null;
  onSelectAsset?: (_id: string) => void;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const { isOpen, onOpen } = useDisclosure();

  const onClick = useCallback(() => {
    if (id && onSelectAsset) {
      onSelectAsset(id);
    }
  }, [id, onSelectAsset]);

  return (
    <Box width={{ base: '200px', lg: '300px' }} height={{ base: '350px', lg: '500px' }} {...(size && sizes[size])}>
      <ScaleFade in={isOpen}>
        {imageUrl && <Image maxWidth="100%" cursor="pointer" onClick={onClick} onLoad={onOpen} src={imageUrl} />}
      </ScaleFade>
    </Box>
  );
};
