/* eslint-disable unicorn/filename-case */
import { BackgroundHandler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import sharp from 'sharp';

const handler: BackgroundHandler = async (event: HandlerEvent, _context: HandlerContext) => {
  const webhookData = JSON.parse(event.body || '');
  const { assetGenerationRequestId } = event.queryStringParameters || {};

  if (!assetGenerationRequestId) {
    throw new Error('assetGenerationRequestId is required');
  }

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  for (let i = 0; i < webhookData.output.length; i++) {
    const output = webhookData.output[i];

    const res = await axios({ url: output, method: 'GET', responseType: 'stream' });

    const targetWidth = 768 * 0.709_738_717_3;

    const image = await sharp(res.data)
      .extract({
        left: 0,
        top: 0,
        width: Math.floor(targetWidth),
        height: 768,
      })
      .png()
      .toBuffer();

    const storageKey = `greeting-cards/${assetGenerationRequestId}/${webhookData.id}-${i}.png`;

    // eslint-disable-next-line no-console
    console.log(`Storing ${storageKey}`);

    await client.storage.from('assets').upload(storageKey, image, {
      contentType: 'image/png',
    });

    await client.from('assets').insert({
      asset_generation_request_id: assetGenerationRequestId,
      storage_key: storageKey,
      prompt: webhookData.input.prompt,
    });
  }
};

export { handler };
