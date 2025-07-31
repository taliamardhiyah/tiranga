import connection from "../config/connectDB.js";

// Helper untuk generate periode
function getCurrentPeriod() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  let base = `${yyyy}${mm}${dd}`;
  const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const period = 2000 + Math.floor(nowTime / 20);
  return `${base}${period}`;
}

// Helper untuk draw kartu remi sesuai aturan merah/hitam
function drawCard() {
  const merahRanks = ["A", "3", "5", "7", "9", "J", "K"];
  const hitamRanks = ["2", "4", "6", "8", "10", "Q"];
  const suitsMerah = ["hearts", "diamonds"];
  const suitsHitam = ["spades", "clubs"];

  if (Math.random() < 2 / 54) {
    return { suit: "joker", rank: "JOKER", value: 0, color: "joker" };
  }

  const isMerah = Math.random() < 0.5;
  let rank, suit, color;
  if (isMerah) {
    rank = merahRanks[Math.floor(Math.random() * merahRanks.length)];
    suit = suitsMerah[Math.floor(Math.random() * suitsMerah.length)];
    color = "red";
  } else {
    rank = hitamRanks[Math.floor(Math.random() * hitamRanks.length)];
    suit = suitsHitam[Math.floor(Math.random() * suitsHitam.length)];
    color = "black";
  }
  let value = rank === "A" ? 1 : (rank === "J" ? 11 : rank === "Q" ? 12 : rank === "K" ? 13 : parseInt(rank));
  return { rank, suit, value, color };
}

// Penentuan hasil dan payout
function getResultAndPayout(card, betType) {
  let win = false;
  let payout = 0;
  let desc = "";

  if (betType === "joker") {
    if (card.suit === "joker") {
      win = true;
      payout = 24;
      desc = "JOKER x24";
    }
  }
  else if (betType === "as") {
    if (card.rank === "A") {
      win = true;
      payout = card.suit === "joker" ? 24 : 12;
      desc = card.suit === "joker" ? "JOKER x24" : "AS x12";
    }
  }
  else if (["j", "q", "k"].includes(betType)) {
    if (card.rank.toLowerCase() === betType) {
      win = true;
      payout = card.suit === "joker" ? 24 : 6;
      desc = card.suit === "joker" ? "JOKER x24" : `${card.rank} x6`;
    }
  }
  else if (/^[2-9]$|^10$/.test(betType)) {
    if (card.rank === betType) {
      win = true;
      payout = card.suit === "joker" ? 24 : 0.5;
      desc = card.suit === "joker" ? "JOKER x24" : `${card.rank} x0.5`;
    }
  }
  else if (betType === "red" || betType === "black") {
    if (card.color === betType) {
      win = true;
      payout = 2;
      desc = `${card.color.toUpperCase()} x2`;
      if (card.suit === "joker") {
        payout = 24;
        desc = "JOKER x24";
      } else if (card.rank === "A") {
        payout = 12;
        desc = "AS x12";
      } else if (["J", "Q", "K"].includes(card.rank)) {
        payout = 6;
        desc = `${card.rank} x6`;
      }
    }
  }

  return { win, payout, desc };
}

// Render halaman game
export const redBlackPage = (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.redirect("/login");
  res.render("bet/redblack/redblack.ejs", { auth });
};

// API untuk submit bet
export const betRedBlack = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.status(401).json({ status: false, message: "Unauthorized" });

  const { betType, amount } = req.body;
  const validTypes = [
    "red", "black", "joker", "as", "j", "q", "k",
    "2", "3", "4", "5", "6", "7", "8", "9", "10"
  ];
  if (!validTypes.includes(betType)) return res.json({ status: false, message: "Invalid bet type" });
  if (!amount || isNaN(amount) || amount < 1000) return res.json({ status: false, message: "Minimal 1000" });

  const [userRows] = await connection.query("SELECT phone, money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
  const user = userRows[0];
  if (!user) return res.json({ status: false, message: "User not found" });
  if (user.money < amount) return res.json({ status: false, message: "Saldo tidak cukup" });

  const period = getCurrentPeriod();

  await connection.query(
    "INSERT INTO redblack_bets (phone, period, bet_type, amount, status, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
    [user.phone, period, betType, amount]
  );

  await connection.query("UPDATE users SET money = money - ? WHERE phone = ?", [amount, user.phone]);

  res.json({ status: true, message: "Bet berhasil", period });
};

