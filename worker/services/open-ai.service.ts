import { handleServiceError } from '@/utils/api';
import { ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT, buildErrorLogsAnalysisPrompt } from '@/utils/prompts';
import { GithubJobErrorLine } from '@/types/github';

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.5-flash-lite';
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

  public async analyzeLogs(logs: GithubJobErrorLine[]) {
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
      let message = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!message) return null;

      // Clean up markdown formatting if Gemini still included it despite prompt instructions
      if (message.startsWith('```json')) {
        message = message.substring(7);
      }
      if (message.startsWith('```')) {
        message = message.substring(3);
      }
      if (message.endsWith('```')) {
        message = message.substring(0, message.length - 3);
      }
      
      message = message.trim();

      try {
        const parsed = JSON.parse(message);
        return {
          category: parsed.category || 'Unknown',
          severity: parsed.severity ?? undefined,
          root_cause: parsed.root_cause ?? undefined,
          solution: parsed.solution || message,
          actionable_commands: Array.isArray(parsed.actionable_commands) ? parsed.actionable_commands : undefined
        };
      } catch (e) {
        console.error('[GeminiService] Failed to parse JSON response:', message);
        return { category: 'Unknown', solution: message };
      }
    } catch (e) {
      handleServiceError(e, 'An unknown error occurred while summarizing error logs.');
    }
  }

  private formatLogs(logs: GithubJobErrorLine[]): string {
    if (logs.length === 0) return '[]';

    const formattedLogs = JSON.stringify(logs, null, 2);

    if (formattedLogs.length > MAX_LOGS_CHARS) {
      // If it's too long, maybe just truncate the string.
      // But since it's JSON, truncating string might break JSON format.
      // Alternatively, we could slice the array before stringifying.
      // Let's slice the array to the last N elements and try stringifying again, but for now we'll just truncate the string and let the LLM handle broken JSON if it happens.
      // Better approach: limit the number of logs sent to fit within chars.
      let result = [];
      let currentLength = 0;
      for (let i = logs.length - 1; i >= 0; i--) {
        const itemStr = JSON.stringify(logs[i], null, 2);
        if (currentLength + itemStr.length < MAX_LOGS_CHARS) {
          result.unshift(logs[i]);
          currentLength += itemStr.length;
        } else {
          break;
        }
      }
      return JSON.stringify(result, null, 2);
    }

    return formattedLogs;
  }
}
