const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const Jimp = require('jimp');

// Telegram bot API token
const token = '';
// Initialize Telegram Bot
const bot = new TelegramBot(token, { polling: true });

// Reset state variables and flags after executing a command
function resetCommandState() {
    // Clear state variables
    stateVariable = 'default';

    // Reset flags
    flagVariable = false;

    // Clear temporary data
    temporaryData = null;
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (msg.photo && msg.photo.length > 0) {
        const photoId = msg.photo[msg.photo.length - 1].file_id; // Get the latest photo ID
        try {
            const filePath = await bot.getFileLink(photoId); // Get the file path of the received photo
            let overlayFilePath = '';

            // Determine the appropriate overlay based on the command in the caption
            if (msg.caption === '/SLAPME') {
                overlayFilePath = 'yippieSticker.png';
            } else if (msg.caption === '/SLAPMELOFI') {
                overlayFilePath = 'pixelyippie.png';
            }

            if (overlayFilePath) {
                Jimp.read(filePath)
                    .then(async (image) => {
                        const overlay = await Jimp.read(overlayFilePath);
                        overlay.resize(image.bitmap.width, image.bitmap.height); // Resize the overlay image to fit the received image
                        image.composite(overlay, 0, 0); // Composite the overlay image on top of the received image

                        const outputFilePath = 'output.jpg';
                        image.write(outputFilePath); // Save the modified image
                        bot.sendPhoto(chatId, outputFilePath); // Send the modified image back to the user
                        resetCommandState(); // Call the resetCommandState function after executing a command
                    })
                    .catch(error => {
                        console.error(`Error 102: Image Processing Failed - ${error.message}`);
                        bot.sendMessage(chatId, "Error 102: Failed to process image.");
                    });
            } else {
                console.error('Error 101: No valid command found or overlay not specified.');
                bot.sendMessage(chatId, "Error 101: No valid command or overlay.");
            }
        } catch (error) {
            console.error(`Error 103: File Access Error - ${error.message}`);
            bot.sendMessage(chatId, "Error 103: Failed to retrieve photo file.");
        }
    } else {
        console.error('Error 104: No photo found or incorrect command format.');
        bot.sendMessage(chatId, "Error 104: No photo found or command format incorrect.");
    }
});
