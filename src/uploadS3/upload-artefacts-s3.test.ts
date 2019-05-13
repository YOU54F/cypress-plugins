import "jest";
import * as upload from "./upload";
// tslint:disable-next-line: no-var-requires
const AWS = require("aws-sdk");

import { logger } from "../logger";
const uploader = upload
describe("S3 Uploads", () => {
  beforeEach(async () => {
    AWS.S3 = await jest.fn().mockImplementation(() => {
      return {
        async upload(params: any, cb: any) {
          try {
            const result = await cb(null, {
              ETag: "etag",
              Location: "PublicWebsiteLink",
              Key: "RandomKey",
              Bucket: "TestBucket"
            });
            return await result;
          } catch (e) {
            logger.warn(e);
          }
        }
      };
    });
    // await require("./upload");
  });

  describe("uploadVideos Checker", () => {
    test("uploads videos", async () => {
      const mockerUploadVideos = jest.spyOn(uploader, "uploadVideos");
      const mockerUploadToS3 = jest.spyOn(uploader, "uploadToS3");
      const s = await uploader.uploadVideos();
      expect(mockerUploadVideos).toReturn();
    });
  });

  describe("mochareports Checker", () => {
    test("uploads mochareports", async () => {
      const mockerUploadMochaAwesome = jest.spyOn(uploader, "uploadMochaAwesome");
      const mockerUploadToS3 = jest.spyOn(uploader, "uploadToS3");
      const s = await uploader.uploadMochaAwesome();
      expect(s).toEqual(undefined);
      expect(mockerUploadMochaAwesome).toReturn();
    });
  });
});

interface FoundFile {
  path: string;
  name: string;
  type: string;
}


  // test('it uploads MochaAwesome reports', async () => {
  //   // setup('test_report')
  //   const mockerUploadMochaAwesome = jest.spyOn(uploader,'uploadMochaAwesome');
  //   const mockerUploadToS3 = jest.spyOn(uploader,'uploadToS3');
  //   await uploader.uploadMochaAwesome();
  //   expect(mockerUploadMochaAwesome).toHaveBeenCalled()
  //   expect(mockerUploadMochaAwesome).toHaveReturned()

  //   mockerUploadMochaAwesome.mockReset();
  //   mockerUploadMochaAwesome.mockRestore();
  // });
  // test('it uploads Screenshots', async () => {
  //   // setup('Screenshots')
  //   const mockerUploadScreenshots = jest.spyOn(uploader,'uploadScreenshots');
  //   const mockerUploadToS3 = jest.spyOn(uploader,'uploadToS3');
  //   await uploader.uploadScreenshots();
  //   expect(mockerUploadScreenshots).toHaveBeenCalled()
  //   expect(mockerUploadScreenshots).toReturn()
  //   mockerUploadScreenshots.mockReset();
  //   mockerUploadScreenshots.mockRestore();
  // });
  // test('it uploads videos', async () => {
  //   // setup('videos')
  //   const mockerUploadVideos = jest.spyOn(uploader,'uploadVideos');
  //   const mockerUploadToS3 = jest.spyOn(uploader,'uploadToS3');
  //   await uploader.uploadVideos();
  //   const mockResult =  await uploader.uploadToS3();
  //   expect(mockerUploadVideos).toHaveBeenCalled()
  //   expect(mockResult).toContain('')
  //   mockerUploadVideos.mockReset();
  //   mockerUploadVideos.mockRestore();

  // });

  //   test('it returns something', async () => {
  //     const file = fs.readFile('./upload-artefacts-s3.ts' ,async (err, data) => {
  //       if (err) {
  //         throw err;
  //       }
  //       return data
  //     });
  //     const name = 'name'
  //     const type = '.png'
  //     // const paramsFunc = {
  //     //   file,
  //     //   name,
  //     //   type
  //     // }
  //     // const paramsS3 =  {
  //     //     Bucket: 'mock_bucket',
  //     //     Key: name,
  //     //     Body: file,
  //     //     ACL: "public-read",
  //     //     ContentType: `image/${type}`
  //     //   }

  //      upload().uploadToS3(file,name,type)
  // });

  // describe("Get Files Checker", () => {
  //   test("Returns only specified filetypes if they exist in a dir", async () => {
  //     const dir: string = path.join(__dirname, "../slack/test/reportSingle");
  //     const ext: string = ".html";
  //     const fileList: FoundFile[] = [];
  //     const s = await upload().getFiles(dir, ext, fileList);
  //     const rootDir: string = path.dirname(__dirname);
  //     expect(s).toEqual([
  //       {
  //         name: "report-20190403-233436.html",
  //         path: `${rootDir}/slack/test/reportSingle/report-20190403-233436.html`,
  //         type: "html"
  //       }
  //     ]);
  //   });
  //   test("Returns an empty array if no specified filetypes are found ", async () => {
  //     const dir: string = path.join(__dirname, "../slack/test/reportSingle");
  //     const ext: string = ".htm";
  //     const fileList: FoundFile[] = [];
  //     const s = await upload().getFiles(dir, ext, fileList);
  //     expect(s).toEqual([]);
  //   });
  //   test("Returns an empty array if no specified filetypes are found ", async () => {
  //     const dir: string = path.join(__dirname, "../slack/test/reportSingle");
  //     const ext: string = ".htm";
  //     const fileList: FoundFile[] = [];
  //     const s = await upload().getFiles(dir, ext, fileList);
  //     expect(s).toEqual([]);
  //   });
  //   test("Returns an empty array if the directory is not found", async () => {
  //     const dir: string = path.join(__dirname, "../doesntexist");
  //     const ext: string = ".htm";
  //     const fileList: FoundFile[] = [];
  //     const s = await upload().getFiles(dir, ext, fileList);
  //     expect(s).toEqual([]);
  //   });

  //   test("Can process nested folders", async () => {
  //     const dir: string = path.join(__dirname, "../slack/test/nestedfolder");
  //     const ext: string = ".png";
  //     const fileList: FoundFile[] = [];
  //     const s = await upload().getFiles(dir, ext, fileList);
  //     expect(s).toHaveLength(2);
  //   });
  // });
