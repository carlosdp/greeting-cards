/* eslint-disable unicorn/filename-case */
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const INSTRUCTION_TEMPLATE =
  'I am writing a greeting card for {persona} for {occasion}. I need to write a note to put inside the card that they will love. Some of their interests include: {interests}.\nThe card should be signed as from [Name]. A good example of a {style} to write in the card is:';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const { asset_id, message_style_id } = JSON.parse(event.body || '');

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: asset } = await client.from('assets').select('asset_generation_request_id').eq('id', asset_id).single();

  if (!asset) {
    return {
      statusCode: 400,
      body: 'asset not found',
    };
  }

  const { data: assetGenerationRequest } = await client
    .from('asset_generation_requests')
    .select('persona_id, occasion_id')
    .eq('id', asset.asset_generation_request_id)
    .single();

  if (!assetGenerationRequest) {
    return {
      statusCode: 400,
      body: 'asset generation request not found',
    };
  }

  const { data: persona } = await client
    .from('personas')
    .select('*')
    .eq('id', assetGenerationRequest.persona_id)
    .single();

  if (!persona) {
    return {
      statusCode: 400,
      body: 'persona not found',
    };
  }

  const { data: occasion } = await client
    .from('occasions')
    .select('prompt')
    .eq('id', assetGenerationRequest.occasion_id)
    .single();

  if (!occasion) {
    throw new Error('occasion not found');
  }

  const { data: interest_ids } = await client
    .from('asset_generation_request_interests')
    .select('interest_id')
    .eq('asset_generation_request_id', asset.asset_generation_request_id);

  if (!interest_ids) {
    throw new Error('interests not found');
  }

  const { data: interests } = await client
    .from('interests')
    .select('*')
    .in(
      'id',
      interest_ids.map(({ interest_id }) => interest_id)
    );

  if (!interests) {
    throw new Error('interests not found');
  }

  const interestPrompt = interests.map(({ prompt }) => prompt).join(', ');

  const { data: messageStyle } = await client.from('message_styles').select('*').eq('id', message_style_id).single();

  if (!messageStyle) {
    return {
      statusCode: 400,
      body: 'message style not found',
    };
  }

  const stylePrompt = messageStyle.prompt;

  const res = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      model: 'text-davinci-003',
      prompt: INSTRUCTION_TEMPLATE.replace('{occasion}', occasion.prompt)
        .replace('{persona}', persona.prompt)
        .replace('{interests}', interestPrompt)
        .replace('{style}', stylePrompt),
      max_tokens: 256,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  if (res.status !== 200) {
    return {
      statusCode: 500,
      body: 'could not generate instructions',
    };
  }

  const message = res.data.choices[0].text.trim();

  return {
    statusCode: 200,
    body: JSON.stringify({ message }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export { handler };
