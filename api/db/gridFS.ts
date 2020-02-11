import { ReadStream } from "fs";
import { GridFSBucket, MongoClient, ObjectId } from "mongodb";

import { mongoUrl } from "./";

const client = new MongoClient(`${mongoUrl}/admin`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ...(process.env.MONGOOSE_DB
    ? {
        auth: {
          user: process.env.MONGO_USER ?? "",
          password: process.env.MONGO_PASSWORD ?? "",
        },
      }
    : {}),
}).connect();

const bucket = new Promise<GridFSBucket>(async (resolve, reject) => {
  try {
    const bucket = new GridFSBucket((await client).db("fire-files"));
    resolve(bucket);
  } catch (err) {
    reject(err);
  }
});

export const removeFileGridFS = (_id: ObjectId) => {
  return new Promise<void>(async resolve => {
    (await bucket).delete(_id, async err => {
      if (err) {
        console.error(err);
      }
      resolve();
    });
  });
};

export const uploadFileGridFSStream = (
  stream: ReadStream,
  filename: string,
  _id: ObjectId
) => {
  return new Promise<{ _id: ObjectId; filename: string }>(
    async (resolve, reject) => {
      try {
        (await bucket).delete(_id, async err => {
          if (err) {
            if (!err.message?.includes("FileNotFound")) {
              console.error(err);
            }
          }

          stream
            .pipe((await bucket).openUploadStreamWithId(_id, filename))
            .on("error", err => {
              reject(err);
            })
            .on(
              "finish",
              ({
                _id,
                filename,
              }: {
                _id: ObjectId;
                length: number;
                chunkSize: number;
                uploadDate: Date;
                filename: string;
                md5: string;
              }) => {
                resolve({ _id, filename });
              }
            );
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    }
  );
};

export const uploadFileGridFSBuffer = (
  buffer: Buffer,
  filename: string,
  _id: ObjectId
) => {
  return new Promise<{ _id: ObjectId; filename: string }>(
    async (resolve, reject) => {
      try {
        (await bucket).delete(_id, async err => {
          if (err) {
            if (!err.message?.includes("FileNotFound")) {
              console.error(err);
            }
          }
          const uploadStream = (await bucket).openUploadStreamWithId(
            _id,
            filename
          );

          uploadStream.end(buffer);

          uploadStream.on("error", err => {
            reject(err);
          });

          uploadStream.on(
            "finish",
            ({
              _id,
              filename,
            }: {
              _id: ObjectId;
              length: number;
              chunkSize: number;
              uploadDate: Date;
              filename: string;
              md5: string;
            }) => {
              resolve({ _id, filename });
            }
          );
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    }
  );
};

export const readFileGridFS = async ({
  filename,
  _id,
}: {
  filename?: string;
  _id?: ObjectId;
}) => {
  if (!filename && !_id) {
    throw new Error("You need to specify filename or _id of the file!");
  }

  if (_id) {
    return (await bucket).openDownloadStream(_id);
  }

  if (filename) {
    return (await bucket).openDownloadStreamByName(filename);
  }
};
