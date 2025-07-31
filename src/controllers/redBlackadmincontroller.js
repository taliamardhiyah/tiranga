import connection from "../config/connectDB.js";

// List periode & hasil + 10 rekaman join bet terakhir
export const adminRedBlackList = async (req, res) => {
  // Ambil 100 periode terakhir
  const [rows] = await connection.query("SELECT * FROM redblack ORDER BY id DESC LIMIT 100");
  // Ambil 10 bet terakhir (join user)
  const [lastBets] = await connection.query(`
    SELECT b.id, b.phone, b.period, b.bet_type, b.amount, b.status, b.win_amount, b.invite, u.money AS saldo
    FROM redblack_bet b
    LEFT JOIN users u ON b.phone = u.phone
    ORDER BY b.id DESC LIMIT 10
  `);
  res.render("admin/redblack/list.ejs", { rows, lastBets });
};

// Set hasil kartu (admin)
export const adminRedBlackSetResult = async (req, res) => {
  const { period, suit, rank, color } = req.body;
  await connection.query(
    "UPDATE redblack SET suit=?, rank=?, color=?, status=1 WHERE period=?",
    [suit, rank, color, period]
  );
  res.json({ success: true });
};

// Settle semua bet pada periode (tanpa potongan)
export const adminRedBlackSettle = async (req, res) => {
  const { period } = req.body;
  // Ambil hasil
  const [[result]] = await connection.query("SELECT * FROM redblack WHERE period=?", [period]);
  if (!result) return res.json({ success: false, message: "Periode tidak ditemukan" });

  // Ambil semua bet
  const [bets] = await connection.query("SELECT * FROM redblack_bet WHERE period=? AND status=0", [period]);
  for (const bet of bets) {
    let win = 0;
    // Kalkulasi menang sesuai aturan
    if (bet.bet_type === result.color) win = bet.amount * 2;
    if (bet.bet_type === "joker" && result.suit === "joker") win = bet.amount * 20;
    if (["as", "j", "q", "k"].includes(bet.bet_type) && result.rank.toLowerCase() === bet.bet_type) win = bet.amount * 12;
    // Update status & win_amount
    await connection.query(
      "UPDATE redblack_bet SET status=1, win_amount=? WHERE id=?",
      [win, bet.id]
    );
    // Tambah saldo user jika menang
    if (win > 0) {
      await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [win, bet.phone]);
    }
    // Komisi upline (langsung, tanpa potongan)
    if (bet.invite) {
      const komisi = Math.floor(bet.amount * 0.007); // 0.7% komisi
      await connection.query("UPDATE users SET money = money + ? WHERE code = ?", [komisi, bet.invite]);
    }
  }
  res.json({ success: true, message: "Settle selesai" });
};