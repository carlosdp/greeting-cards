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
const GREETING_CARD_PRICE_ID = process.env.GREETING_CARD_PRICE_ID ?? 'price_1MC5LyIsiWplaJ87HhTpaHOg';
const HANDWRITTEN_CARD_PRICE_ID = process.env.HANDWRITTEN_CARD_PRICE_ID ?? 'price_1MEg39IsiWplaJ87Ey7Mk9Kf';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const { order } = JSON.parse(event.body || '');

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: asset } = await client.from('assets').select('product').eq('id', order.asset_id).single();

  if (!asset) {
    return {
      statusCode: 400,
      body: 'could not find asset',
    };
  }

  const { data: createdOrder, error } = await client
    .from('orders')
    .insert({
      asset_id: order.asset_id,
      message: order.message,
      name: order.name,
      line1: order.line1,
      line2: order.line2,
      city: order.city,
      state: order.state,
      postal_code: order.postal_code,
      country: order.country,
      product: asset.product,
    })
    .select()
    .single();

  if (error || !order) {
    throw new Error('could not create order');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    client_reference_id: createdOrder.id,
    customer_creation: 'always',
    line_items: [
      {
        price: createdOrder.product === 'greeting_card' ? GREETING_CARD_PRICE_ID : HANDWRITTEN_CARD_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${BASE_URL}/assets/${order.asset_id}/checkout/success`,
    cancel_url: `${BASE_URL}/assets/${order.asset_id}/checkout`,
  });

  const data = {
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
