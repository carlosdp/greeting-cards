/* eslint-disable unicorn/filename-case */
import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const INSTRUCTION_TEMPLATE =
  'We are designing amazing greeting cards for {style}. Our client wants a greeting card designed, and had this to say about the recipient:\n\n"{description}"\n\nThe cover cannot include any text, phrases, or lettering.\n\nWe need to make sure there is at least one element that makes it festive and match the occasion. Here are some Christmas elements we could include: snow, christmas tree, reindeer, santa, santa hat, christmas stocking, tree ornament, christmas star, snowman.\n\nThe top two examples of designs for a great greeting card cover, in a numbered list, are:';
const PROMPT_TEMPlATE =
  '{}, pretty, bright, colorful, high quality, symmetrical, sharp focus, in the style of a greeting card cover drawing print';
const NEGATIVE_PROMPT =
  'ugly, asymmetrical, gross, wrong, missing limbs, text, words, phrases, photo, watermark, dreamstime';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const { assetGenerationRequestId } = JSON.parse(event.body || '');

  if (!assetGenerationRequestId) {
    return {
      statusCode: 400,
    };
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
    return {
      statusCode: 400,
      body: 'asset generation request not found',
    };
  }

  const res = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      model: 'text-davinci-003',
      prompt: INSTRUCTION_TEMPLATE.replace('{style}', assetGenerationRequest.style).replace(
        '{description}',
        assetGenerationRequest.description
      ),
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

  const prompts = promptInserts.map(promptInsert => PROMPT_TEMPlATE.replace('{}', promptInsert));

  for (const prompt of prompts) {
    let tries = 0;

    // eslint-disable-next-line
    console.log(`Generating image for ${assetGenerationRequestId} with prompt: ${prompt}`);

    while (tries < 3) {
      const genRes = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: '0827b64897df7b6e8c04625167bbb275b9db0f14ab09e2454b9824141963c966',
          input: {
            prompt,
            negative_prompt: NEGATIVE_PROMPT,
            width: 576,
            height: 768,
            prompt_strength: 0.8,
            num_outputs: 1,
            num_inference_steps: 50,
            guidance_scale: 7.5,
            scheduler: 'K_EULER',
          },
          webhook_completed: `${process.env.URL}/.netlify/functions/complete-generation?assetGenerationRequestId=${assetGenerationRequestId}`,
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
  }

  return {
    statusCode: 200,
  };
};

export { handler };
