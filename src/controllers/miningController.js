import connection from "../config/connectDB.js";

// Sewa mesin mining
export const sewaMesinMining = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });

  const { amount } = req.body;
  if (!amount || isNaN(amount) || amount < 100000) {
    return res.json({ status: false, message: "Minimal sewa 100.000" });
  }

  const [userRows] = await connection.query("SELECT id, money, vip_level FROM users WHERE token = ? LIMIT 1", [auth]);
  const user = userRows[0];
  if (!user) return res.json({ status: false, message: "User not found" });

  if (user.money < amount) return res.json({ status: false, message: "Saldo tidak cukup" });

  // Hitung cashback berdasarkan VIP
  const cashbackRates = [0.10, 0.15, 0.20, 0.25]; // VIP 0-3
  const cashback = Math.floor(amount * (cashbackRates[user.vip_level] || 0.10));

  // Kurangi saldo
  await connection.query("UPDATE users SET money = money - ? WHERE id = ?", [amount, user.id]);

  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 hari

  await connection.query(
    "INSERT INTO mining_investments (user_id, amount, cashback, start_time, end_time, last_profit_time) VALUES (?, ?, ?, ?, ?, ?)",
    [user.id, amount, cashback, now, end, now]
  );

  if (cashback > 0) {
    await connection.query("UPDATE users SET money = money + ? WHERE id = ?", [cashback, user.id]);
  }

  // Referral bonus 5%
  const [refRows] = await connection.query("SELECT ref_by FROM user_referrals WHERE user_id = ?", [user.id]);
  if (refRows.length && refRows[0].ref_by) {
    const bonus = Math.floor(amount * 0.05);
    await connection.query("UPDATE users SET money = money + ? WHERE id = ?", [bonus, refRows[0].ref_by]);
    await connection.query(
      "INSERT INTO mining_referral_bonus (user_id, from_user_id, investment_id, bonus, bonus_time) VALUES (?, ?, LAST_INSERT_ID(), ?, ?)",
      [refRows[0].ref_by, user.id, bonus, now]
    );
  }

  // Otomatis upgrade VIP
  const [[{ totalInvest }]] = await connection.query(
    "SELECT SUM(amount) as totalInvest FROM mining_investments WHERE user_id = ?", [user.id]
  );

  let newVip = 0;
  if (totalInvest >= 100_000_000) newVip = 3;
  else if (totalInvest >= 10_000_000) newVip = 2;
  else if (totalInvest >= 1_000_000) newVip = 1;

  if (newVip > user.vip_level) {
    await connection.query("UPDATE users SET vip_level = ? WHERE id = ?", [newVip, user.id]);
  }

  res.json({ status: true, message: "Sewa mesin berhasil", cashback });
};


// Proses profit per jam
export const processMiningProfit = async () => {
  const [rows] = await connection.query("SELECT * FROM mining_investments WHERE status = 'active'");
  const now = new Date();

  for (const inv of rows) {
    if (now > inv.end_time) {
      await connection.query("UPDATE users SET money = money + ? WHERE id = ?", [inv.amount, inv.user_id]);
      await connection.query("UPDATE mining_investments SET status = 'completed' WHERE id = ?", [inv.id]);
      continue;
    }

    // Ambil VIP user
    const [vipRow] = await connection.query("SELECT vip_level FROM users WHERE id = ?", [inv.user_id]);
    const vipLevel = vipRow[0]?.vip_level || 0;
    const dailyRates = [0.03, 0.035, 0.04, 0.05];
    const rate = dailyRates[vipLevel];

    const profit = Math.floor(inv.amount * rate / 1440); // per menit
    await connection.query("UPDATE users SET money = money + ? WHERE id = ?", [profit, inv.user_id]);
    await connection.query("UPDATE mining_investments SET total_profit = total_profit + ?, last_profit_time = ? WHERE id = ?", [profit, now, inv.id]);
    await connection.query("INSERT INTO mining_profits (investment_id, user_id, profit, profit_time) VALUES (?, ?, ?, ?)", [inv.id, inv.user_id, profit, now]);
  }
};


// Riwayat mining user
export const getMiningHistory = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false });

  const [userRows] = await connection.query("SELECT id FROM users WHERE token = ? LIMIT 1", [auth]);
  if (!userRows.length) return res.json({ status: false });

  const userId = userRows[0].id;

  const [invests] = await connection.query(
    "SELECT * FROM mining_investments WHERE user_id = ? ORDER BY id DESC",
    [userId]
  );
  const [profits] = await connection.query(
    "SELECT * FROM mining_profits WHERE user_id = ? ORDER BY id DESC LIMIT 1000000",
    [userId]
  );

  res.json({ status: true, invests, profits });
};


// Status mining aktif & VIP
export const getMiningStatus = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false });

  const [userRows] = await connection.query("SELECT id, vip_level FROM users WHERE token = ? LIMIT 1", [auth]);
  if (!userRows.length) return res.json({ status: false });

  const userId = userRows[0].id;
  const [active] = await connection.query(
    "SELECT * FROM mining_investments WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1",
    [userId]
  );

  res.json({ status: true, active: active[0] || null, vip: userRows[0].vip_level });
};
