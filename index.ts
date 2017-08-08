import { logger } from "./logger";

process.argv.forEach((val, index) => {
  logger.info(`toto[${index}]: ${val}`);
});
