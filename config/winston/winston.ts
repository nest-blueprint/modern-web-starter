import winston from 'winston';
import { appConfig } from '../autoload/app.config';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize(),
  winston.format.align(),
  winston.format.prettyPrint(),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.align(),
  winston.format.json(),
);

export const getTransports = () => {
  const transports = [
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat,
    }),
    new winston.transports.File({
      filename: 'log/error.log',
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: 'log/info.log',
      level: 'info',
      format: fileFormat,
    }),
    new winston.transports.File({ filename: 'log/all.log', format: fileFormat }),
  ];

  const config = appConfig();

  if (config.application.DEBUG) {
    return [
      ...transports,
      new winston.transports.File({ filename: 'log/debug.log', level: 'debug', format: fileFormat }),
    ];
  }

  return transports;
};
