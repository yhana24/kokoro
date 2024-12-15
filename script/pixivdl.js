const nexo = require('nexo-aio-downloader');
const fs = require('fs');
const path = require('path');

module.exports["config"] = {
    name: "pixivdl",
    version: "69",
    info: "Automatically downloads pixiv artwork from provided link",
    credits: "Kenneth Panio"
};

// URL patterns for supported platforms
const patterns = {
    pixiv: /https:\/\/www\.pixiv\.net\/en\/artworks\/\d+/g,
    piximg: /https:\/\/i\.pximg\.net\/img-original\/img\/\d{4}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d{2}\/\d+_p\d+\.\w+/g
};

const cacheDirectory = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDirectory)) {
    fs.mkdirSync(cacheDirectory);
}

// Retry logic for downloading media with a limit of 5 retries
const handleDownloadWithRetry = async (link, chat, retries = 5) => {
    let attempt = 0;
    let success = false;

    while (attempt < retries && !success) {
        try {
            console.log(`Attempt ${attempt + 1} to download media.`);
            await handleDownload(link, chat);  // Try downloading media
            success = true;  // If no error, mark as success
            console.log('Download succeeded.');
        } catch (error) {
            attempt++;
            console.log(`Error downloading media (attempt ${attempt}): ${error.message}`);
            if (attempt >= retries) {
                console.log("Failed to download after multiple attempts.");
            } else {
                console.log(`Retrying... (${attempt}/${retries})`);
            }
        }
    }
};

// Function to download and handle the media
const handleDownload = async (link, chat) => {
    let result;
    if (patterns.piximg.test(link)) {
        return chat.reply({ attachment: await chat.stream(link) });
    }

    if (patterns.pixiv.test(link)) {
        result = await nexo.pixiv(link, "67810484_7m19rKBovfGD9pqr73Xi1drPOh4cynEG");
    } else {
        throw new Error('Unsupported URL');
    }

    if (result && result.data && result.data.result) {
        const mediaFiles = result.data.result;
        if (mediaFiles.length > 0) {
            console.log('PIXIV ARTWORK DOWNLOADING...');

            // Collect the promises for downloading all media
            const mediaPromises = mediaFiles.map(media =>
                streamFile(media.buffer, media.type, chat)
            );

            // Wait for all media to download and stream them together
            const allMedia = await Promise.all(mediaPromises);
            await chat.reply({ attachment: allMedia });
        } else {
            throw new Error('No media found.');
        }
    } else {
        throw new Error('Failed to retrieve media.');
    }
};

// Function to stream a single file
const streamFile = async (buffer, filetype, chat) => {
    try {
        // Create a temporary file path
        const filePath = path.join(__dirname, 'cache', `media_${Date.now()}.${filetype}`);

        // Write the Buffer to a file
        fs.writeFileSync(filePath, buffer);

        // Return the file as a readable stream
        return fs.createReadStream(filePath);
    } catch (error) {
        console.log(`Error processing file: ${error.message}`);
    }
};

module.exports["handleEvent"] = async ({
    chat, event, font
}) => {
    const message = event.body;
    if (!message) return;

    const urlRegex = Object.values(patterns).reduce((acc, regex) => acc + `|(${regex.source})`, '').slice(1);
    const regex = new RegExp(urlRegex, 'g');
    let match;

    while ((match = regex.exec(message)) !== null) {
        await chat.reply(font.thin("PIXIV ARTWORK LINK DETECTED!"));
        await handleDownloadWithRetry(match[0], chat);  // Use the retry function
    }
};

module.exports["run"] = async ({
    chat, font
}) => {
    chat.reply(font.thin("This is an event process that automatically downloads Artworks from Pixiv. Just send me the link, and I will download it directly."));
};