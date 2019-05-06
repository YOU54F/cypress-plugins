import { Logger, LoggerInstance, LoggerOptions, transports } from "winston";

const defaultLevel = process.env.LOG_LEVEL;

const options: LoggerOptions = {
  handleExceptions: true,
  humanReadableUnhandledException: true,
  level: defaultLevel,
  transports: [
    new transports.Console({
      colorize: true,
      showLevel: true,
      timestamp: true,
      name: "slack-mock",
      level: "info"
    })
  ]
};

const logger: LoggerInstance = new Logger(options);

export { logger };
