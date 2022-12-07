import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

export const theme = extendTheme(
  {
    config: {
      initialColorMode: 'light',
    },
    styles: {
      global: {
        'html, body': {
          fontFamily: 'Inter, sans-serif',
          backgroundColor: 'brandBackground',
          transition: 'background-color 0.2s linear',
        },
      },
    },
    semanticTokens: {
      colors: {
        brandBackground: {
          default: 'white',
          _dark: 'purple.500',
        },
        brand: {
          default: 'purple.500',
          _dark: 'white',
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
