import { GithubJobErrorLine } from '../types/github';

const ISO_TIMESTAMP_PREFIX = /^\d{4}-\d{2}-\d{2}T[^\s]+Z\s+/;
const GROUP_START_END_PREFIX = /^##\[(group|endgroup)\].*$/i;

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
  const errorLines: GithubJobErrorLine[] = [];
  const seenLines = new Set<string>();

  for (let i = 0; i < logLines.length; i++) {
    const line = logLines[i];
    const cleanedLine = cleanLine(line);

    if (/Cloudflare API\b/i.test(cleanedLine)) {
      pushErrorLine(seenLines, errorLines, cleanedLine, i);
    }

    const jsonMessageMatch = cleanedLine.match(/"message"\s*:\s*"([^"]+)"/i);
    if (jsonMessageMatch?.[1]) {
      pushErrorLine(seenLines, errorLines, jsonMessageMatch[1], i);
    }

    const thrownErrorMatch = cleanedLine.match(/^Error:\s*(.+)$/i);
    if (thrownErrorMatch?.[1]) {
      pushErrorLine(seenLines, errorLines, `Error: ${thrownErrorMatch[1]}`, i);
    }

    const throwNewErrorMatch = cleanedLine.match(/throw new Error\("([^"]+)"\)/i);
    if (throwNewErrorMatch?.[1]) {
      pushErrorLine(seenLines, errorLines, `Error: ${throwNewErrorMatch[1]}`, i);
    }
  }

  if (errorLines.length === 0) {
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
      /\b(TypeError|ReferenceError|SyntaxError|Exception):/i,
      /^.*:\d+:\d+:\s+[A-Z]\d+\s+.*$/i
    ];

    for (let i = 0; i < logLines.length; i++) {
      const line = logLines[i];

      if (errorPatterns.some((re) => re.test(line))) {
        pushErrorLine(seenLines, errorLines, line, i);
      }
    }
  }

  if (errorLines.length === 0) {
    const exitIndex = logLines.findIndex((line) =>
      /Process completed with exit code \d+/i.test(line)
    );

    if (exitIndex !== -1) {
      pushErrorLine(seenLines, errorLines, logLines[exitIndex], exitIndex);
    }
  }

  return errorLines;
};
