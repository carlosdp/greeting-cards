/* eslint-disable unicorn/filename-case */
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ??
    'sk_test_51IUzWoIsiWplaJ875iwgsvZcfAaSNE1KGZVvJ8KdO0xF350FRHTvIRsDuaICGaAuOPp8EdgeYKEXOTLLhTJYRJRy00TjxR1gYt',
  {
    apiVersion: '2022-11-15',
  }
);

const BASE_URL = process.env.URL ?? 'http://localhost:3000';
const GENERATION_PRICE_ID = process.env.GENERATION_PRICE_ID ?? 'price_1MFhJuIsiWplaJ87l7f08ldS';

const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: createdOrder, error } = await client.from('generation_orders').insert({}).select().single();

  if (error || !createdOrder) {
    throw new Error('could not create order');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: createdOrder.id,
    customer_creation: 'always',
    line_items: [
      {
        price: GENERATION_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${BASE_URL}/generation/success`,
    cancel_url: `${BASE_URL}/`,
  });

  const data = {
    id: createdOrder.id,
    checkoutUrl: session.url,
  };

  return {
    statusCode: 201,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export { handler };
