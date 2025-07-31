import connection from "../config/connectDB.js";

// Render halaman game
export const dicePage = (req, res) => {
  res.render("game/classic-dice.ejs");
};

// Mainkan game
export const playClassicDice = async (req, res) => {
  const { betNumber, betAmount } = req.body;
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });
  if (![1,2,3,4,5,6].includes(Number(betNumber)) || betAmount < 1000) {
    return res.json({ status: false, message: "Tebakan 1-6, minimal 1000" });
  }
  const [userRows] = await connection.query("SELECT id, money FROM users WHERE token = ? LIMIT 1", [auth]);
  const user = userRows[0];
  if (!user || user.money < betAmount) return res.json({ status: false, message: "Saldo tidak cukup" });

  // Kocok dadu
  const dice = Math.floor(Math.random() * 6) + 1;
  let win = (Number(betNumber) === dice);
  let prize = win ? betAmount * 5 : 0;

  // Update saldo
  await connection.query("UPDATE users SET money = money - ? + ? WHERE id = ?", [betAmount, prize, user.id]);

  // Simpan riwayat (opsional)
  await connection.query(
    "INSERT INTO dice_history (user_id, bet_number, bet_amount, result, win, prize, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
    [user.id, betNumber, betAmount, dice, win ? 1 : 0, prize]
  );

  res.json({
    status: true,
    result: dice,
    win,
    prize,
    message: win ? "Selamat, Anda menang!" : "Maaf, belum beruntung."
  });
};
// Ambil riwayat permainan
export const getDiceHistory = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });

  const [userRows] = await connection.query("SELECT id FROM users WHERE token = ? LIMIT 1", [auth]);
  const user = userRows[0];
  if (!user) return res.json({ status: false, message: "User tidak ditemukan" });

  const [history] = await connection.query(
    "SELECT bet_number, bet_amount, result, win, prize, created_at FROM dice_history WHERE user_id = ? ORDER BY id DESC LIMIT 20",
    [user.id]
  );

  res.json({ status: true, history });
};
