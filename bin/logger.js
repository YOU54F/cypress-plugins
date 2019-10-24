"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = require("winston");
var defaultLevel = process.env.LOG_LEVEL;
var options = {
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: defaultLevel,
    json: true,
    transports: [
        new winston_1.transports.Console({
            colorize: true,
            showLevel: true,
            timestamp: true,
            prettyPrint: true
        })
    ]
};
var logger = new winston_1.Logger(options);
exports.logger = logger;
