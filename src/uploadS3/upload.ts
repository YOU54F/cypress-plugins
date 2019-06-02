import * as AWS from "aws-sdk";
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile); // (A)

import * as fs from "fs";
import * as path from "path";
import { logger } from "../logger";
// tslint:disable-next-line: prefer-const
let returnedS3Object: AWS.S3.ManagedUpload.SendData;
// var Promise = require('bluebird');
// var fs = Promise.promisifyAll(require('fs'));
let s3props: string[];

const { BUCKET_NAME, AWS_ACCESS_ID, AWS_SECRET_KEY } = process.env;
let reportPaths;
let screenshotPaths;
let videoPaths: any;
let s3DataResolved: Promise<AWS.S3.ManagedUpload.SendData>;
let thes3ting: Promise<AWS.S3.ManagedUpload.SendData>;
export async function uploadAll(
  videosDir: string,
  reportsDir: string,
  screenshotsDir: string
) {
  // reportPaths = await uploadMochaAwesome(reportsDir);

  reportPaths = (_reportsDir: string) => {
    return uploadMochaAwesome(reportsDir).then(token => {
      return token;
    });
  };

  let reportPathsResolved = reportPaths(reportsDir);
  reportPathsResolved.then(function(result) {
    console.log("reportPathsResolved", result); // "Some User token"
  });
  // screenshotPaths =  uploadScreenshots(screenshotsDir);
  // videoPaths =  uploadVideos(videosDir);
  // console.log(reportPaths,screenshotPaths,videoPaths)
  console.log("s3props", s3props);
  console.log("returnedS3Object", returnedS3Object);
  thes3ting = s3DataResolved.then(result => {
    console.log("thes3ting", result); // "Some User token"
    return result;
  });
}

export function uploadToS3(file: Buffer, name: string, type: string) {
  try {
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
    try {
      const boball = s3bucket
        .upload(params, (err, data) => {
          if (err) {
            logger.error(
              `An error occurred during s3 upload:`,
              JSON.stringify(err)
            );
            return process.exit(1);
          } else {
            logger.info(`Successfully uploaded: ` + JSON.stringify(data));
            return data;
          }
        })
        .promise();
      return boball;
    } catch (error) {
      throw Error(`s3 upload err,${error}`);
    }
  } catch (err) {
    throw Error(`whoops,${err}`);
  }
}

export interface FoundFile {
  path: string;
  name: string;
  type: string;
}

export function getFiles(dir: string, ext: string, fileList: FoundFile[]) {
  if (!fs.existsSync(dir)) {
    logger.info(`No files found in ${dir}`);
    return fileList;
  } else {
    const files = fs.readdirSync(dir);
    const filofax = files.forEach((file: string) => {
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

export function uploadVideos(videosDir: string) {
  // const videosDir =  path.resolve(process.cwd(), "cypress", "videos");
  const videos = getFiles(videosDir, ".mp4", []);
  logger.info(`Returned ${videos.length} files in ${videosDir}`);
  if (videos.length === 0) {
    logger.warn(`No videos files found, will not attempt s3 upload`);
    return { Location: "", ETag: "", Bucket: "", Key: "" };
  }
  const s3videos = processUploads(videos);
  return s3videos;
}
let s3uploadedLocation: any;
let s3uploadedData: AWS.S3.ManagedUpload.SendData;
// let thes3ting: any;
function processUploads(file: FoundFile[]) {
  let s3uploadedDatar = () => (
    _result: Promise<AWS.S3.ManagedUpload.SendData>
  ) => {
    file.forEach(fileObject => {
      {
        readFileAsync(
          fileObject.path,
          (err: any, data: any): Promise<AWS.S3.ManagedUpload.SendData> => {
            if (err) {
              throw err;
            } else {
              try {
                let s3Data = function() {
                  return uploadToS3(
                    data,
                    fileObject.name,
                    fileObject.type
                  ).then(data => {
                    return data;
                  });
                };
                s3DataResolved = s3Data();
                thes3ting = s3DataResolved.then(function(result) {
                  console.log("result", result); // "Some User token"
                  return result;
                });
                return s3DataResolved;
              } catch (error) {
                logger.warn("error occurred during upload", { error: error });
                return error;
              }
            }
            return (thes3ting = s3DataResolved.then(function(result) {
              console.log("result", result); // "Some User token"
              return result;
            }));
          }
        );
        return s3DataResolved;
      }
    });
  };
  let result: any;
  let summat = s3uploadedDatar();
  console.log("summat", summat); // Promise { <pending> }

  summat.then(function(result) {
    console.log(result); // "Some User token"
  });
}

export function uploadScreenshots(screenshotsDir: string) {
  const screenshots = getFiles(screenshotsDir, ".png", []);
  logger.info(`Returned ${screenshots.length} files in ${screenshotsDir}`);
  if (screenshots.length === 0) {
    logger.warn(`No screenshots files found, will not attempt s3 upload`);
    return;
  }
  const s3screenshots = processUploads(screenshots);
  return s3screenshots;
}

export function uploadMochaAwesome(reportsDir: string) {
  // const reportsDir =  path.resolve(process.cwd(), "mochareports");
  const report = getFiles(reportsDir, ".html", []);
  logger.info(`Returned ${report.length} file(s) in ${reportsDir}`);
  if (report.length === 0) {
    logger.warn(`No report files found, will not attempt s3 upload`);
    // return;
  }
  const s3report = processUploads(report);
  console.log("s3report", s3report);
  console.log("s3uploadedLocation", s3uploadedLocation);
  console.log("s3uploadedData", s3uploadedData);
  return Promise.resolve(s3report);
}
