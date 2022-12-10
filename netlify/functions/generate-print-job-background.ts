/* eslint-disable unicorn/filename-case */
import { HandlerEvent, HandlerContext, BackgroundHandler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import path from 'node:path';
import sharp from 'sharp';

const GREETING_CARD_SKU = 'CLASSIC-GRE-FEDR-7X5-BLA';
const SHIPPING_METHOD = 'Standard';

const handler: BackgroundHandler = async (event: HandlerEvent, _context: HandlerContext) => {
  const webhookData = JSON.parse(event.body || '');
  const { orderId } = event.queryStringParameters || {};

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: order } = await client.from('orders').select('*').eq('id', orderId).single();

  const output = webhookData.output;
  const res = await axios({ url: output, method: 'GET', responseType: 'arraybuffer' });

  const printTemplate = await sharp(path.join(__dirname, '..', '..', 'greeting-card-7x5-template.png'))
    .composite([
      {
        input: res.data,
        top: 29,
        left: 1528,
      },
      {
        input: {
          text: {
            text: `<span foreground="black" line_height="2">${order.message}</span>`,
            font: 'Cutive',
            fontfile: path.join(__dirname, '..', '..', 'Cutive-Regular.ttf'),
            width: 1149,
            dpi: 200,
            rgba: true,
          },
        },
        top: 257,
        left: 4761,
      },
    ])
    .png()
    .withMetadata({ density: 300 })
    .toBuffer();

  const storageKey = `print-assets/${orderId}.png`;

  await client.storage.from('assets').upload(storageKey, printTemplate, {
    contentType: 'image/png',
  });

  await client.from('orders').update({ print_asset_key: storageKey }).eq('id', orderId);

  // eslint-disable-next-line no-console
  console.log(`Stored print template for ${orderId}`);

  const printAssetUrl = await client.storage.from('assets').createSignedUrl(storageKey, 60 * 60 * 24 * 7);

  try {
    // send off print job
    const printRes = await axios.post(
      `${process.env.PRODIGI_API_URL!}/v4.0/orders`,
      {
        callbackUrl: `${process.env.URL}/.netlify/functions/prodigi-update?orderId=${orderId}`,
        merchantReference: orderId,
        shippingMethod: SHIPPING_METHOD,
        idempotencyKey: orderId,
        recipient: {
          name: order.name,
          address: {
            line1: order.line1,
            line2: order.line2,
            postalOrZipCode: order.postal_code,
            townOrCity: order.city,
            stateOrCounty: order.state,
            countryCode: order.country,
          },
        },
        items: [
          {
            sku: GREETING_CARD_SKU,
            copies: 1,
            sizing: 'fillPrintArea',
            recipientCost: {
              amount: '10.00',
              currency: 'USD',
            },
            assets: [
              {
                printArea: 'default',
                url: printAssetUrl.data?.signedUrl,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': process.env.PRODIGI_API_KEY!,
        },
      }
    );

    if (printRes.status !== 200 || printRes.data.outcome.toLowerCase() !== 'created') {
      // eslint-disable-next-line no-console
      console.error(printRes.data);
      throw new Error('could not create print job');
    }

    await client.from('orders').update({ prodigi_order_id: printRes.data.order.id }).eq('id', orderId);

    // eslint-disable-next-line no-console
    console.log(`Created print job for ${orderId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    console.error(JSON.stringify(error.response?.data));
    throw new Error('could not create print job');
  }
};

export { handler };
