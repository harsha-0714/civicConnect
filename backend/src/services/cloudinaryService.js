const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {

    console.log("Uploading image...");
    console.log("Buffer Size:", buffer.length);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "CivicConnect",
        resource_type: "image"
      },
      (error, result) => {

        if (error) {
          console.log("UPLOAD ERROR");
          console.dir(error, { depth: null });
          return reject(error);
        }

        console.log("UPLOAD SUCCESS");
        console.log(result);

        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = uploadToCloudinary;