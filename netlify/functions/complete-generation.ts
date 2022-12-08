/* eslint-disable unicorn/filename-case */
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const webhookData = JSON.parse(event.body || '');
  const { assetGenerationRequestId } = event.queryStringParameters || {};

  if (!assetGenerationRequestId) {
    return {
      statusCode: 400,
    };
  }

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const res = await axios({ url: webhookData.output[0], method: 'GET', responseType: 'stream' });

  const storageKey = `greeting-cards/${assetGenerationRequestId}/${webhookData.id}.png`;

  await client.storage.from('assets').upload(storageKey, res.data, {
    contentType: 'image/png',
  });

  await client.from('assets').insert({
    asset_generation_request_id: assetGenerationRequestId,
    storage_key: storageKey,
    prompt: webhookData.input.prompt,
  });

  return {
    statusCode: 200,
  };
};

export { handler };
