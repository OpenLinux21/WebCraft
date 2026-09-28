import { OpenAICompatibleProvider } from './openai';
import { OllamaProvider } from './ollama';
import type { AIProvider, AIProviderId } from './types';

const PROVIDERS: Record<AIProviderId, () => AIProvider> = {
  'openai-compatible': () => new OpenAICompatibleProvider(),
  ollama: () => new OllamaProvider(),
};

export function getAIProvider(id: AIProviderId): AIProvider {
  return (PROVIDERS[id] ?? PROVIDERS['openai-compatible'])();
}

/** Providers are stateless; a fresh instance per session is fine. */
export function createAIProviderRegistry(): Record<AIProviderId, AIProvider> {
  return {
    'openai-compatible': new OpenAICompatibleProvider(),
    ollama: new OllamaProvider(),
  };
}
