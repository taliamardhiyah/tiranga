const cron = require("node-cron");
const { sendTelegramPrediction } = require("./telegramPrediction");

// Jadwalkan setiap 1 menit (ubah dari 5 menit ke 1 menit sesuai kebutuhan)
cron.schedule("*/1 * * * *", () => {
  sendTelegramPrediction();
});
