import { Logger, transports } from 'winston';
import fs from 'fs';

const logDir = './log/';
const logFile = 'logfile.log';

if ( !fs.existsSync( logDir ) ) {
  // Create the directory if it does not exist
  fs.mkdirSync( logDir );
}

export const logger = new Logger({
  transports: [
    new transports.Console({
      colors: true,
      prettyPrint: true,
      timestamp: true,
      colorize: true,
      level: 'info' // Log all levels except debug
    }),
    new transports.File ({ 
      filename: logDir + logFile,
      level: 'debug' // Log all levels
    })
  ],
  levels: { 
      emerg: 0, 
      alert: 1, 
      crit: 2, 
      error: 3, 
      warning: 4, 
      notice: 5, 
      info: 6, 
      debug: 7
    }
});
