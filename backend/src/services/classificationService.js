const axios = require("axios");
const FormData = require("form-data");

const classifyImage = async (buffer) => {
  try {
    const form = new FormData();

    form.append("file", buffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await axios.post(
      `${process.env.ML_SERVICE}/classify`,
      form,
      {
        headers: form.getHeaders(),
      }
    );

    return response.data;
  } catch (err) {
    console.log("⚠️ AI Service Unavailable");
    return null;
  }
};

module.exports = classifyImage;