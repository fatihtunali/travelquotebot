import Anthropic from '@anthropic-ai/sdk';

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set in environment variables');
    return null;
  }

  console.log('Anthropic API key loaded successfully');
  return new Anthropic({ apiKey });
}
