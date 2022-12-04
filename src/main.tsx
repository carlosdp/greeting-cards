import { ChakraProvider, ColorModeScript, GlobalStyle } from '@chakra-ui/react';
import { createClient } from '@supabase/supabase-js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as SupabaseProvider } from 'react-supabase';

import App from './App';
import { LocalUserProvider } from './LocalUserProvider';
import { theme } from './theme';

const supabaseClient = createClient(
  import.meta.env.SUPABASE_URL ?? 'http://localhost:54321',
  import.meta.env.SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <GlobalStyle />
        <SupabaseProvider value={supabaseClient}>
          <LocalUserProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </LocalUserProvider>
        </SupabaseProvider>
      </ChakraProvider>
    </React.StrictMode>
  </>
);
