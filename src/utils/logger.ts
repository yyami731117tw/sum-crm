interface LogError {
  message: string;
  stack?: string;
}

class Logger {
  error(message: string, error?: Error | unknown) {
    const errorObj: LogError = {
      message,
    }

    if (error instanceof Error) {
      errorObj.stack = error.stack
    }

    console.error(JSON.stringify(errorObj, null, 2))
  }

  info(message: string, data?: unknown) {
    console.log(message, data ? JSON.stringify(data, null, 2) : '')
  }

  warn(message: string, data?: unknown) {
    console.warn(message, data ? JSON.stringify(data, null, 2) : '')
  }
}

export const logger = new Logger() 