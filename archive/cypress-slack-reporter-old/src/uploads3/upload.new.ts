import globby from "globby";
import * as path from "path";
import Uploader from "s3-batch-upload";
import { logger } from "../logger";

const { BUCKET_NAME } = process.env;

// files are uploaded to s3://cypress-slack-reporter/remote/path
// files are downloadable via aws s3 sync s3://cypress-slack-reporter/remote/path .
main();

function uploadS3(artefactPath: string, glob: string) {
  return new Uploader({
    accessControlLevel: "public-read",
    bucket: BUCKET_NAME || "",
    localPath: path.resolve(process.cwd(), artefactPath),
    remotePath: path.join(artefactPath),
    glob,
    cacheControl: "max-age=3600" // can be a string, for all uploade resources
  }).upload();
}

async function main() {
  await logger.info("Starting to search for files");
  await getVideos;
  await getScreenshots;
  await getReports;
  const s3PathsVideos = await uploadS3("cypress/videos", "*.mp4");
  const s3PathsScreenshots = await uploadS3("cypress/screenshots", "*.png");
  const s3PathsReports = await uploadS3("mochareports", "*.*");
  const processedS3PathsVideos = processS3Paths(s3PathsVideos);
  const processedS3PathsScreenshots = processS3Paths(s3PathsScreenshots);
  const processedS3PathsReports = processS3Paths(s3PathsReports);
  logger.info("processedS3PathsVideos", { processedS3PathsVideos });
  logger.info("processedS3PathsScreenshots", { processedS3PathsScreenshots });
  logger.info("processedS3PathsReports", { processedS3PathsReports });
}

function processS3Paths(paths: string[]) {
  const bucketURL = `https://${BUCKET_NAME}.s3.amazonaws.com/`;
  const processedS3Paths: string[] = [];
  paths.forEach(element => {
    processedS3Paths.push(`${bucketURL}${element}`);
  });
  return processedS3Paths;
}

const getVideos = (async () => {
  const paths = await globby(path.resolve(process.cwd(), "cypress", "videos"), {
    expandDirectories: {
      files: ["*"],
      extensions: ["mp4"]
    }
  });
  return paths;
})();
const getReports = (async () => {
  const paths = await globby(path.resolve(process.cwd(), "mochareports"), {
    expandDirectories: {
      files: ["*"],
      extensions: ["html", "json"]
    }
  });

  return  paths;
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

  return  paths;
})();
