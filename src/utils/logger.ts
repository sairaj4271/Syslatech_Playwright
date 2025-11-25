// ============================================================================
// LOGGER (Enterprise Grade)
// ----------------------------------------------------------------------------
// - Supports DEBUG, INFO, WARN, ERROR, PASS, FAIL
// - Auto-creates /logs directory
// - Daily log rotation: logs/test_YYYY-MM-DD.log
// - Color-coded console output
// - Supports module-level child loggers (logger.child("WorkflowPage"))
// - Controlled via LOG_LEVEL env variable (default: DEBUG)
// ============================================================================

import * as fs from "fs";
import * as path from "path";

// ----------------------------------------------------------------------------
// LOG LEVEL ENUM
// ----------------------------------------------------------------------------
export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  DEBUG = "DEBUG",
  PASS = "PASS",
  FAIL = "FAIL",
}

// ----------------------------------------------------------------------------
// TERMINAL COLORS (console output)
// ----------------------------------------------------------------------------
const COLORS = {
  INFO: "\x1b[36m",   // cyan
  WARN: "\x1b[33m",   // yellow
  ERROR: "\x1b[31m",  // red
  DEBUG: "\x1b[90m",  // grey
  PASS: "\x1b[32m",   // green
  FAIL: "\x1b[31m",   // red
  RESET: "\x1b[0m",
};

// ============================================================================
// LOGGER CLASS
// ============================================================================
export class Logger {
  private readonly logDir: string;
  private readonly logFile: string;
  private readonly component?: string;

  // LOG LEVEL: default = DEBUG (logs everything)
  private readonly currentLevel =
    process.env.LOG_LEVEL?.toUpperCase() || "DEBUG";

  constructor(component?: string) {
    this.component = component;

    // Directory where logs are stored → /logs
    this.logDir = path.join(process.cwd(), "logs");

    // Daily rotating log file → test_2025-11-21.log
    const date = new Date().toISOString().split("T")[0];
    this.logFile = path.join(this.logDir, `test_${date}.log`);

    // Ensure /logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // ----------------------------------------------------------------------------
  // Create a sub-logger: logger.child("WorkflowPage")
  // Outputs:
  // [INFO] [WorkflowPage] Message Here
  // ----------------------------------------------------------------------------
  public child(component: string): Logger {
    return new Logger(component);
  }

  // ----------------------------------------------------------------------------
  // Checks if log level should be printed based on LOG_LEVEL priority
  // ----------------------------------------------------------------------------
  private shouldLog(level: LogLevel): boolean {
    const priority: Record<LogLevel, number> = {
      ERROR: 0,
      FAIL: 1,
      WARN: 2,
      INFO: 3,
      PASS: 4,
      DEBUG: 5,
    };

    return priority[level] <= priority[this.currentLevel as LogLevel];
  }

  // ----------------------------------------------------------------------------
  // Formats log line with timestamp and component
  // ----------------------------------------------------------------------------
  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const extras = data ? ` | ${JSON.stringify(data)}` : "";
    const comp = this.component ? `[${this.component}] ` : "";
    return `[${timestamp}] [${level}] ${comp}${message}${extras}`;
  }

  // ----------------------------------------------------------------------------
  // Writes line into the file (async, non-blocking)
  // ----------------------------------------------------------------------------
  private write(line: string) {
    fs.appendFile(this.logFile, line + "\n", () => {});
  }

  // ----------------------------------------------------------------------------
  // Prints colored output to console + writes to log file
  // ----------------------------------------------------------------------------
  private print(level: LogLevel, message: string, data?: any) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, data);
    const color = COLORS[level] || "";
    const reset = COLORS.RESET;

    console.log(color + formatted + reset); // console
    this.write(formatted);                  // file
  }

  // ============================================================================
  // PUBLIC LOGGING METHODS
  // ============================================================================
  info(msg: string, data?: any) { this.print(LogLevel.INFO, msg, data); }
  warn(msg: string, data?: any) { this.print(LogLevel.WARN, msg, data); }
  error(msg: string, data?: any) { this.print(LogLevel.ERROR, msg, data); }
  debug(msg: string, data?: any) { this.print(LogLevel.DEBUG, msg, data); }
  pass(msg: string, data?: any) { this.print(LogLevel.PASS, msg, data); }
  fail(msg: string, data?: any) { this.print(LogLevel.FAIL, msg, data); }

  // ----------------------------------------------------------------------------
  // Expose underlying log file path (optional)
  // ----------------------------------------------------------------------------
  getLogFile(): string {
    return this.logFile;
  }
}

// ============================================================================
// DEFAULT GLOBAL LOGGER
// ============================================================================
export const logger = new Logger();
