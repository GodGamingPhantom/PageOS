import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins = [];

if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'YOUR_GOOGLE_AI_KEY_HERE') {
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.0-flash',
});
