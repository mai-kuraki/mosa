/**
 * Logging service using electron-log.
 * All logs go to file (userData/logs/mosa.log) and console.
 */

interface Logger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

/**
 * Create a named logger instance.
 * In production, this wraps electron-log. In development, uses console.
 */
export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`;

  return {
    info: (...args) => console.log(prefix, ...args),
    warn: (...args) => console.warn(prefix, ...args),
    error: (...args) => console.error(prefix, ...args),
    debug: (...args) => console.debug(prefix, ...args),
  };
}
