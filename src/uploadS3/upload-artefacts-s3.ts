import { logger } from "../logger";
import * as upload from "./upload";

const s3uploader = upload;
// logger.info(`Starting up the s3 uploader`);
// logger.info(`Starting up uploadMochaAwesome`);
// s3uploader.uploadMochaAwesome();
// logger.info(`Starting up uploadScreenshots`);
// s3uploader.uploadScreenshots();
// logger.info(`Starting up uploadVideos`);
// s3uploader.uploadVideos();
// logger.info(`Finishing up the s3 uploader`);

logger.info(`Starting up the s3 uploader`);
logger.info(`Starting to upload all the things`);
let result;
result = s3uploader.uploadVideos();

logger.info(`Finishing up the s3 uploader`, result);
