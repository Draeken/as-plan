import { Logger, transports } from "winston";

export const logger = new Logger({
  transports: [
    new transports.Console(),
  ],
});

process.argv.forEach((val, index) => {
  logger.info(`argv[${index}]: ${val}`);
});
