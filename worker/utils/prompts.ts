export const ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT =
  'You are an expert at identifying fatal errors in deployment logs. Your responses should specify the main fatal error and provide a concise, actionable solution in the form of a short paragraph. Do not use lists or bullet points. Be direct, practical, and avoid unnecessary details or explanations.';

export const buildErrorLogsAnalysisPrompt = (logs: string): string => {
  return `Please identify the main fatal error and provide a possible solution or steps to fix it, written as a brief paragraph. Be clear and concise, and ignore non-fatal or minor issues. Logs:\n\n\`\`\`\n${logs}\n\`\`\``;
};
