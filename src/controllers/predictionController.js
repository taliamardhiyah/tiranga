const mysql = require('mysql2/promise');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = '6844953276:AAE3OiWsYM4musWVw1Iy4_20sJDkc6bmIiM';
const CHAT_ID = '-1001460863353';
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Koneksi ke database
const dbConfig = {
    host: 'localhost',
    user: 'root', // Ganti sesuai konfigurasi
    password: '786lottery', // Ganti jika ada password
    database: 'tirangasgame' // Sesuaikan dengan nama database
};

const sendPrediction = async () => {
    let connection;
    try {
        console.log("📡 Menghubungkan ke database...");
        connection = await mysql.createConnection(dbConfig);
        
        // Ambil periode terbaru untuk game "wingo"
        const [rows] = await connection.execute(`
            SELECT period, amount FROM wingo 
            WHERE game = 'wingo'
            ORDER BY period DESC 
            LIMIT 1
        `);
if (rows.length === 0) {
    console.log("Tidak ada data terbaru di tabel wingo.");
    await connection.end();
    return;
}

const period = rows[0].period;
const number = rows[0].amount; // Menggunakan amount jika tidak ada kolom "number"


        console.log(`📌 Data ditemukan: Periode = ${period}, Number = ${number}`);

        if (number === null || number === undefined) {
            console.log(`⚠️ Data tidak valid! Number kosong atau undefined.`);
            return;
        }

        // Tentukan prediksi berdasarkan pola tetap
        const pattern = ['B', 'K', 'K', 'B'];
        const randomIndex = Math.floor(Math.random() * pattern.length);
        const prediction = pattern[randomIndex];

        // Tentukan hasil sesuai angka
        const isBig = [5, 6, 7, 8, 9].includes(number);
        const result = isBig ? 'Besar' : 'Kecil';
        const status = prediction === result ? 'Menang ✅' : 'Kalah ❌';

        const message = `🎯 Prediksi Wingo
📌 Periode: ${period}
📊 Prediksi: ${prediction}
🎲 Hasil: ${result}
🏆 Status: ${status}`;

        console.log("🚀 Mengirim pesan ke Telegram...");
        await bot.sendMessage(CHAT_ID, message);
        console.log("✅ Pesan berhasil dikirim ke Telegram!");

    } catch (error) {
        console.error('❌ Gagal mengambil data atau mengirim prediksi:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log("🔌 Koneksi database ditutup.");
        }
    }
};


// Gunakan interval yang lebih aman (agar tidak memulai sebelum selesai)
const startPredictionLoop = async () => {
    while (true) {
        await sendPrediction();
        await new Promise(resolve => setTimeout(resolve, 10000)); // Tunggu 10 detik
    }
};

startPredictionLoop();

module.exports = { sendPrediction };
