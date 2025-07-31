const db = require('../db');
const generatePeriod = require('../utils/generatePeriod');

exports.loginPage = (req, res) => {
  res.render('login', { error: null });
};

exports.login = (req, res) => {
  const { phone, password } = req.body;
  db.query("SELECT * FROM users WHERE phone = ? AND password = ?", [phone, password], (err, result) => {
    if (err) throw err;
    if (!result.length) return res.render('login', { error: 'Login gagal!' });
    req.session.user = result[0];
    res.redirect('/togel');
  });
};

exports.togelPage = (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  db.query("SELECT money FROM users WHERE id = ?", [req.session.user.id], (err, result) => {
    res.render('togel', { saldo: result[0].money });
  });
};

exports.bet = (req, res) => {
  const { type, number, amount } = req.body;
  const userId = req.session.user.id;
  if (amount < 1000) return res.send('Minimal taruhan Rp 1.000');
  const valid = (type === '2D' && number.length === 2) || (type === '3D' && number.length === 3) || (type === '4D' && number.length === 4);
  if (!valid) return res.send('Nomor tidak sesuai dengan jenis togel');

  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, users) => {
    const user = users[0];
    if (user.money < amount) return res.send('Saldo tidak cukup');

    const period = generatePeriod();
    db.query("INSERT INTO togel_bets (user_id, type, number, amount, period) VALUES (?, ?, ?, ?, ?)",
      [userId, type, number, amount, period]);
    db.query("UPDATE users SET money = money - ? WHERE id = ?", [amount, userId]);

    if (user.invite) {
      const bonus = Math.floor(amount * 0.01);
      db.query("UPDATE users SET money = money + ? WHERE id = ?", [bonus, user.invite]);
    }

    res.send('Taruhan berhasil');
  });
};
