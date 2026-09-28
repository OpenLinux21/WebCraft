import { describe, expect, it, vi } from 'vitest';
import { buildAssistantMessages, parseChallengeReply } from './prompt';
import { redactSecrets } from './redact';
import { loadAIConfig, parseAIConfig, saveAIConfig } from './settings';
import { buildChatCompletionBody, buildChatCompletionUrl, buildRequestHeaders } from './openai';
import { buildOllamaChatBody, buildOllamaChatUrl } from './ollama';
import type { AIConfig } from './types';

const CONFIG: AIConfig = {
  enabled: true,
  provider: 'openai-compatible',
  baseUrl: 'https://api.example.com/v1',
  model: 'test-model',
  apiKey: 'sk-secret-key-123456',
  customHeaders: { 'X-Custom': 'yes' },
  temperature: 0.5,
  maxTokens: 512,
};

describe('prompt building', () => {
  it('composes system and user messages with lesson and code context', () => {
    const [system, user] = buildAssistantMessages({
      mode: 'hint',
      locale: 'en',
      level: 'beginner',
      lesson: { title: 'Boxes', objectives: ['Understand padding'], task: 'Add padding' },
      code: { html: '<div></div>', css: '', js: '' },
      consoleLines: [{ level: 'error', text: 'x is not defined' }],
      question: 'Why does it fail?',
    });
    expect(system?.role).toBe('system');
    expect(system?.content).toContain('Boxes');
    expect(system?.content).toContain('<div></div>');
    expect(system?.content).toContain('[error] x is not defined');
    expect(user?.content).toContain('ONE small nudge');
    expect(user?.content).toContain('Why does it fail?');
  });

  it('localizes prompts by locale', () => {
    const [, user] = buildAssistantMessages({ mode: 'hint', locale: 'zh-CN', level: 'beginner' });
    expect(user?.content).toContain('提示');
  });

  it('free mode with a question sends the question as user content', () => {
    const [, user] = buildAssistantMessages({
      mode: 'free',
      locale: 'en',
      level: 'beginner',
      question: 'What is a div?',
    });
    expect(user?.content).toBe('What is a div?');
  });
});

describe('parseChallengeReply', () => {
  it('extracts JSON wrapped in prose', () => {
    const reply =
      'Here you go:\n```json\n{"title":"Cards","task":"Build cards","difficulty":"intermediate"}\n```';
    expect(parseChallengeReply(reply)).toEqual({
      title: 'Cards',
      task: 'Build cards',
      difficulty: 'intermediate',
    });
  });

  it('returns null for non-JSON replies', () => {
    expect(parseChallengeReply('no json here')).toBeNull();
    expect(parseChallengeReply('{"title":3}')).toBeNull();
  });
});

describe('redactSecrets', () => {
  it('removes every occurrence of the secret', () => {
    const text = 'Authorization: Bearer sk-secret-key-123456 failed';
    expect(redactSecrets(text, [CONFIG.apiKey])).toBe('Authorization: Bearer *** failed');
  });

  it('ignores short or undefined secrets', () => {
    expect(redactSecrets('abc abc', ['ab', undefined])).toBe('abc abc');
  });
});

describe('request builders', () => {
  it('builds the chat completions URL', () => {
    expect(buildChatCompletionUrl('https://api.example.com/v1/')).toBe(
      'https://api.example.com/v1/chat/completions',
    );
    expect(buildChatCompletionUrl('https://api.example.com/v1/chat/completions')).toBe(
      'https://api.example.com/v1/chat/completions',
    );
  });

  it('merges auth and custom headers', () => {
    expect(buildRequestHeaders(CONFIG)).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer sk-secret-key-123456',
      'X-Custom': 'yes',
    });
    expect(buildRequestHeaders({ ...CONFIG, apiKey: '' })['Authorization']).toBeUndefined();
  });

  it('builds the completion body with optional fields', () => {
    expect(buildChatCompletionBody(CONFIG, [{ role: 'user', content: 'hi' }])).toEqual({
      model: 'test-model',
      messages: [{ role: 'user', content: 'hi' }],
      stream: true,
      temperature: 0.5,
      max_tokens: 512,
    });
    const bodyWithoutLimits = buildChatCompletionBody(
      { ...CONFIG, maxTokens: null, temperature: 1 },
      [],
    ) as Record<string, unknown>;
    expect(bodyWithoutLimits['max_tokens']).toBeUndefined();
  });

  it('builds ollama URLs and bodies', () => {
    expect(buildOllamaChatUrl('http://localhost:11434/')).toBe('http://localhost:11434/api/chat');
    const body = buildOllamaChatBody(CONFIG, [{ role: 'user', content: 'hi' }]) as Record<
      string,
      unknown
    >;
    expect(body['model']).toBe('test-model');
    expect(body['stream']).toBe(true);
    expect(body['options']).toEqual({ temperature: 0.5, num_predict: 512 });
  });
});

describe('ai settings', () => {
  it('validates stored configs', () => {
    expect(parseAIConfig(CONFIG)).toEqual(CONFIG);
    expect(parseAIConfig({ ...CONFIG, provider: 'nope' })).toBeNull();
    expect(parseAIConfig({ ...CONFIG, baseUrl: '' })).toBeNull();
    expect(parseAIConfig({ ...CONFIG, model: 42 })).toBeNull();
    expect(parseAIConfig('x')).toBeNull();
  });

  it('round-trips through localStorage', () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
    });
    saveAIConfig(CONFIG);
    expect(loadAIConfig()).toEqual(CONFIG);
    vi.unstubAllGlobals();
  });
});
