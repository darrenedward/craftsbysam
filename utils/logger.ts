/**
 * Production-safe logger that only outputs in development mode
 * In production, all logs are suppressed to prevent information leakage
 */

const isDevelopment = import.meta.env.DEV;

class Logger {
  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  log(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.log(this.formatMessage('LOG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
    // In production, you might want to send errors to a monitoring service
    // This is a placeholder for future error tracking integration
  }

  debug(message: string, ...args: any[]): void {
    if (isDevelopment && import.meta.env.DEBUG) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
