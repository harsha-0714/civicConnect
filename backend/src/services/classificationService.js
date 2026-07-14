const axios = require("axios");
const FormData = require("form-data");

async function classifyImage(imageBuffer) {

    try {

        const form = new FormData();

        form.append("file", imageBuffer, {
            filename: "image.jpg",
            contentType: "image/jpeg"
        });

        const response = await axios.post(
            process.env.ML_SERVICE + "/classify",
            form,
            {
                headers: form.getHeaders()
            }
        );

        return response.data;

    } catch (error) {

        console.log("AI Service Unavailable");

        return null;

    }

}

module.exports = classifyImage;