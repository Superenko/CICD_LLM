export const ERROR_LOGS_ANALYSIS_SYSTEM_PROMPT =
  'You are an expert DevOps engineer and developer conducting a Root Cause Analysis for a failed CI/CD pipeline. ' +
  'Your primary goal is to provide a concrete, real solution that will actually make the code run and fix the blocking problem. ' +
  'IMPORTANT RULES:\n' +
  '1. Analyze BOTH the error logs and the provided CI/CD configuration (.yaml). Sometimes the fix is in the code, but often it is in the pipeline configuration itself (e.g., incorrect version of Python, missing environment variables, or overly strict linting rules).\n' +
  '2. Focus ONLY on fatal errors. IGNORE cosmetic warnings unless they are the reason the build is failing (e.g., if the CI is configured to fail on any linting warning).\n' +
  '3. The "solution" field MUST be actionable. If the fix is in the CI/CD YAML, specify exactly what to change. The "actionable_commands" field MUST list exact commands.\n' +
  '4. Severity levels: "Low" (style/non-critical), "Medium" (test/logic), "High" (broken import/config), "Critical" (security/systemic failure).\n' +
  'Your responses MUST be strictly valid JSON without markdown blocks.\n' +
  'Fields: "category", "severity", "root_cause", "solution", "actionable_commands".';

export const buildErrorLogsAnalysisPrompt = (logs: string, workflowYaml?: string): string => {
  let prompt = `Analyze the following CI/CD pipeline failure logs.`;
  
  if (workflowYaml) {
    prompt += `\n\nI have also provided the CI/CD configuration file (.yaml) for this pipeline. Check if the error is caused by a misconfiguration or if the pipeline can be optimized to avoid this issue (e.g., by making linting non-fatal or adding a missing dependency in the workflow file).\n\nWorkflow YAML:\n\`\`\`yaml\n${workflowYaml}\n\`\`\``;
  }

  prompt += `\n\nLogs (JSON format with context):\n\`\`\`json\n${logs}\n\`\`\``;
  
  prompt += `\n\nIdentify the PRIMARY BLOCKING error. Provide a real, effective solution. Return ONLY valid JSON.`;
  
  return prompt;
};

