import {
  Alert,
  AlertIcon,
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  Image,
  Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useClient } from 'react-supabase';

import { ScreenContainer } from './ScreenContainer';

const Meter = ({ numPhotos }: { numPhotos: number }) => {
  let progress = 0;
  let text = 'Upload some photos';
  let color = 'red';

  if (numPhotos > 20) {
    progress = 100;
    text = 'Awesome! That should be enough photos';
    color = 'green';
  } else if (numPhotos > 10) {
    progress = 70;
    text = 'Great! You can get better results if you have more photos';
    color = 'green';
  } else if (numPhotos > 5) {
    progress = 40;
    text = 'Upload more photos for best results';
  } else if (numPhotos > 0) {
    progress = 10;
    text = 'Good Start, We need at least 10 photos to create your cards';
  }

  return (
    <Box alignItems="center" flexDirection="row" gap="8px" display="flex">
      <CircularProgress color={color} size="42px" value={progress}>
        <CircularProgressLabel>{numPhotos}/10</CircularProgressLabel>
      </CircularProgress>
      <Text>{text}</Text>
    </Box>
  );
};

type FileWithData = File & {
  preview: string;
};

export const TrainSetUpload = () => {
  const [files, setFiles] = useState<FileWithData[]>([]);
  const [loading, setLoading] = useState(false);
  const client = useClient();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(currentFiles => [
      ...currentFiles,
      ...acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop,
  });

  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const onSubmit = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch('/.netlify/functions/create-generation-order', {
        method: 'POST',
        body: '{}',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to create generation order');
      }

      const resData = await res.json();

      const orderId = resData.id;

      for (const [i, file] of files.entries()) {
        const { error } = await client.storage.from('train-sets').upload(`${orderId}/${i}.${file.name}`, file, {});

        if (error) {
          throw error;
        }
      }

      window.location = resData.checkoutUrl;
    } finally {
      setLoading(false);
    }
  }, [files, client]);

  return (
    <ScreenContainer>
      <Box alignItems="center" flexDirection="column" gap="18px" display="flex">
        <Heading>Upload some photos to create your custom designs</Heading>
        <Box flexDirection="column" gap="5px" display="flex" maxWidth="500px">
          <Text>✅ For best results, we need 10-20 photos of the person</Text>
          <Text>✅ Only one person should be in the photos</Text>
          <Text>✅ A variety of facial expressions and angles will make the results better</Text>
          <Text>ℹ️ Processing time can take up to 2 days at current capacity</Text>
          <Text>ℹ️ We'll email you when your cards are ready to review</Text>
          <Text>ℹ️ Included in this order is 1 free greeting card we'll mail for you</Text>
        </Box>
        <Box alignItems="center" flexDirection="column" gap="18px" display="flex" width="100%">
          <Box
            {...getRootProps()}
            alignItems="center"
            justifyContent="center"
            display="flex"
            width="100%"
            maxWidth="500px"
            padding="50px"
            borderWidth="1px"
            borderStyle="dashed"
            borderColor="gray.300"
            borderRadius="8px"
            _hover={{
              borderColor: 'gray.700',
            }}
            cursor="pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Text>Drop the images here...</Text>
            ) : (
              <>
                <Text display={{ base: 'none', lg: 'block' }}>Drop some images here, or click to select images</Text>
                <Text display={{ base: 'block', lg: 'none' }}>Select Images</Text>
              </>
            )}
          </Box>
          <Box flexDirection="column" gap="12px" display="flex" width="100%" maxWidth="500px" minHeight="200px">
            <Box flexDirection="row" gap="12px" display="flex">
              <Meter numPhotos={files.length} />
            </Box>
            {files.length > 0 ? (
              <Box flexWrap="wrap" flexDirection="row" gap="8px" display="flex">
                {files.map(file => (
                  <Image
                    key={file.name}
                    maxWidth="50px"
                    onLoad={() => URL.revokeObjectURL(file.preview)}
                    src={file.preview}
                  />
                ))}
              </Box>
            ) : (
              <Box alignItems="center" justifyContent="center" flex={1} display="flex">
                <Text color="blackAlpha.500">No photos uploaded yet</Text>
              </Box>
            )}
          </Box>
        </Box>
        <Box>
          <Button isLoading={loading} onClick={onSubmit}>
            Create my cards
          </Button>
        </Box>
        <Alert status="info">
          <AlertIcon />
          This is new technology, and sometimes results don't come out great. We'll do our best, but by ordering, you
          accept the risk that results may vary!
        </Alert>
      </Box>
    </ScreenContainer>
  );
};
