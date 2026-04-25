import { handleServiceError } from '@/utils/api';
import { ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT, buildErrorLogsAnalysisPrompt } from '@/utils/prompts';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.0-flash-lite';
const GEMINI_TEMPERATURE = 0.1;
const MAX_LOGS_CHARS = 12000;

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text: string }[];
    };
  }[];
}

export class OpenAIService {
  constructor(private readonly env: Env) {}

  public async analyzeLogs(logs: string[]) {
    try {
      const rawKey = this.env.OPENAI_API_KEY;
      const apiKey = rawKey
        ? typeof (rawKey as any).get === 'function'
          ? await (rawKey as any).get()
          : (rawKey as unknown as string)
        : undefined;

      if (!apiKey) {
        throw new Error('OpenAI API key is not configured.');
      }

      const formattedLogs = this.formatLogs(logs);

      const url = `${GEMINI_API_BASE_URL}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

      const body = {
        systemInstruction: {
          parts: [{ text: ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT }]
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: buildErrorLogsAnalysisPrompt(formattedLogs) }]
          }
        ],
        generationConfig: {
          temperature: GEMINI_TEMPERATURE
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error('[GeminiService] API error:', response.status, await response.text());
        return null;
      }

      const data = await response.json<GeminiResponse>();
      const message = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      return message ?? null;
    } catch (e) {
      handleServiceError(e, 'An unknown error occurred while summarizing error logs.');
    }
  }

  private formatLogs(logs: string[]): string {
    if (logs.length === 0) return '';

    const formattedLogs = logs.join('\n');

    if (formattedLogs.length > MAX_LOGS_CHARS) {
      return formattedLogs.slice(-MAX_LOGS_CHARS);
    }

    return formattedLogs;
  }
}
