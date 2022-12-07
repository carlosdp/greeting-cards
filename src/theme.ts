import { extendTheme, withDefaultColorScheme, defineStyleConfig } from '@chakra-ui/react';

const Button = defineStyleConfig({
  variants: {
    primary: {
      color: 'purple.500',
      backgroundColor: 'purple.100',
      _hover: {
        backgroundColor: 'purple.200',
      },
      _active: {
        backgroundColor: 'purple.300',
      },
    },
  },
  defaultProps: {
    variant: 'primary',
  },
});

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
    components: {
      Button,
    },
  },
  withDefaultColorScheme({ colorScheme: 'purple' })
);
