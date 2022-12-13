/* eslint-disable unicorn/filename-case */
import { HandlerEvent, HandlerContext, BackgroundHandler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import FormData from 'form-data';
import path from 'node:path';
import sharp from 'sharp';

const GREETING_CARD_SKU = 'CLASSIC-GRE-FEDR-7X5-BLA';
const SHIPPING_METHOD = 'Standard';
const HANDWRYTTEN_BASE_CARD_ID = '69556';

const handler: BackgroundHandler = async (event: HandlerEvent, _context: HandlerContext) => {
  const webhookData = JSON.parse(event.body || '');
  const { orderId } = event.queryStringParameters || {};

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: order } = await client.from('orders').select('*').eq('id', orderId).single();

  const output = webhookData.output;
  const res = await axios({ url: output, method: 'GET', responseType: 'arraybuffer' });

  if (order.product === 'greeting_card') {
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
  } else if (order.product === 'handwritten') {
    const formData = new FormData();
    formData.append('type', 'cover');
    formData.append('file', res.data, { filename: 'cover.png', contentType: 'image/png' });

    try {
      const uploadRes = await axios.post(
        `https://api2.handwrytten.com/api/v1/user/cards/uploadCustomLogo?uid=${process.env.HANDWRYTTEN_API_KEY}`,
        formData
      );

      const coverId = uploadRes.data.id;

      const cardRes = await axios.post(
        `https://api2.handwrytten.com/api/v1/user/cards/createCustomCard?uid=${process.env.HANDWRYTTEN_API_KEY}`,
        {
          id: null,
          insideImage: null,
          card_id: HANDWRYTTEN_BASE_CARD_ID,
          name: order.id,
          cover_id: coverId,
          cover_size_percent: 100,
          coverSrc: webhookData.output,
          type: 'text',
          header_text: '',
          header_align: 'center',
          header_font: 'Open Sans',
          header_font_size: 48,
          footerLogoSrc: 'https://www.elations.store/images/card-back.png',
          footer_logo_size_percent: 150,
          footerType: 'logo',
          footer_text: '',
          footer_font_size: 48,
          footer_align: 'center',
          footer_font: 'Open Sans',
          logo_id: null,
          logo_size_percent: 100,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const cardId = cardRes.data.card_id;

      const orderRes = await axios.post(
        `https://api2.handwrytten.com/api/v1/user/orders/singleStepOrder?uid=${process.env.HANDWRYTTEN_API_KEY}`,
        {
          login: 'carlos+handwrytten@carlosdp.xyz',
          password: 'JCp}vZs+7a)dA#p0>>HN$vMxTw+<5[*r',
          card_id: cardId,
          message: order.message,
          font_label: 'Chill Charity',
          credit_card_id: process.env.HANDWRYTTEN_CREDIT_CARD_ID,
          recipient_name: order.name,
          recipient_address1: order.line1,
          recipient_address2: order.line2,
          recipient_city: order.city,
          recipient_state: order.state,
          recipient_zip: order.postal_code,
          recipient_country: order.country,
          sender_name: 'Elations',
          sender_address1: '9450 SW Gemini Dr PMB 95510',
          sender_city: 'Beaverton',
          sender_state: 'Oregon',
          sender_zip: '97008',
          sender_country: 'United States',
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      await client.from('orders').update({ prodigi_order_id: orderRes.data.order_id }).eq('id', orderId);

      // eslint-disable-next-line no-console
      console.log(`Created print job for ${orderId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      console.error(JSON.stringify(error.response?.data));
      throw new Error('could not create print job');
    }
  }
};

export { handler };
