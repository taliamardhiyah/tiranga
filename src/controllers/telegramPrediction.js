// telegramPrediction.js
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const connection = require("../config/connectDB");

// Konfigurasi bot telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

// Array untuk menyimpan history message_id prediksi (maks 20 pesan)
let predictionHistory = [];

/**
 * Fungsi untuk menentukan prediksi periode selanjutnya
 * Berdasarkan pola tetap dan jumlah data historis
 */
async function getNextPrediction() {
  // Dapatkan periode saat ini (misalnya, dari tabel wingo dengan status 0)
  const [winGoNow] = await connection.query(
    "SELECT period FROM wingo WHERE status = 0 ORDER BY id DESC LIMIT 1"
  );
  if (!winGoNow[0]) {
    throw new Error("Tidak ada data periode saat ini");
  }
  let currentPeriod = winGoNow[0].period;
  // Misalnya, prediksi untuk periode selanjutnya
  let nextPeriod = parseInt(currentPeriod) + 1;

  // Ambil jumlah data historis (hasil periode yang sudah selesai)
  const [history] = await connection.query(
    "SELECT COUNT(*) as count FROM wingo WHERE status != 0"
  );
  let count = history[0].count || 0;

  // Pola prediksi yang diberikan
  const pattern = "BBKKKKBKBKBBBKKK"; // Panjang: 16 karakter
  // Tentukan indeks berdasarkan sisa pembagian jumlah data historis dengan panjang pola
  let index = count % pattern.length;
  let predictionLetter = pattern.charAt(index);
  let predictionText = predictionLetter === 'B' ? "Big" : "Small";

  return { nextPeriod, predictionText, pattern };
}

/**
 * Fungsi untuk mengirim prediksi ke group Telegram
 */
async function sendTelegramPrediction() {
  try {
    // Dapatkan prediksi untuk periode selanjutnya
    const { nextPeriod, predictionText, pattern } = await getNextPrediction();
    // Bangun pesan prediksi
    let message = `Prediksi Periode ${nextPeriod}:\nHasil Prediksi: ${predictionText}\nPola: ${pattern}`;

    // Kirim pesan ke group Telegram
    let sentMessage = await bot.sendMessage(TELEGRAM_CHAT_ID, message);

    // Simpan message_id ke dalam history
    predictionHistory.push(sentMessage.message_id);

    // Jika history lebih dari 20 pesan, hapus pesan yang paling lama
    if (predictionHistory.length > 20) {
      let messageIdToDelete = predictionHistory.shift();
      await bot.deleteMessage(TELEGRAM_CHAT_ID, messageIdToDelete);
    }
    console.log(`Prediksi untuk periode ${nextPeriod} telah dikirim.`);
  } catch (error) {
    console.error("Error mengirim prediksi ke Telegram:", error.message);
  }
}

/**
 * Opsional: Fungsi untuk mengecek outcome periode sebelumnya
 * dan membandingkannya dengan prediksi.
 * Asumsikan kamu memiliki kolom (misalnya, outcome) di tabel wingo.
 */
async function checkPredictionOutcome(period, predictedLetter) {
  const [result] = await connection.query(
    "SELECT outcome FROM wingo WHERE period = ? LIMIT 1",
    [period]
  );
  if (result && result[0]) {
    let actual = result[0].outcome;
    if (actual === predictedLetter) {
      return { period, status: "Menang", predicted: predictedLetter, actual };
    } else {
      return { period, status: "Kalah", predicted: predictedLetter, actual };
    }
  }
  return null;
}

// Ekspor fungsi untuk digunakan di tempat lain (misalnya, scheduler)
module.exports = {
  sendTelegramPrediction,
  checkPredictionOutcome
};
