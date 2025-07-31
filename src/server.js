import 'dotenv/config'
import express from 'express';
import configViewEngine from './config/configEngine';
import routes from './routes/web';
import cronJobContronler from './controllers/cronJobContronler';
import socketIoController from './controllers/socketIoController';
import { processRedBlackResult } from './controllers/redBlackController.js';
import { processGreenResult, processGreenBonusTO } from './controllers/greenGameController.js'; // <-- ini
import schedule from 'node-schedule';
import greenGameRoutes from './routes/greenGameRoutes.js';
import apisaldo from './routes/apiSaldo.js';
import crashRoutes from "./routes/crashRoutes.js";
import miningRoutes from "./routes/miningRoutes.js";
import { processMiningProfit } from './controllers/miningController.js';
// ...existing code...
import classicDiceRouter from "./routes/classicDice.js";


require('dotenv').config();
let cookieParser = require('cookie-parser');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 7000;

app.use(cookieParser());
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mount route
app.use(apisaldo); // ini menangani /api/saldo
app.use('/green', greenGameRoutes); // aksesnya jadi: /green/, /green/bet, /green/status
app.use("/crash", crashRoutes);
app.use("/mining", miningRoutes);
app.use("/classic-dice", classicDiceRouter);
// ...existing code...

// setup viewEngine
configViewEngine(app);
// init Web Routes
routes.initWebRouter(app);

// Cron game 1 Phut 
cronJobContronler.cronJobGame1p(io);

// Periksa apakah saya telah terhubung ke server. 
socketIoController.sendMessageAdmin(io);


// app.all('*', (req, res) => {
//     return res.render("404.ejs"); 
// });
// Jalankan setiap 20 detik
// setInterval(processRedBlackResult, 20000);

// Tambahan paling bawah (sebelum server.listen)
function scheduleRedBlackCron() {
  const now = new Date();
  const detik = now.getSeconds();
  const delay = (20 - (detik % 20)) * 1000;
  setTimeout(() => {
    setInterval(processRedBlackResult, 20000);
  }, delay);
}
scheduleRedBlackCron();

// Optional route manual trigger (opsional untuk debugging)
app.get("/api/redblack/reprocess", async (req, res) => {
  try {
    await processRedBlackResult();
    res.send("Diproses ulang");
  } catch (e) {
    res.status(500).send("Gagal proses ulang");
  }
});

// Cron green
function scheduleGreenCron() {
  const now = new Date();
  const detik = now.getSeconds();
  const delay = (15 - (detik % 15)) * 1000;
  setTimeout(() => {
    setInterval(processGreenResult, 15000);
  }, delay);
}
scheduleGreenCron();

// Bonus TO harian
schedule.scheduleJob('0 0 * * *', processGreenBonusTO);


// Jalankan setiap jam (3600000 ms)
//setInterval(() => {
  //processMiningProfit();
//}, 60 * 60 * 1000);

// Untuk testing, bisa pakai tiap menit:
setInterval(() => {
  processMiningProfit();
}, 60 * 1000);
  
// Middleware untuk menangani error agar server tidak crash
app.use((err, req, res, next) => {
    console.error("Terjadi error:", err.stack);
    res.status(500).json({ message: "Terjadi kesalahan di server", error: err.message });
});

// Pastikan server sudah siap sebelum listen
process.on('uncaughtException', (err) => {
    console.error("Uncaught Exception:", err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
});

// Jalankan server
server.listen(port, () => {
    console.log("✅ Server berhasil berjalan di port: " + port);
});


