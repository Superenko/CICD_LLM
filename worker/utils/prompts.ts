export const ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT =
  'You are an expert at identifying fatal errors in deployment logs. Your responses MUST be in strictly valid JSON format. Do not add markdown blocks like ```json around the response, just return the raw JSON object. The JSON should have two fields: "category" (a short string categorizing the error, e.g., "Dependency Issue", "Syntax Error", "Timeout", "Config Error", "Network Issue", "Authentication Error", or "Unknown") and "solution" (a concise, actionable solution in the form of a short paragraph). Be direct, practical, and avoid unnecessary details.';

export const buildErrorLogsAnalysisPrompt = (logs: string): string => {
  return `Please analyze the following deployment error logs. Identify the main fatal error, categorize it, and provide a possible solution or steps to fix it. Return ONLY a valid JSON object with "category" and "solution" fields.\n\nLogs:\n\n\`\`\`\n${logs}\n\`\`\``;
};

