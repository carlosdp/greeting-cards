/* eslint-disable unicorn/filename-case */
import { BackgroundHandler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const INSTRUCTION_TEMPLATE =
  'I am designing a greeting card for {persona}. Some of her interests are: {interests}.\nThe cover cannot include any text, phrases, or lettering.\nWe need to make sure there is at least one element that makes it festive and match the occasion. {occasion}\nThe top five examples of designs for a great, unique, and personalized greeting card cover for this person, in a numbered list, are:';
const PROMPT_TEMPlATE = '{}, artstation, hd, dramatic lighting, cartoon, illustration, detailed';
const NEGATIVE_PROMPT =
  'ugly, asymmetrical, gross, wrong, missing limbs, text, words, phrases, photo, watermark, missing eye, creepy, weird, disfigured';

const handler: BackgroundHandler = async (event: HandlerEvent, _context: HandlerContext) => {
  const { assetGenerationRequestId, cardType } = JSON.parse(event.body || '');

  if (!assetGenerationRequestId) {
    throw new Error('assetGenerationRequestId is required');
  }

  const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: assetGenerationRequest, error } = await client
    .from('asset_generation_requests')
    .select('*')
    .eq('id', assetGenerationRequestId)
    .single();

  if (error) {
    throw new Error('could not load asset generation request');
  }

  if (!assetGenerationRequest) {
    throw new Error('asset generation request not found');
  }

  const { data: occasion } = await client
    .from('occasions')
    .select('prompt')
    .eq('id', assetGenerationRequest.occasion_id)
    .single();

  if (!occasion) {
    throw new Error('occasion not found');
  }

  const { data: persona } = await client
    .from('personas')
    .select('*')
    .eq('id', assetGenerationRequest.persona_id)
    .single();

  if (!persona) {
    throw new Error('persona not found');
  }

  const { data: interest_ids } = await client
    .from('asset_generation_request_interests')
    .select('interest_id')
    .eq('asset_generation_request_id', assetGenerationRequestId);

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

  const res = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      model: 'text-davinci-003',
      prompt: INSTRUCTION_TEMPLATE.replace('{occasion}', occasion.prompt)
        .replace('{persona}', persona.prompt)
        .replace('{interests}', interestPrompt),
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
    throw new Error('could not generate instructions');
  }

  const promptInsertsRaw = res.data.choices[0].text;

  // capture elements of a numbered list using regex, elements may or may not have a newline at the end
  const promptInserts = promptInsertsRaw.match(/(?<=\d\.\s)(.*?)(?=\n|$)/g);

  const prompts = promptInserts.map(promptInsert =>
    PROMPT_TEMPlATE.replace('{}', promptInsert.charAt(0).toLowerCase() + promptInsert.slice(1).replace('.', ''))
  );

  const resolution = cardType === 'greeting_card' ? { width: 576, height: 768 } : { width: 768, height: 576 };

  for (let i = 0; i < assetGenerationRequest.expected_asset_count / 5; i++) {
    for (const prompt of prompts) {
      let tries = 0;

      // eslint-disable-next-line no-console
      console.log(`Generating image for ${assetGenerationRequestId} with prompt: ${prompt}`);

      while (tries < 3) {
        const genRes = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: '0827b64897df7b6e8c04625167bbb275b9db0f14ab09e2454b9824141963c966',
            input: {
              prompt,
              negative_prompt: NEGATIVE_PROMPT,
              prompt_strength: 0.8,
              num_outputs: 2,
              num_inference_steps: 50,
              guidance_scale: 7.5,
              scheduler: 'K_EULER',
              ...resolution,
            },
            webhook_completed: `${process.env.URL}/.netlify/functions/complete-generation-background?assetGenerationRequestId=${assetGenerationRequestId}`,
          },
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
            },
          }
        );

        if (genRes.status === 429) {
          tries++;

          await new Promise(resolve => setTimeout(resolve, Math.random() * 10_000));

          continue;
        }

        if (genRes.status > 299) {
          throw new Error('could not generate image');
        }

        break;
      }

      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));
    }
  }

  // eslint-disable-next-line no-console
  console.log('Generations queued');
};

export { handler };
