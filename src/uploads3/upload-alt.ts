import * as AWS from "aws-sdk";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../logger";
// tslint:disable-next-line: prefer-const
let returnedS3Object: AWS.S3.ManagedUpload.SendData;

const { BUCKET_NAME, AWS_ACCESS_ID, AWS_SECRET_KEY } = process.env;
let reportPaths;
let screenshotPaths;
let videoPaths: any;
export async function uploadAll() {
  reportPaths = await uploadMochaAwesome();
  screenshotPaths = await uploadScreenshots();
  videoPaths = await uploadVideos();
  // logger.warn(reportPaths)
  // logger.warn(screenshotPaths)
  logger.warn("videopaths" + JSON.stringify(videoPaths));
}

export async function uploadToS3(
  file: Buffer,
  name: string,
  type: string
): Promise<AWS.S3.ManagedUpload.SendData> {
  const s3bucket: AWS.S3 = await new AWS.S3({
    accessKeyId: AWS_ACCESS_ID,
    secretAccessKey: AWS_SECRET_KEY
  });
  const params: AWS.S3.PutObjectRequest = await {
    Bucket: BUCKET_NAME || "",
    Key: name,
    Body: file,
    ACL: "public-read",
    ContentType: `image/${type}`
  };
  const returnedData = await s3bucket
    .upload(params, (err, data) => {
      if (err) {
        logger.error(
          `An error occurred during s3 upload:`,
          JSON.stringify(err)
        );
        return process.exit(1);
      } else {
        logger.info(`Successfully uploaded: ` + JSON.stringify(data));
      }
    })
    .promise();
  return await returnedData;
}

export interface FoundFile {
  path: string;
  name: string;
  type: string;
}

export async function getFiles(
  dir: string,
  ext: string,
  fileList: FoundFile[]
) {
  if (!fs.existsSync(dir)) {
    logger.info(`No files found in ${dir}`);
    return fileList;
  } else {
    const files = await fs.readdirSync(dir);
    await files.forEach(async (file: string) => {
      const filePath = `${dir}/${file}`;
      if ([".gitkeep", ".Trash-0", "assets"].indexOf(file) === -1) {
        if (fs.statSync(filePath).isDirectory()) {
          await getFiles(filePath, ext, fileList);
        } else if (path.extname(file) === ext) {
          const obj: FoundFile = {
            path: filePath,
            name: file,
            type: file.split(".")[1]
          };
          await fileList.push(obj);
        }
      }
    });
    logger.debug(
      `Returned the following files ` + JSON.stringify(fileList) + ` in ${dir}`
    );
    return await fileList;
  }
}

// export async function uploadVideos() {
//   const videosDir = await path.resolve(process.cwd(), "cypress", "videos");
//   const videos = await getFiles(videosDir, ".mp4", []);
//   logger.info(`Returned ${videos.length} files in ${videosDir}`);
//   if (videos.length === 0) {
//     logger.warn(`No videos files found, will not attempt s3 upload`);
//     return { Location: "", ETag: "", Bucket: "", Key: "" };
//   }
//   let returnedS3Object: AWS.S3.ManagedUpload.SendData;
//   videos.forEach( videoObject => {
//     fs.readFile(videoObject.path,  async (err, data) => {
//       if (err) {
//         throw err;
//       }
//       returnedS3Object =  await uploadToS3(
//         data,
//         videoObject.name,
//         videoObject.type
//       );
//       logger.info("returnedData1:-", await returnedS3Object);
//       return await returnedS3Object;
//     });
//   });
// }

export async function uploadVideos() {
  const videosDir = await path.resolve(process.cwd(), "cypress", "videos");
  const videos = await getFiles(videosDir, ".mp4", []);
  logger.info(`Returned ${videos.length} files in ${videosDir}`);
  if (videos.length === 0) {
    logger.warn(`No videos files found, will not attempt s3 upload`);
    return { Location: "", ETag: "", Bucket: "", Key: "" };
  }
  const s3videos = await processUploads(videos);
  return s3videos;
}

async function processUploads(file: FoundFile[]) {
  let s3uploadedData: AWS.S3.ManagedUpload.SendData;
  return await file.forEach(async fileObject => {
    return await fs.readFile(fileObject.path, async (err, data) => {
      if (err) {
        throw err;
      }
      s3uploadedData = await uploadToS3(data, fileObject.name, fileObject.type);
      logger.info(`Uploaded file:-`, s3uploadedData);
      return s3uploadedData;
    });
  });
}

export async function uploadScreenshots() {
  const screenshotsDir = await path.resolve(
    process.cwd(),
    "cypress",
    "screenshots"
  );
  const screenshots = await getFiles(screenshotsDir, ".png", []);
  logger.info(`Returned ${screenshots.length} files in ${screenshotsDir}`);
  if (screenshots.length === 0) {
    logger.warn(`No screenshots files found, will not attempt s3 upload`);
    return;
  }
  screenshots.forEach(screenshotObject => {
    fs.readFile(screenshotObject.path, async (err, data) => {
      if (err) {
        throw err;
      }
      await uploadToS3(data, screenshotObject.name, screenshotObject.type);
    });
  });
}

export async function uploadMochaAwesome() {
  const reportsDir = await path.resolve(process.cwd(), "mochareports");
  const report = await getFiles(reportsDir, ".html", []);
  logger.info(`Returned ${report.length} file(s) in ${reportsDir}`);
  if (report.length === 0) {
    logger.warn(`No report files found, will not attempt s3 upload`);
    return;
  }
  await fs.readFile(report[0].path, async (err, data) => {
    if (err) {
      throw err;
    }
    await uploadToS3(data, report[0].name, report[0].type);
  });
}

// export function upload(): Instance {
//   module.exports.instance = {
//     uploadVideos,
//     uploadScreenshots,
//     uploadMochaAwesome,
//     uploadToS3,
//     getFiles
//   };

//   return module.exports.instance;
// }

// export interface Instance {
//   uploadVideos(): () => Promise<void>;
//   uploadScreenshots(): () => void;
//   uploadMochaAwesome(): () => void;
//   uploadToS3(file: Buffer, name: string, type: string): () => Promise<void>;
//   getFiles(
//     dir: string,
//     ext: string,
//     fileList: FoundFile[]
//   ): () => Promise<FoundFile[]>;
// }
