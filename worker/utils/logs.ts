import { GithubJobErrorLine } from '../types/github';

const ISO_TIMESTAMP_PREFIX = /^\d{4}-\d{2}-\d{2}T[^\s]+Z\s+/;
const GROUP_START_END_PREFIX = /^##\[(group|endgroup)\]\s*/i;

const cleanLine = (line: string) =>
  line.replace(ISO_TIMESTAMP_PREFIX, '').replace(GROUP_START_END_PREFIX, '').trim();

const pushErrorLine = (
  seenLines: Set<string>,
  errorLines: GithubJobErrorLine[],
  lineText: string,
  index: number
) => {
  const trimmedLine = cleanLine(lineText);
  if (!trimmedLine) return;

  const lowerCaseLine = trimmedLine.toLowerCase();
  if (seenLines.has(lowerCaseLine)) return;
  seenLines.add(lowerCaseLine);

  errorLines.push({ lineNumber: index + 1, line: trimmedLine });
};

export const extractErrorLines = (logText: string): GithubJobErrorLine[] => {
  const logLines = logText.split(/\r?\n/);
  const errorContexts: GithubJobErrorLine[] = [];
  const seenLines = new Set<string>();

  const CONTEXT_BEFORE = 10;
  const CONTEXT_AFTER = 15;

  const pushError = (index: number, lineText: string) => {
    const trimmedLine = cleanLine(lineText);
    if (!trimmedLine) return;

    const lowerCaseLine = trimmedLine.toLowerCase();
    if (seenLines.has(lowerCaseLine)) return;
    seenLines.add(lowerCaseLine);

    const startIdx = Math.max(0, index - CONTEXT_BEFORE);
    const endIdx = Math.min(logLines.length - 1, index + CONTEXT_AFTER);

    const contextLines = logLines.slice(startIdx, endIdx + 1).map(l => cleanLine(l)).filter(Boolean);

    errorContexts.push({
      lineNumber: index + 1,
      line: trimmedLine,
      context: contextLines
    });
  };

  const errorPatterns = [
    /^::error\b/i,
    /^##\[error\]/i,
    /\bError:\s(?!0 errors)/i,
    /npm ERR!/i,
    /\bfatal:\b/i,
    /\bCommand failed with exit code \d+\b/i,
    /\bProcess completed with exit code \d+\b/i,
    /\bExited with code \d+\b/i,
    /Traceback \(most recent call last\):/i,
    /\b(TypeError|ReferenceError|SyntaxError|Exception|ModuleNotFoundError|ImportError|AttributeError):/i,
    /FAILED\s+.*::/,
    /AssertionError/i,
  ];

  for (let i = 0; i < logLines.length; i++) {
    const line = logLines[i];
    const cleanedLine = cleanLine(line);

    if (errorPatterns.some((re) => re.test(cleanedLine))) {
      pushError(i, cleanedLine);
    } else {
      // Also check specific string matches that might not be caught by generic patterns
      const jsonMessageMatch = cleanedLine.match(/"message"\s*:\s*"([^"]+)"/i);
      if (jsonMessageMatch?.[1]) {
        pushError(i, jsonMessageMatch[1]);
      } else if (/Cloudflare API\b/i.test(cleanedLine)) {
        pushError(i, cleanedLine);
      }
    }
  }

  // Fallback if nothing matched
  if (errorContexts.length === 0) {
    const exitIndex = logLines.findIndex((line) =>
      /Process completed with exit code \d+/i.test(line)
    );

    if (exitIndex !== -1) {
      pushError(exitIndex, logLines[exitIndex]);
    }
  }

  return errorContexts;
};