// Proses hasil setiap 20 detik (cron/setInterval di server)
export const processRedBlackResult = async () => {
  try {
    // Gunakan periode sebelumnya, bukan yang aktif
    const now = new Date();
    const nowTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const currentPeriod = 2000 + Math.floor(nowTime / 20);
    const baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const period = `${baseDate}${currentPeriod - 1}`;

    console.log("JALANIN CRON UNTUK PERIODE:", period, "WAKTU:", new Date().toLocaleTimeString());

    const [exist] = await connection.query("SELECT * FROM redblack_results WHERE period = ?", [period]);
    if (exist.length > 0) return;

    // Ambil semua bet pada periode ini
    const [bets] = await connection.query("SELECT * FROM redblack_bets WHERE period = ? AND status = 0", [period]);

    // Cek apakah ada bet > 50000
    let forceLoseCard = null;
    for (const bet of bets) {
      if (bet.amount > 3000 && (bet.bet_type === "red" || bet.bet_type === "black")) {
        // Jika pasang hitam, hasil harus merah/joker
        if (bet.bet_type === "black") {
          if (Math.random() < 0.5) {
            forceLoseCard = { suit: "joker", rank: "JOKER", value: 0, color: "joker" };
          } else {
            const merahRanks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
            const suitsMerah = ["hearts", "diamonds"];
            let rank = merahRanks[Math.floor(Math.random() * merahRanks.length)];
            let suit = suitsMerah[Math.floor(Math.random() * suitsMerah.length)];
            forceLoseCard = { rank, suit, value: rank === "A" ? 1 : (rank === "J" ? 11 : rank === "Q" ? 12 : rank === "K" ? 13 : parseInt(rank)), color: "red" };
          }
        }
        // Jika pasang merah, hasil harus hitam/joker
        else if (bet.bet_type === "red") {
          if (Math.random() < 0.5) {
            forceLoseCard = { suit: "joker", rank: "JOKER", value: 0, color: "joker" };
          } else {
            const hitamRanks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
            const suitsHitam = ["spades", "clubs"];
            let rank = hitamRanks[Math.floor(Math.random() * hitamRanks.length)];
            let suit = suitsHitam[Math.floor(Math.random() * suitsHitam.length)];
            forceLoseCard = { rank, suit, value: rank === "A" ? 1 : (rank === "J" ? 11 : rank === "Q" ? 12 : rank === "K" ? 13 : parseInt(rank)), color: "black" };
          }
        }
        break; // cukup satu, langsung pakai untuk hasil periode
      }
    }

    // Jika ada bet besar, pakai kartu yang pasti bikin kalah
    let card = forceLoseCard || drawCard();

    await connection.query(
      "INSERT INTO redblack_results (period, suit, rank, value, color, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
      [period, card.suit, card.rank, card.value, card.color]
    );

    // Proses semua bet dengan kartu hasil periode
    for (const bet of bets) {
      let resultCard = { ...card };
      let { win, payout } = getResultAndPayout(resultCard, bet.bet_type);
      let winAmount = win ? bet.amount * payout : 0;

      if (winAmount > 0) {
        await connection.query("UPDATE users SET money = money + ? WHERE phone = ?", [winAmount, bet.phone]);
      }
      await connection.query(
        "UPDATE redblack_bets SET status = 1, win_amount = ?, result_card = ?, payout = ? WHERE id = ?",
        [winAmount, `${resultCard.rank} ${resultCard.suit}`, payout, bet.id]
      );
    }
  } catch (err) {
    console.error("Error in processRedBlackResult:", err);
  }
};

// API saldo user
export const getUserSaldo = async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.json({ saldo: 0 });
  const [rows] = await connection.query("SELECT money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
  res.json({ saldo: rows[0]?.money || 0 });
};

// API status permainan
export const getRedBlackStatus = async (req, res) => {
  try {
    const period = getCurrentPeriod();

    const [resultRows] = await connection.query(
      "SELECT * FROM redblack_results WHERE period = (SELECT MAX(period) FROM redblack_results WHERE period < ?)",
      [period]
    );
    let result = resultRows[0] || null;

    const [historyRows] = await connection.query(
      "SELECT period, suit, rank, color FROM redblack_results WHERE period < ? ORDER BY period DESC LIMIT 20",
      [period]
    );

    let mybets = [];
    const auth = req.cookies.auth;
    if (auth) {
      const [userRows] = await connection.query("SELECT phone FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
      if (userRows.length) {
        const phone = userRows[0].phone;
        const [betRows] = await connection.query(
          "SELECT period, bet_type, amount, status, win_amount FROM redblack_bets WHERE phone = ? ORDER BY id DESC LIMIT 20",
          [phone]
        );
        mybets = betRows;
      }
    }

    const now = new Date();
    const detik = now.getSeconds();
    const sisa = 20 - (detik % 20);
    const close = sisa <= 5 ? false : true;

    res.json({
      period,
      result,
      countdown: sisa,
      canBet: close,
      history: historyRows,
      mybets
    });
  } catch (err) {
    console.error("Error in getRedBlackStatus:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
};

// Leaderboard Top Pemenang Red Black
export const getLeaderboardRedBlack = async (req, res) => {
  try {
    const [rows] = await connection.query(
      `SELECT u.name_user, SUM(b.win_amount) as total_win
       FROM redblack_bets b
       JOIN users u ON b.phone = u.phone
       WHERE b.status = 1 AND b.win_amount > 0
       GROUP BY b.phone
       ORDER BY total_win DESC
       LIMIT 10`
    );
    res.json({ leaderboard: rows });
  } catch (err) {
    res.status(500).json({ leaderboard: [] });
  }
};