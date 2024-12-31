type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  error?: Error
  userId?: string
  requestId?: string
  [key: string]: any // 允許額外的屬性
}

interface LogOptions {
  data?: any
  error?: Error
  userId?: string
  requestId?: string
  [key: string]: any // 允許額外的屬性
}

class Logger {
  private static instance: Logger
  private isDevelopment = process.env.NODE_ENV === 'development'

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp
    const level = entry.level.toUpperCase().padEnd(5)
    const message = entry.message
    const userId = entry.userId ? `[User: ${entry.userId}]` : ''
    const requestId = entry.requestId ? `[ReqID: ${entry.requestId}]` : ''
    
    let logMessage = `${timestamp} ${level} ${userId}${requestId} ${message}`
    
    // 移除特定屬性，其餘作為額外數據
    const { timestamp: _, level: __, message: ___, userId: ____, requestId: _____, error, ...extraData } = entry
    
    if (Object.keys(extraData).length > 0) {
      logMessage += `\nData: ${JSON.stringify(extraData, null, 2)}`
    }
    
    if (error instanceof Error) {
      logMessage += `\nError: ${error.message}\nStack: ${error.stack}`
    }

    return logMessage
  }

  private log(level: LogLevel, message: string, options: LogOptions = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    }

    const formattedLog = this.formatLogEntry(entry)

    // 開發環境下在控制台輸出
    if (this.isDevelopment) {
      switch (level) {
        case 'info':
          console.log(formattedLog)
          break
        case 'warn':
          console.warn(formattedLog)
          break
        case 'error':
          console.error(formattedLog)
          break
        case 'debug':
          console.debug(formattedLog)
          break
      }
    }

    // TODO: 在生產環境中將日誌保存到文件或發送到日誌服務
    if (!this.isDevelopment) {
      // 實作生產環境的日誌記錄邏輯
      // 例如：發送到 Sentry、Logstash 等服務
    }
  }

  info(message: string, options?: LogOptions) {
    this.log('info', message, options)
  }

  warn(message: string, options?: LogOptions) {
    this.log('warn', message, options)
  }

  error(message: string, options?: LogOptions) {
    this.log('error', message, options)
  }

  debug(message: string, options?: LogOptions) {
    if (this.isDevelopment) {
      this.log('debug', message, options)
    }
  }
}

export const logger = Logger.getInstance() 