import fs from "node:fs";
import path from "node:path";

import pino from "pino";

import { config } from "../config.js";

const createDestination = () => {
  if (!config.logFile) {
    return pino.destination(1);
  }

  fs.mkdirSync(path.dirname(config.logFile), { recursive: true });

  return pino.destination({
    dest: config.logFile,
    sync: false,
    mkdir: true
  });
};

export const logger = pino(
  {
    level: config.logLevel,
    base: {
      service: "thegrapht-backend"
    },
    timestamp: pino.stdTimeFunctions.isoTime
  },
  createDestination()
);
