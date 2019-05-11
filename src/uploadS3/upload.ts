import * as AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../logger";

const { BUCKET_NAME, AWS_ACCESS_ID, AWS_SECRET_KEY } = process.env;

function uploadToS3(file: Buffer, name: string, type: string) {
  const s3bucket: AWS.S3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_ID,
    secretAccessKey: AWS_SECRET_KEY
  });
  const params: AWS.S3.PutObjectRequest = {
    Bucket: BUCKET_NAME || "",
    Key: name,
    Body: file,
    ACL: "public-read",
    ContentType: `image/${type}`
  };
  logger.debug(`Params for S3 uploads:-` + JSON.stringify(params));
  s3bucket.upload(params, (err, data) => {
    if (err) {
      logger.error(`An error occurred during s3 upload: ${err}`);
      return process.exit(1);
    } else {
      logger.info(`Successfully uploaded: ` + JSON.stringify(data));
    }
  });
}

interface FoundFile {
  path: string;
  name: string;
  type: string;
}

function getFiles(dir: string, ext: string, fileList: FoundFile[]) {
  if (!fs.existsSync(dir)) {
    logger.info(`No files found in ${dir}`);
    return fileList;
  } else {
    const files = fs.readdirSync(dir);
    files.forEach((file: string) => {
      const filePath = `${dir}/${file}`;
      if ([".gitkeep", ".Trash-0", "assets"].indexOf(file) === -1) {
        if (fs.statSync(filePath).isDirectory()) {
          getFiles(filePath, ext, fileList);
        } else if (path.extname(file) === ext) {
          const obj: FoundFile = {
            path: filePath,
            name: file,
            type: file.split(".")[1]
          };
          fileList.push(obj);
        }
      }
    });
    logger.debug(
      `Returned the following files ` + JSON.stringify(fileList) + ` in ${dir}`
    );
    return fileList;
  }
}

function uploadVideos() {
  const videosDir = path.resolve(process.cwd(), "cypress", "videos");
  const videos = getFiles(videosDir, ".mp4", []);
  logger.info(`Returned ${videos.length} files in ${videosDir}`);
  if (videos.length === 0) {
    logger.warn(`No videos files found, will not attempt s3 upload`);
    return;
  }
  videos.forEach(videoObject => {
    fs.readFile(videoObject.path, (err, data) => {
      if (err) {
        throw err;
      }
      uploadToS3(data, videoObject.name, videoObject.type);
    });
  });
}

function uploadScreenshots() {
  const screenshotsDir = path.resolve(process.cwd(), "cypress", "screenshots");
  const screenshots = getFiles(screenshotsDir, ".png", []);
  logger.info(`Returned ${screenshots.length} files in ${screenshotsDir}`);
  if (screenshots.length === 0) {
    logger.warn(`No screenshots files found, will not attempt s3 upload`);
    return;
  }
  screenshots.forEach(screenshotObject => {
    fs.readFile(screenshotObject.path, (err, data) => {
      if (err) {
        throw err;
      }
      uploadToS3(data, screenshotObject.name, screenshotObject.type);
    });
  });
}

function uploadMochaAwesome() {
  const reportsDir = path.resolve(process.cwd(), "mochareports");
  const report = getFiles(reportsDir, ".html", []);
  logger.info(`Returned ${report.length} file(s) in ${reportsDir}`);
  if (report.length === 0) {
    logger.warn(`No report files found, will not attempt s3 upload`);
    return;
  }
  fs.readFile(report[0].path, (err, data) => {
    if (err) {
      throw err;
    }
    uploadToS3(data, report[0].name, report[0].type);
  });
}

export function upload(): Instance {
  module.exports.instance = {
    uploadVideos,
    uploadScreenshots,
    uploadMochaAwesome
  };

  return module.exports.instance;
}

export interface Instance {
  uploadVideos: () => void;
  uploadScreenshots: () => void;
  uploadMochaAwesome: () => void;
}
