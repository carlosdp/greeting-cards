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

  const { data: assetGenerationRequest } = await client
    .from('asset_generation_requests')
    .select('*')
    .eq('id', assetGenerationRequestId)
    .single();

  if (!assetGenerationRequest) {
    throw new Error('asset generation request not found is required');
  }

  for (let i = 0; i < webhookData.output.length; i++) {
    const output = webhookData.output[i];

    const res = await axios({ url: output, method: 'GET', responseType: 'arraybuffer' });

    const width = assetGenerationRequest.product === 'handwritten' ? 768 : 576;
    const height = assetGenerationRequest.product === 'handwritten' ? 576 : 768;
    const targetWidth = assetGenerationRequest.product === 'handwritten' ? 768 : Math.floor(768 * 0.709_738_717_3);
    const targetHeight = assetGenerationRequest.product === 'handwritten' ? Math.floor(768 * 0.703_703_703_7) : 768;
    const widthDiff = width - targetWidth;
    const heightDiff = height - targetHeight;

    const image = await sharp(res.data)
      .extract({
        left: Math.floor(widthDiff / 2),
        top: Math.floor(heightDiff / 2),
        width: targetWidth,
        height: targetHeight,
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
      product: assetGenerationRequest.product,
    });
  }
};

export { handler };
