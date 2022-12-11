/* eslint-disable unicorn/filename-case */
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const { persona_id, interest_ids } = JSON.parse(event.body || '');

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: request, error } = await client
    .from('asset_generation_requests')
    .insert({ persona_id, description: 'old', style: 'christmas', expected_asset_count: 20 })
    .select()
    .single();

  if (error || !request) {
    console.error(error);

    return {
      statusCode: 500,
      body: 'could not create request',
    };
  }

  const { error: interestsError } = await client
    .from('asset_generation_request_interests')
    .insert(interest_ids.map((id: string) => ({ asset_generation_request_id: request.id, interest_id: id })));

  if (interestsError) {
    console.error(error);

    return {
      statusCode: 500,
      body: 'could not create request',
    };
  }

  await axios.post(`${process.env.URL}/.netlify/functions/request-generations-background`, {
    assetGenerationRequestId: request.id,
  });

  return {
    statusCode: 201,
    body: JSON.stringify(request),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export { handler };
