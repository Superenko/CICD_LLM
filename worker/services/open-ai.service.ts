import type {
  ChatCompletionMessage,
  ChatCompletionsResponse,
  OpenAICredentials
} from '@/types/open-ai';

import { handleServiceError } from '@/utils/api';
import { ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT, buildErrorLogsAnalysisPrompt } from '@/utils/prompts';

const OPENAI_API_BASE_URL = 'https://api.openai.com/v1';
const OPENAI_MODEL = 'gpt-4o-mini';
const OPENAI_TEMPERATURE = 0.1;
const MAX_LOGS_CHARS = 12000;

export class OpenAIService {
  constructor(private readonly env: Env) {}

  public async analyzeLogs(logs: string[]) {
    try {
      const { apiKey } = await this.getOpenAICredentials();
      const formattedLogs = this.formatLogs(logs);

      const response = await this.fetchChatCompletions(apiKey, {
        model: OPENAI_MODEL,
        temperature: OPENAI_TEMPERATURE,
        messages: [
          {
            role: 'system',
            content: ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: buildErrorLogsAnalysisPrompt(formattedLogs)
          }
        ]
      });

      if (!response.ok) return null;

      const data = await response.json<ChatCompletionsResponse>();
      const message = data?.choices?.[0]?.message?.content?.trim();

      return message;
    } catch (e) {
      handleServiceError(e, 'An unknown error occurred while summarizing error logs.');
    }
  }

  private async getOpenAICredentials(): Promise<OpenAICredentials> {
    const apiKey = await this.env.OPENAI_API_KEY?.get();

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured.');
    }

    return { apiKey };
  }

  private formatLogs(logs: string[]): string {
    if (logs.length === 0) return '';

    const formattedLogs = logs.join('\n');

    if (formattedLogs.length > MAX_LOGS_CHARS) {
      return formattedLogs.slice(-MAX_LOGS_CHARS);
    }

    return formattedLogs;
  }

  private buildApiUrl(endpoint: string): string {
    return `${OPENAI_API_BASE_URL}/${endpoint}`;
  }

  private buildDefaultHeaders(apiKey: string): HeadersInit {
    return { Authorization: `Bearer ${apiKey}` };
  }

  private async fetchChatCompletions(
    apiKey: string,
    body: {
      model: string;
      temperature: number;
      messages: ChatCompletionMessage[];
    }
  ): Promise<Response> {
    const url = this.buildApiUrl('chat/completions');
    const defaultHeaders = this.buildDefaultHeaders(apiKey);

    return fetch(url, {
      method: 'POST',
      headers: { ...defaultHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }
}
