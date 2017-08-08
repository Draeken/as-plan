import { Logger, transports } from 'winston';

const asLogger = new Logger({
  transports: [
    new transports.Console(),
  ],
});

export default asLogger;
