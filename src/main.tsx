import { ChakraProvider, GlobalStyle } from '@chakra-ui/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as SupabaseProvider } from 'react-supabase';

import App from './App';
import { LocalUserProvider } from './LocalUserProvider';
import { theme } from './theme';

const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:54321',
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

const stripe = loadStripe(
  import.meta.env.VITE_STRIPE_KEY ??
    'pk_test_51IUzWoIsiWplaJ87OSbE4TkSa1e2TDyDc0JwAUuFLUYoZXgPd7itIjFTT3WSdO2ljd3gObQd6g37VeALfUpEkW4y00Xa9TJl5K'
);

window.localStorage.setItem('chakra-ui-color-mode', 'light');

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <>
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <GlobalStyle />
        <SupabaseProvider value={supabaseClient}>
          <LocalUserProvider>
            <Elements stripe={stripe}>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </Elements>
          </LocalUserProvider>
        </SupabaseProvider>
      </ChakraProvider>
    </React.StrictMode>
  </>
);
