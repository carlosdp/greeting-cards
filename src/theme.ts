import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

export const theme = extendTheme(
  {
    config: {
      initialColorMode: 'system',
    },
    styles: {
      global: {
        'html, body': {
          fontFamily: 'Inter, sans-serif',
        },
        body: {
          padding: '20px',
          paddingTop: 0,
        },
      },
    },
    textStyles: {
      brand: {
        fontSize: '24px',
        fontFamily: 'Oleo Script, sans-serif',
      },
    },
  },
  withDefaultColorScheme({ colorScheme: 'purple' })
);
