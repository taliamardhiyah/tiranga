const axios = require('axios');
const TELEGRAM_BOT_TOKEN = "6844953276:AAE3OiWsYM4musWVw1Iy4_20sJDkc6bmIiM";
const CHAT_IDS = ["-1001460863353", "-1001834989539"];
const API_URL = "https://pasificrim.live/api/webapi/admin/totalJoin";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMTMsImlkX3VzZXIiOiIxNTkzNiIsInBob25lIjoiMTMxMjUiLCJ0b2tlbiI6IjZlNzZmOTMxODkyNjg5YmQyNzQyMmJlMmY3OWFlZDg5IiwibmFtZV91c2VyIjoiTWVtYmVyNTE0MDQiLCJwbGFpbl9wYXNzd29yZCI6IjEyMzQxMjM0IiwidG90YWxfbW9uZXkiOjc3Njg4Mzg5LCJpbnZpdGVyX21vbmV5IjowLCJyb3Nlc19mMSI6MTczNjMxOTUsInJvc2VzX2YiOjI4ODg1MTU0LCJyb3Nlc190b2RheSI6ODc4MDAsImxldmVsIjoxLCJyYW5rIjoxLCJjb2RlIjoib0N0UEoyODA2MCIsImludml0ZSI6IjZmR0d3NDI0MDAiLCJjdHYiOiIwMDAwMDAiLCJvdHAiOiI0NDQwOTQiLCJ0b2RheSI6IjIwMjMtMTAtMDRUMTI6MDA6MjUuMDAwWiIsInRpbWVfb3RwIjoiMCIsInVzZXJfbGV2ZWwiOjEsImhhc19yZWNlaXZlZF9ib251cyI6MCwibWVtYmVyX3R5cGUiOiJuZXcifSwidGltZU5vdyI6MTc0MTQ5Nzg5MTE3OCwiaWF0IjoxNzQxNTUxOTk3LCJleHAiOjE3NDE2MzgzOTd9.AfgeY_ruEMW395dzu3VZ9ofaw25imlXoWb57vZQnPD4"; // Ganti dengan token auth kamu

let predictionsHistory = [];

async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    for (let chatId of CHAT_IDS) {
        try {
            await axios.post(url, {
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown"
            });
        } catch (error) {
            console.error("Gagal kirim pesan ke Telegram:", error.message);
        }
    }
}

function predictNextResult() {
    return Math.random() < 0.5 ? "Kecil" : "Besar";
}

async function checkResults() {
    try {
        const response = await axios.post(API_URL, {}, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
        });
        const data = response.data;
        
        if (!data.lotterys || data.lotterys.length === 0) return;
        let latestLottery = data.lotterys[0];
        let lastPeriod = latestLottery.period;

        let lastOrder = data.list_orders.find(order => order.period === lastPeriod);
        if (!lastOrder) return;

        let resultCategory = lastOrder.amount >= 5 ? "Besar" : "Kecil";
        let previousPrediction = predictionsHistory.length ? predictionsHistory[predictionsHistory.length - 1].prediction : "Tidak Ada";
        let isWin = previousPrediction === resultCategory;

        let statusMessage = isWin ? "🏆 Menang!" : "❌ Kalah!";
        sendTelegramMessage(`🎯 *Hasil Periode ${lastPeriod}*
🔮 *Prediksi:* ${previousPrediction}
🎲 *Hasil:* ${resultCategory}
🏆 *Status:* ${statusMessage}`);

        let nextPrediction = predictNextResult();
        let nextPeriod = (parseInt(lastPeriod) + 1).toString();
        
        predictionsHistory.push({ period: nextPeriod, prediction: nextPrediction, result: "Belum Ada", status: "Menunggu" });
        if (predictionsHistory.length > 20) predictionsHistory.shift();
        
        sendTelegramMessage(`📢 *Prediksi Periode ${nextPeriod}: ${nextPrediction}*`);
    } catch (error) {
        console.error("Gagal mengambil data:", error.message);
    }
}

setInterval(checkResults, 5000);
