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

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const sig = event.headers['stripe-signature'];

  let evt;

  try {
    evt = stripe.webhooks.constructEvent(event.body!, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return {
      statusCode: 400,
    };
  }

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  if (evt.type === 'checkout.session.completed') {
    const session = evt.data.object;
    const orderId = session.client_reference_id;

    await client.from('orders').update({ stripe_payment_intent_id: session.payment_intent }).eq('id', orderId);
  }

  return {
    statusCode: 200,
  };
};

export { handler };
