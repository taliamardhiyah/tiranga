import connection from "../config/connectDB.js";

// Helper: generate period unik tiap 10 detik
function getCurrentCrashPeriod() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  let base = `${yyyy}${mm}${dd}`;
  const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const period = 4000 + Math.floor(nowTime / 10);
  return `${base}${period}`;
}

// Render halaman crash
export const crashPage = async (req, res) => {
  const auth = req.cookies.auth;
  let saldo = 0;
  if (auth) {
    const [userRows] = await connection.query("SELECT money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
    saldo = userRows[0]?.money || 0;
  }
  res.render("bet/crash1/crash.ejs", { auth, saldo });
};

// Submit taruhan
export const betCrash = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });
  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount < 1000) return res.json({ status: false, message: "Minimal 1000" });

  const [userRows] = await connection.query("SELECT phone, money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
  const user = userRows[0];
  if (!user) return res.json({ status: false, message: "User not found" });
  if (user.money < amount) return res.json({ status: false, message: "Saldo tidak cukup" });

  const period = getCurrentCrashPeriod();
  await connection.query(
    "INSERT INTO crash_bets (phone, period, amount, status, created_at) VALUES (?, ?, ?, 0, NOW())",
    [user.phone, period, amount]
  );
  await connection.query("UPDATE users SET money = money - ? WHERE phone = ?", [amount, user.phone]);
  res.json({ status: true, message: "Bet berhasil", period });
};

// Ambil status multiplier & history
export const getCrashStatus = async (req, res) => {
  const period = getCurrentCrashPeriod();
  const [resultRows] = await connection.query(
    "SELECT * FROM crash_results WHERE period = (SELECT MAX(period) FROM crash_results WHERE period < ?)",
    [period]
  );
  let result = resultRows[0] || {};
  const [historyRows] = await connection.query(
    "SELECT period, crash_at FROM crash_results WHERE period < ? ORDER BY period DESC LIMIT 20",
    [period]
  );
  let saldo = 0;
  const auth = req.cookies.auth;
  if (auth) {
    const [userRows] = await connection.query("SELECT money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
    saldo = userRows[0]?.money || 0;
  }
  const now = new Date();
  const detik = now.getSeconds();
  const sisa = 10 - (detik % 10);
  res.json({
    period,
    crash_at: result.crash_at,
    countdown: sisa,
    history: historyRows,
    saldo
  });
};

// Cashout
export const cashoutCrash = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });
  const { period, multiplier } = req.body;
  if (!period || !multiplier) return res.json({ status: false, message: "Data tidak lengkap" });

  const [betRows] = await connection.query(
    "SELECT * FROM crash_bets WHERE period = ? AND status = 0 AND phone = (SELECT phone FROM users WHERE token = ? AND veri = 1 LIMIT 1)",
    [period, auth]
  );
  const bet = betRows[0];
  if (!bet) return res.json({ status: false, message: "Bet tidak ditemukan" });

  const winAmount = Math.floor(bet.amount * multiplier);
  await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [winAmount, bet.phone]);
  await connection.query(
    "UPDATE crash_bets SET status = 1, win_amount = ?, cashout_multiplier = ? WHERE id = ?",
    [winAmount, multiplier, bet.id]
  );
  res.json({ status: true, message: "Cashout berhasil", winAmount });
};