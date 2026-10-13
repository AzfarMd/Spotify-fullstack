const { ImageKit } = require("@imagekit/nodejs")


let ImageKitClient = null;

function getImageKitClient() {
    if (!ImageKitClient) {
        ImageKitClient = new ImageKit({
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY || 'default_dev_placeholder_key',
        });
    }
    return ImageKitClient;
}

async function uploadFile(file) {
    const client = getImageKitClient();
    const result = await client.files.upload({
        file,
        fileName: "music_" + Date.now(),
        folder: "yt-complete-backend/music"
    })

    return result;
}


module.exports = { uploadFile }