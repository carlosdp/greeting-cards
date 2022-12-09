import { Box, Image, ScaleFade, useDisclosure } from '@chakra-ui/react';
import { useCallback } from 'react';

export const CardImage = ({
  id,
  imageUrl,
  onSelectAsset,
}: {
  imageUrl?: string | null;
  id?: string | null;
  onSelectAsset?: (_id: string) => void;
}) => {
  const { isOpen, onOpen } = useDisclosure();

  const onClick = useCallback(() => {
    if (id && onSelectAsset) {
      onSelectAsset(id);
    }
  }, [id, onSelectAsset]);

  return (
    <Box height="500px">
      <ScaleFade in={isOpen}>
        {imageUrl && <Image maxWidth="300px" cursor="pointer" onClick={onClick} onLoad={onOpen} src={imageUrl} />}
      </ScaleFade>
    </Box>
  );
};
