import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

export const theme = extendTheme(
  {
    config: {
      initialColorMode: 'light',
    },
    styles: {
      global: (props: { colorMode: 'light' | 'dark' }) => ({
        'html, body': {
          fontFamily: 'Inter, sans-serif',
          background: props.colorMode === 'dark' ? 'purple.500' : 'white',
          transition: 'background 0.2s linear',
        },
      }),
    },
    semanticTokens: {
      colors: {
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
