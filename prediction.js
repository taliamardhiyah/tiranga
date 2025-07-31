
// --- Konfigurasi ---
const botToken = '8044580404:AAER7Wx0BKPmDtskjZA5dDD2oZHLzh0MXnE'; // Ganti dengan token bot Telegram kamu
const chatId = '-46707449417'; // Ganti dengan ID chat Telegram kamu
const baseUrl = 'https://pasificrim.live'; // Ganti dengan base URL yang benar
const historyUrl = `${baseUrl}/api/webapi/GetNoaverageEmerdList`; // api get history data
const resultUrl = `${baseUrl}/api/webapi/GetMyEmerdList`; //api get history result
const smallNumbers = [0, 1, 2, 3, 4];
const bigNumbers = [5, 6, 7, 8, 9];
const redNumbers = [2, 4, 6, 8];
const greenNumbers = [1, 3, 7, 9];
const redPurpleNumbers = [0];
const greenPurpleNumbers = [5];
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMTMsImlkX3VzZXIiOiIxNTkzNiIsInBob25lIjoiMTMxMjUiLCJ0b2tlbiI6ImY4NjhjZDRmODIwNTU0ZjFlNzBiN2Y4YzhiZmNhMTY4IiwibmFtZV91c2VyIjoiTWVtYmVyNTE0MDQiLCJwbGFpbl9wYXNzd29yZCI6IjEyMzQxMjM0IiwidG90YWxfbW9uZXkiOjgyMDIxODg5LCJpbnZpdGVyX21vbmV5IjowLCJyb3Nlc19mMSI6MTc3NDUwOTUsInJvc2VzX2YiOjY4MTgyMTY5LCJyb3Nlc190b2RheSI6OTczMywibGV2ZWwiOjEsInJhbmsiOjEsImNvZGUiOiJvQ3RQSjI4MDYwIiwiaW52aXRlIjoiNmZHR3c0MjQwMCIsImN0diI6IjAwMDAwMCIsIm90cCI6IjQ0NDA5NCIsInRvZGF5IjoiMjAyMy0xMC0wNFQxMjowMDoyNS4wMDBaIiwidGltZV9vdHAiOiIwIiwidXNlcl9sZXZlbCI6MywiaGFzX3JlY2VpdmVkX2JvbnVzIjowLCJtZW1iZXJfdHlwZSI6Im5ldyJ9LCJ0aW1lTm93IjoxNzQyODQ0Njc0OTIzLCJpYXQiOjE3NDI4NDkxNDAsImV4cCI6MTc0MjkzNTU0MH0.Kr1CyREkfaSePn2lhQ0D-wDRSETYTqd5rt-OLeEBznQ';

// --- Fungsi Bantuan ---

/**
 * @description Generate Telegram url
 * @param {string} token
 * @param {string} message
 * @returns Telegram url
 */
const getTelegramUrl = (token, message) => `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

/**
 * @description Get random prediction
 * @returns Object {number, type, color}
 */
const getRandomPrediction = () => {
    const number = Math.floor(Math.random() * 10); // Angka 0-9 acak
    const type = smallNumbers.includes(number) ? "Kecil" : "Besar";
    let color = "";
    if (redNumbers.includes(number)) {
        color = "Merah";
    } else if (greenNumbers.includes(number)) {
        color = "Hijau";
    } else if (redPurpleNumbers.includes(number)) {
        color = "Merah Ungu";
    } else if (greenPurpleNumbers.includes(number)) {
        color = "Hijau Ungu";
    }
    return { number, type, color };
};

/**
 * @description Get the next period
 * @returns string next period
 */
const getNextPeriod = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const currentPeriod = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${minutes}`;
    const nextPeriod = currentPeriod + (minutes + 1);

    return nextPeriod;
};

/**
 * @description Get History data
 * @param {string} url
 * @returns {Promise<any>} Object response
 */
const fetchHistoryData = async (url) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': `token=${token};`, // Ganti dengan token yang benar
            },
            body: '{}' // Adding an empty object for body.
        });
        console.log("Response History: ", response);
        console.log("Response Headers History: ", response.headers); // Log headers
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        console.log("Response Text History: ", responseText); // Log response text
        const responseJson = JSON.parse(responseText);
        console.log("Json History Data: ", responseJson);
        return responseJson;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
};

/**
 * @description Get result data
 * @param {string} url
 * @returns {Promise<any>} Object response
 */
const fetchResultData = async (url) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': `token=${token};`, // Ganti dengan token yang benar
            },
            body: '{}'// Adding an empty object for body.
        });
        console.log("Response Result: ", response);
        console.log("Response Headers Result: ", response.headers); // Log headers
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseText = await response.text();
        console.log("Response Text Result: ", responseText); // Log response text
        const responseJson = JSON.parse(responseText);
        console.log("Json Result Data: ", responseJson);
        return responseJson;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
};

