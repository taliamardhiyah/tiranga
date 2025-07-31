//projek/src/controllers/grenGameController.js
import connection from "../config/connectDB.js";

// Helper periode 15 detik
function getCurrentPeriod() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  let base = `${yyyy}${mm}${dd}`;
  const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const period = 3000 + Math.floor(nowTime / 15);
  return `${base}${period}`;
}

// Warna & payout
function getColorAndPayout(num) {
  if (num === 0) return { color: "green", payout: 30 };
  if ([1,3,5,7,9,11,13,15,17,19,21,23,25,27,29].includes(num)) return { color: "red", payout: 2 };
  return { color: "black", payout: 2 };
}

export const greenPage = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.redirect("/login");
  let saldo = 0;
  if (auth) {
    const [userRows] = await connection.query("SELECT money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
    saldo = userRows[0]?.money || 0;
  }
  res.render("bet/green/green.ejs", { auth, saldo });
};

// Submit bet
export const betGreen = async (req, res) => {
  const auth = req.cookies.auth;
  console.log("Auth Token:", auth);
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });

  const { betType, amount } = req.body;
  console.log("Incoming Bet:", { betType, amount, typeofAmount: typeof amount });

  const validTypes = ["green", "red", "black"];
  if (!validTypes.includes(betType)) return res.json({ status: false, message: "Invalid bet type" });
  if (!amount || isNaN(amount) || amount < 1000) return res.json({ status: false, message: "Minimal 1000" });

  const [userRows] = await connection.query("SELECT phone, money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
  const user = userRows[0];
  console.log("User found:", user);

  if (!user) return res.json({ status: false, message: "User not found" });

  const parsedAmount = parseInt(amount); // ⬅️ penting!
  if (user.money < parsedAmount) {
    console.log("Saldo kurang:", { userSaldo: user.money, betAmount: parsedAmount });
    return res.json({ status: false, message: "Saldo tidak cukup" });
  }

  const period = getCurrentPeriod();
  console.log("Period:", period);

  await connection.query(
    "INSERT INTO green_bets (phone, period, bet_type, amount, status, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
    [user.phone, period, betType, parsedAmount]
  );
  await connection.query("UPDATE users SET money = money - ? WHERE phone = ?", [parsedAmount, user.phone]);

  res.json({ status: true, message: "Bet berhasil", period });
};


// Proses hasil tiap 15 detik
export const processGreenResult = async () => {
  try {
    const now = new Date();
    const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const currentPeriod = 3000 + Math.floor(nowTime / 15);
    const baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const period = `${baseDate}${currentPeriod - 1}`;

    const [exist] = await connection.query("SELECT * FROM green_results WHERE period = ?", [period]);
    if (exist.length > 0) return;

    // Ambil semua bet pada periode ini
    const [bets] = await connection.query("SELECT * FROM green_bets WHERE period = ? AND status = 0", [period]);
    // Random angka 0-30
    const resultNum = Math.floor(Math.random() * 31);
    const { color, payout } = getColorAndPayout(resultNum);

    await connection.query(
      "INSERT INTO green_results (period, result_num, color, payout, created_at) VALUES (?, ?, ?, ?, NOW())",
      [period, resultNum, color, payout]
    );

    // Proses bet
    for (const bet of bets) {
      let win = false, winAmount = 0;
      if (bet.bet_type === color) {
        win = true;
        winAmount = bet.amount * payout;
        await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [winAmount, bet.phone]);
      }
      await connection.query(
        "UPDATE green_bets SET status = 1, win_amount = ?, result_num = ?, payout = ? WHERE id = ?",
        [winAmount, resultNum, payout, bet.id]
      );
    }
  } catch (err) {
    console.error("Error in processGreenResult:", err);
  }
};

// Bonus TO harian (jalankan tiap jam 00:00)
export const processGreenBonusTO = async () => {
  try {
    // Hitung total taruhan per user hari ini
    const [users] = await connection.query(`
      SELECT phone, SUM(amount) as total_bet
      FROM green_bets
      WHERE DATE(created_at) = CURDATE()
      GROUP BY phone
    `);
    for (const user of users) {
      const bonus = Math.floor(user.total_bet * 0.01);
      if (bonus > 0) {
        await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [bonus, user.phone]);
        await connection.query(
          "INSERT INTO green_bonus (phone, bonus, tanggal) VALUES (?, ?, CURDATE())",
          [user.phone, bonus]
        );
      }
    }
  } catch (err) {
    console.error("Error in processGreenBonusTO:", err);
  }
};


export const getGreenStatus = async (req, res) => {
  const period = getCurrentPeriod();
  // Ambil hasil terakhir
  const [resultRows] = await connection.query(`
    SELECT * FROM green_results 
    WHERE period = (SELECT MAX(period) FROM green_results WHERE period < ?)
  `, [period]);

  // Ambil history 20 hasil terakhir
  const [historyRows] = await connection.query(`
    SELECT period, result_num, color 
    FROM green_results 
    WHERE period < ? 
    ORDER BY period DESC 
    LIMIT 20
  `, [period]);

  // Ambil riwayat bonus jika user login
  const auth = req.cookies.auth;
  let bonus = 0, bonusHistory = [];
  if (auth) {
    const [userRows] = await connection.query("SELECT phone FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
    if (userRows.length) {
      const phone = userRows[0].phone;
      const [bonusRows] = await connection.query("SELECT bonus FROM green_bonus WHERE phone = ? AND tanggal = CURDATE()", [phone]);
      bonus = bonusRows[0]?.bonus || 0;
      const [bonusHistRows] = await connection.query("SELECT bonus, tanggal FROM green_bonus WHERE phone = ? ORDER BY tanggal DESC LIMIT 10", [phone]);
      bonusHistory = bonusHistRows;
    }
  }

  // Tambahkan bagian RIWAYAT TARUHAN
  // Ambil riwayat taruhan user jika login
  let betHistory = [];
  if (auth) {
    const [userRows] = await connection.query("SELECT phone FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
    if (userRows.length) {
      const phone = userRows[0].phone;
const [betRows] = await connection.query(`
  SELECT green_bets.period, green_bets.bet_type AS bet_color, green_bets.amount AS bet_amount, green_results.result_num, green_results.color
  FROM green_bets 
  LEFT JOIN green_results ON green_bets.period = green_results.period
  WHERE green_bets.phone = ?
  ORDER BY green_bets.id DESC 
  LIMIT 60
`, [phone]);

      betHistory = betRows;
    }
  }


  // Kirim semua ke frontend
  const now = new Date();
  const detik = now.getSeconds();
  const sisa = 15 - (detik % 15);
  res.json({
    period,
    result_num: resultRows[0]?.result_num,
    color: resultRows[0]?.color,
    countdown: sisa,
    history: historyRows,
    bonus,
    bonusHistory,
    betHistory, // <-- DITAMBAHKAN
  });
};
