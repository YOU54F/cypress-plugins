import "jest";
import * as upload from "./upload";
// tslint:disable-next-line: no-var-requires
const AWS = require("aws-sdk");

import { logger } from "../logger";
const uploader = upload;
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
      const mockerUploadMochaAwesome = jest.spyOn(
        uploader,
        "uploadMochaAwesome"
      );
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