/**
 * @description Check result for current period
 * @param {string} currentPeriod
 * @param {Array} historyData
 * @param {string} predictedNumber
 * @param {string} predictedType
 * @param {string} predictedColor
 * @returns Object {result: 'Menang' or 'Kalah', message}
 */
const checkPeriodResult = (currentPeriod, historyData, predictedNumber, predictedType, predictedColor) => {
    const result = historyData.find(item => item.period === currentPeriod);
    if (result) {
        const realNumber = result.number;
        const realType = smallNumbers.includes(realNumber) ? "Kecil" : "Besar";
        let realColor = "";
        if (redNumbers.includes(realNumber)) {
            realColor = "Merah";
        } else if (greenNumbers.includes(realNumber)) {
            realColor = "Hijau";
        } else if (redPurpleNumbers.includes(realNumber)) {
            realColor = "Merah Ungu";
        } else if (greenPurpleNumbers.includes(realNumber)) {
            realColor = "Hijau Ungu";
        }

        if (predictedNumber === realNumber && predictedType === realType && predictedColor === realColor) {
            return { result: 'Menang', message: `Selamat! Prediksi Benar: ${currentPeriod} - Nomor: ${predictedNumber} (${predictedType} - ${predictedColor})` };
        } else {
            return { result: 'Kalah', message: `Maaf! Prediksi Salah: ${currentPeriod} - Prediksi: ${predictedNumber} (${predictedType} - ${predictedColor}), Hasil: ${realNumber} (${realType} - ${realColor})` };
        }
    } else {
        return { result: 'Belum Ada Hasil', message: `Periode ${currentPeriod} belum ada hasilnya.` };
    }
};

/**
 * @description Send message to telegram
 * @param {string} url
 */
const sendMessageToTelegram = async (url) => {
    try {
        await fetch(url);
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
};

/**
 * @description Get the next prediction pattern
 * @param {Array} lastPredictions
 * @returns Object {type}
 */
const getPredictionPattern = (lastPredictions) => {
    const pattern = 'bbkbkkbb';
    const patternIndex = lastPredictions.length % pattern.length;
    const nextPattern = pattern[patternIndex];

    return { type: nextPattern === 'b' ? 'Besar' : 'Kecil' };
};

// --- Fungsi Utama ---
const main = async () => {
    // 1. Mendapatkan periode yang akan datang (simulasi)
    const nextPeriod = getNextPeriod();

    // 5. Mendapatkan data riwayat
    const historyData = await fetchHistoryData(historyUrl);

    //6. Mendapatkan hasil data
    const resultData = await fetchResultData(resultUrl);
    if (historyData.data) {
        // 2. Mendapatkan prediksi berdasarkan pola dan history data
        const lastPredictions = historyData.data.map(item => item.amount >= 5 ? 'b' : 'k');
        const predictionPattern = getPredictionPattern(lastPredictions);

        let number = Math.floor(Math.random() * 10);
        let color = "";

        if (predictionPattern.type == 'Kecil') {
            number = smallNumbers[Math.floor(Math.random() * smallNumbers.length)];
        } else if (predictionPattern.type == 'Besar') {
            number = bigNumbers[Math.floor(Math.random() * bigNumbers.length)];
        }
        if (redNumbers.includes(number)) {
            color = "Merah";
        } else if (greenNumbers.includes(number)) {
            color = "Hijau";
        } else if (redPurpleNumbers.includes(number)) {
            color = "Merah Ungu";
        } else if (greenPurpleNumbers.includes(number)) {
            color = "Hijau Ungu";
        }
        // 3. Mempersiapkan pesan untuk Telegram
        const predictionMessage = `Prediksi Periode ${nextPeriod}: Nomor ${number} (${predictionPattern.type} - ${color})`;
        const telegramUrl = getTelegramUrl(botToken, predictionMessage);

        // 4. Mengirim prediksi ke Telegram (asynchronous)
        sendMessageToTelegram(telegramUrl);
        console.log('Mengirim prediksi:', predictionMessage);

        // 7. Memeriksa hasil untuk periode tertentu (contoh: periode saat ini)
        if (resultData.data && resultData.data.length > 0) {
            const checkResult = checkPeriodResult(resultData.data[0].period, historyData.data, number, predictionPattern.type, color);

            // 8. Mempersiapkan pesan hasil ke Telegram
            const resultMessage = checkResult.message;
            const telegramResultUrl = getTelegramUrl(botToken, resultMessage);

            // 9. Mengirim pesan hasil ke Telegram (asynchronous)
            sendMessageToTelegram(telegramResultUrl);
            console.log(checkResult);
        } else {
            console.log("Result data is empty");
        }
    }
};

// --- Menjalankan Fungsi Utama ---
main();