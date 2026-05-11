import { describe, it, expect } from 'vitest';
import { extractErrorLines } from './logs';

describe('extractErrorLines', () => {
  it('extracts "npm ERR!" lines with correct context length', () => {
    const logs = [
      'Some normal log line 1',
      'Some normal log line 2',
      'npm ERR! code ENOENT',
      'npm ERR! syscall open',
      'npm ERR! path /app/package.json',
      'More logs after error'
    ].join('\n');

    const result = extractErrorLines(logs);
    
    // Should find the 3 npm ERR! lines
    expect(result).toHaveLength(3);
    expect(result[0].line).toBe('npm ERR! code ENOENT');
    expect(result[0].lineNumber).toBe(3);
    // Context should include lines before and after
    expect(result[0].context).toContain('Some normal log line 2');
    expect(result[0].context).toContain('npm ERR! syscall open');
  });

  it('deduplicates identical error lines', () => {
    const logs = [
      'Error: Connection failed',
      'Some other line',
      'error: connection failed', // case-insensitive duplicate
      'Traceback (most recent call last):'
    ].join('\n');

    const result = extractErrorLines(logs);
    
    // Second identical error should be ignored
    expect(result.map(r => r.line.toLowerCase())).toEqual([
      'error: connection failed',
      'traceback (most recent call last):'
    ]);
  });

  it('falls back to the last exit code if no specific error patterns match', () => {
    const logs = [
      'Step started',
      'Doing some work...',
      'Something went silently wrong',
      'Process completed with exit code 1'
    ].join('\n');

    const result = extractErrorLines(logs);
    
    expect(result).toHaveLength(1);
    expect(result[0].line).toBe('Process completed with exit code 1');
    expect(result[0].lineNumber).toBe(4);
  });

  it('strips ISO timestamps and grouping tags', () => {
    const logs = [
      '2024-03-12T10:00:00.000Z ##[group]Starting step',
      '2024-03-12T10:00:01.000Z Error: Something broke',
      '2024-03-12T10:00:02.000Z ##[endgroup]'
    ].join('\n');

    const result = extractErrorLines(logs);
    
    expect(result).toHaveLength(1);
    expect(result[0].line).toBe('Error: Something broke');
    // Ensure context is also cleaned
    expect(result[0].context).toContain('Starting step');
    expect(result[0].context).toContain('Error: Something broke');
  });
});
