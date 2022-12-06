// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@10.13.0?target=deno&deno-std=0.132.0&no-check';

const stripe = Stripe(
  Deno.env.get('STRIPE_SECRET_KEY') ??
    'sk_test_51IUzWoIsiWplaJ875iwgsvZcfAaSNE1KGZVvJ8KdO0xF350FRHTvIRsDuaICGaAuOPp8EdgeYKEXOTLLhTJYRJRy00TjxR1gYt',
  {
    // This is needed to use the Fetch API rather than relying on the Node http
    // package.
    httpClient: Stripe.createFetchHttpClient(),
    apiVersion: '2022-08-01',
  }
);

const GREETING_CARD_PRICE_ID = Deno.env.get('GREETING_CARD_PRICE_ID') ?? 'price_1MC5LyIsiWplaJ87HhTpaHOg';

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const { orderId } = await req.json();

  const client = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');

  const { data: order, error } = await client.from('orders').select('*').eq('id', orderId).single();

  if (error) {
    throw new Error('could not load order');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: orderId,
    line_items: [
      {
        price: GREETING_CARD_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `http://localhost:3000/assets/${order.asset_id}/checkout/success`,
    cancel_url: `http://localhost:3000/assets/${order.asset_id}/checkout`,
  });

  const data = {
    checkoutUrl: session.url,
  };

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
