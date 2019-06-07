import globby from "globby";
import * as path from "path";
import Uploader from "s3-batch-upload";
import { logger } from "../logger";

const { BUCKET_NAME } = process.env;

// files are uploaded to s3://cypress-slack-reporter/remote/path
// files are downloadable via aws s3 sync s3://cypress-slack-reporter/remote/path .
main();

function uploadVideos() {
  new Uploader({
    bucket: BUCKET_NAME || "",
    localPath: path.resolve(process.cwd(), "cypress", "videos"),
    remotePath: path.join("cypress", "videos"),
    glob: "*.mp4", // default is '*.*'
    cacheControl: "max-age=3600" // can be a string, for all uploade resources
  }).upload();
}
function uploadScreenshots() {
  new Uploader({
    bucket: BUCKET_NAME || "",
    localPath: path.resolve(process.cwd(), "cypress", "screenshots"),
    remotePath: path.join("cypress", "screenshots"),
    glob: "*.png", // default is '*.*'
    cacheControl: "max-age=3600" // can be a string, for all uploade resources
  }).upload();
}
function uploadReports() {
  new Uploader({
    bucket: BUCKET_NAME || "",
    localPath: path.resolve(process.cwd(), "mochareports"),
    remotePath: path.join("mochareports"),
    glob: "*.*", // default is '*.*'
    cacheControl: "max-age=3600" // can be a string, for all uploade resources
  }).upload();
}

async function main() {
  await logger.info("Starting to search for files");
  const videoPaths = await getVideos;
  const screenshotPaths = await getScreenshots;
  const reportPaths = await getReports;
  logger.info("screenshotPaths", await screenshotPaths);
  logger.info("reportPaths", await reportPaths);
  logger.info("videoPaths", await videoPaths);
  uploadVideos();
  logger.info(`Videos are available at s3://${BUCKET_NAME}/cypress/videos`);
  logger.info(
    `files are downloadable via aws s3 sync s3://${BUCKET_NAME}/cypress/videos`
  );
  uploadScreenshots();
  logger.info(
    `Screenshots are available at s3://${BUCKET_NAME}/cypress/screenshots`
  );
  logger.info(
    `files are downloadable via aws s3 sync s3://${BUCKET_NAME}/cypress/screenshots`
  );
  uploadReports();
  logger.info(`Reports are available at s3://${BUCKET_NAME}/mochareports`);
  logger.info(
    `files are downloadable via aws s3 sync s3://${BUCKET_NAME}/mochareports`
  );
}

const getVideos = (async () => {
  const paths = await globby(path.resolve(process.cwd(), "cypress", "videos"), {
    expandDirectories: {
      files: ["*"],
      extensions: ["mp4"]
    }
  });
  return await paths;
})();
const getReports = (async () => {
  const paths = await globby(path.resolve(process.cwd(), "mochareports"), {
    expandDirectories: {
      files: ["*"],
      extensions: ["html", "json"]
    }
  });

  return await paths;
})();
const getScreenshots = (async () => {
  const paths = await globby(
    path.resolve(process.cwd(), "cypress", "screenshots"),
    {
      expandDirectories: {
        files: ["*"],
        extensions: ["png"]
      }
    }
  );

  return await paths;
})();
