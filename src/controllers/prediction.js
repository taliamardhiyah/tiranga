// --- Konfigurasi ---
const botToken = '8044580404:AAER7Wx0BKPmDtskjZA5dDD2oZHLzh0MXnE'; // Ganti dengan token bot Telegram kamu
const chatId = '-46707449417'; // Ganti dengan ID chat Telegram kamu
const historyUrl = '/api/webapi/GetNoaverageEmerdList'; // api get history data
const resultUrl = '/api/webapi/GetMyEmerdList'; //api get history result
const smallNumbers = [0, 1, 2, 3, 4];
const bigNumbers = [5, 6, 7, 8, 9];
const redNumbers = [2, 4, 6, 8];
const greenNumbers = [1, 3, 7, 9];
const redPurpleNumbers = [0];
const greenPurpleNumbers = [5];

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
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
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
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
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

// --- Fungsi Utama ---
const main = async () => {
    // 1. Mendapatkan periode yang akan datang (simulasi)
    const nextPeriod = getNextPeriod();

    // 2. Menghasilkan prediksi acak
    const prediction = getRandomPrediction();

    // 3. Mempersiapkan pesan untuk Telegram
    const predictionMessage = `Prediksi Periode ${nextPeriod}: Nomor ${prediction.number} (${prediction.type} - ${prediction.color})`;
    const telegramUrl = getTelegramUrl(botToken, predictionMessage);

    // 4. Mengirim prediksi ke Telegram (asynchronous)
    sendMessageToTelegram(telegramUrl);
    console.log('Mengirim prediksi:', predictionMessage);

    // 5. Mendapatkan data riwayat
    const historyData = await fetchHistoryData(historyUrl);

    //6. Mendapatkan hasil data
    const resultData = await fetchResultData(resultUrl);

    if(historyData.data){
        // 7. Memeriksa hasil untuk periode tertentu (contoh: periode saat ini)
        const checkResult = checkPeriodResult(resultData.data[0].period, historyData.data, prediction.number, prediction.type, prediction.color);

        // 8. Mempersiapkan pesan hasil ke Telegram
        const resultMessage = checkResult.message;
        const telegramResultUrl = getTelegramUrl(botToken, resultMessage);

        // 9. Mengirim pesan hasil ke Telegram (asynchronous)
        sendMessageToTelegram(telegramResultUrl);
        console.log(checkResult);
    }
};

// --- Menjalankan Fungsi Utama ---
main();