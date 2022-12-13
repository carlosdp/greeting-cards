/* eslint-disable unicorn/filename-case */
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
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

    const { data: order } = await client
      .from('orders')
      .update({ stripe_payment_intent_id: session.payment_intent })
      .eq('id', orderId)
      .select('*')
      .single();
    const { data: asset } = await client.from('assets').select('*').eq('id', order.asset_id).single();

    const coverImageUrl = await client.storage.from('assets').createSignedUrl(asset.storage_key, 60 * 60 * 12);

    const scale = order.product === 'greeting_card' ? 2105 / 768 : 2025 / 768;

    const res = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
        input: {
          image: coverImageUrl.data?.signedUrl,
          scale,
        },
        webhook_completed: `${process.env.URL}/.netlify/functions/generate-print-job-background?orderId=${orderId}`,
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        },
      }
    );

    if (res.status > 299) {
      throw new Error('Failed to create upscale job');
    }

    // eslint-disable-next-line no-console
    console.log(`Upscale job created for ${orderId}`);
  }

  return {
    statusCode: 200,
  };
};

export { handler };
