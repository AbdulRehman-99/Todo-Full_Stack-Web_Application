/**
 * Logger Utility for Authentication Operations
 * Provides consistent logging for authentication events
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
}

class AuthLogger {
  private static readonly LOG_LEVEL = process.env.LOG_LEVEL || LogLevel.INFO;

  static log(level: LogLevel, message: string, context?: any, userId?: string): void {
    // Check if this log level should be output based on environment setting
    const levelOrder = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3
    };

    const currentLevelOrder = levelOrder[this.LOG_LEVEL as LogLevel] ?? 1;
    const messageLevelOrder = levelOrder[level];

    if (messageLevelOrder < currentLevelOrder) {
      return; // Don't log if below the current log level threshold
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
      ...(userId && { userId })
    };

    // Output to console (in production, this would go to a proper logging service)
    console.log(JSON.stringify(logEntry));
  }

  static debug(message: string, context?: any, userId?: string): void {
    this.log(LogLevel.DEBUG, message, context, userId);
  }

  static info(message: string, context?: any, userId?: string): void {
    this.log(LogLevel.INFO, message, context, userId);
  }

  static warn(message: string, context?: any, userId?: string): void {
    this.log(LogLevel.WARN, message, context, userId);
  }

  static error(message: string, context?: any, userId?: string): void {
    this.log(LogLevel.ERROR, message, context, userId);
  }

  /**
   * Log authentication events
   */
  static logAuthEvent(event: string, userId?: string, context?: any): void {
    this.info(`Authentication event: ${event}`, context, userId);
  }

  /**
   * Log token operations
   */
  static logTokenOperation(operation: string, userId?: string, context?: any): void {
    this.debug(`Token operation: ${operation}`, context, userId);
  }

  /**
   * Log security events
   */
  static logSecurityEvent(event: string, userId?: string, context?: any): void {
    this.warn(`Security event: ${event}`, context, userId);
  }

  /**
   * Log failed authentication attempts
   */
  static logFailedAuth(attemptDetails: any): void {
    this.warn('Failed authentication attempt', attemptDetails);
  }

  /**
   * Log successful authentication
   */
  static logSuccessfulAuth(userId: string, context?: any): void {
    this.info('Successful authentication', context, userId);
  }

  /**
   * Log token refresh events
   */
  static logTokenRefresh(userId: string, context?: any): void {
    this.debug('Token refresh', context, userId);
  }

  /**
   * Log logout events
   */
  static logLogout(userId: string, context?: any): void {
    this.info('User logout', context, userId);
  }
}

export default AuthLogger;