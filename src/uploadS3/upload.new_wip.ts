import * as AWS from "aws-sdk";
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
export function uploadAll(videosDir:string,reportsDir:string,screenshotsDir:string) {
  reportPaths = Promise.resolve(uploadMochaAwesome(reportsDir));
  // screenshotPaths = await uploadScreenshots(screenshotsDir);
  // videoPaths = await uploadVideos(videosDir);
  // console.log(reportPaths,screenshotPaths,videoPaths)
  console.log('s3props',s3props)
  console.log('returnedS3Object',returnedS3Object)
}

export function uploadToS3(
  file: Buffer,
  name: string,
  type: string
): AWS.S3.ManagedUpload.SendData {
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
      const data = s3bucket
        .upload(params, (err, data) => {
          if (err) {
            logger.error(
              `An error occurred during s3 upload:`,
              JSON.stringify(err)
            );
            return process.exit(1);
          } else {
            logger.info(
              `Successfully uploaded: ` + JSON.stringify(data)
            );
            return data
          }
        })
        .promise()
        .catch();
        data.
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

export async function uploadVideos(videosDir:string) {
  // const videosDir = await path.resolve(process.cwd(), "cypress", "videos");
  const videos = await getFiles(videosDir, ".mp4", []);
  logger.info(`Returned ${videos.length} files in ${videosDir}`);
  if (videos.length === 0) {
    logger.warn(`No videos files found, will not attempt s3 upload`);
    return { Location: "", ETag: "", Bucket: "", Key: "" };
  }
  const s3videos = await processUploads(videos);
  return s3videos;
}
let s3uploadedLocation:any;
let s3uploadedData: AWS.S3.ManagedUpload.SendData;
async function processUploads(file: FoundFile[]) {

  const bob = await Promise.resolve(dosummat())
  console.log(bob)
  function dosummat(){
    file.forEach((fileObject)=> {
      return Promise.resolve(processTheFile(fileObject))
      // console.log('fish',fish)
      // return Promise.resolve(fish)
    });
  }
  function processTheFile(fileObject: FoundFile){
    return Promise.resolve(readTheFile(fileObject))
    // console.log('returnedS3Object',returnedS3Object)
    // console.log('fish2',fish2)
    //   return Promise.resolve(fish2)

  }

  let s3Location: string;
  let s3Key: string;
  let s3Bucket: string;
  let s3ETag: string;
  function readTheFile(fileObject: FoundFile){
    let bobber: AWS.S3.ManagedUpload;
    var dasdata = fs.readFile(fileObject.path, async (err:any, data:any)  => {
      if (err) {
        throw err;
      } 
      else {
              try {
        await Promise.resolve(uploadToS3(
          data,
          fileObject.name,
          fileObject.type
        ).then((done) => {
          logger.info(`Uploaded file at:-`, done.Location);
          s3uploadedData = done
          s3Location = s3uploadedData.Location
          s3ETag = s3uploadedData.ETag
          s3Key = s3uploadedData.Key
          s3Bucket = s3uploadedData.Bucket
          s3props = [s3Location,s3ETag,s3Bucket,s3Key]
          
        }).finally(() =>{
          console.log('saffa has props',s3props)
          return Promise.resolve(s3uploadedData)
        }))
        console.log('saffa has data',s3uploadedData)
        return s3props
      }  catch (error) {
        logger.warn("error occurred during upload", {'error':error});
        return Promise.resolve(err)
      }
    }
    });
     console.log('saffa2',s3uploadedLocation)
     console.log('dasdata',dasdata)

    return Promise.resolve(s3uploadedData)

    // const dave = await returnedS3Object
    // console.log('dave',await returnedS3Object)
    // console.log('s3props',s3props)
    // return Promise.resolve(returnedS3Object)
    // return bobber
  }
  await console.log('saffa2',s3uploadedLocation)
  return Promise.resolve(s3uploadedData)

  // const s3uploadedLocation = await dosummat()
  // await console.log('saffa4',s3uploadedLocation)
  //   console.log('saffa3',bobber)

  // return await bobber
}

export async function uploadScreenshots(screenshotsDir: string) {
  // const screenshotsDir = await path.resolve(
  //   process.cwd(),
  //   "cypress",
  //   "screenshots"
  // );
  const screenshots = await getFiles(screenshotsDir, ".png", []);
  logger.info(`Returned ${screenshots.length} files in ${screenshotsDir}`);
  if (screenshots.length === 0) {
    logger.warn(`No screenshots files found, will not attempt s3 upload`);
    return;
  }
  const s3screenshots = await processUploads(screenshots);
  return s3screenshots;
}

export async function uploadMochaAwesome(reportsDir:string) {
  // const reportsDir = await path.resolve(process.cwd(), "mochareports");
  const report = await getFiles(reportsDir, ".html", []);
  logger.info(`Returned ${report.length} file(s) in ${reportsDir}`);
  if (report.length === 0) {
    logger.warn(`No report files found, will not attempt s3 upload`);
    // return;
  }
  const s3report = await processUploads(report);
  console.log('s3report',s3report)
  console.log('s3uploadedLocation',s3uploadedLocation)
  console.log('s3uploadedData',s3uploadedData)
  return s3report;
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
