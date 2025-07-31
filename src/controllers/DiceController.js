import pool from '../config/connectDB.js';
import crypto from 'crypto';

const MIN_BET = 1000;
const MAX_BET = 10_000_000;

class DiceController {
  async index(req, res) {
    try {
      const [list] = await pool.query(`SELECT * FROM dice ORDER BY id DESC LIMIT 9`);
      const [lastRow] = await pool.query(`SELECT id FROM dice ORDER BY id DESC LIMIT 1`);
      const [sumRow] = await pool.query(`SELECT SUM(sum) AS totalSum FROM dice`);

      const betsCount = lastRow[0]?.id || 0;
      const betsSum = sumRow[0]?.totalSum || 0;
      const hash = crypto.randomBytes(16).toString('hex');

      const game = [];
      for (const row of list) {
        const [u] = await pool.query(`SELECT id_user, name_user, money FROM users WHERE id_user = ?`, [row.user_id]);
        if (!u[0]) continue;
        game.push({
          id_user: u[0].id_user,
          name_user: u[0].name_user,
          sum: row.sum,
          num: row.num,
          vip: row.vip,
          perc: row.perc,
          win: row.win,
          win_sum: row.win_sum,
          balType: row.balType,
          hash: row.hash
        });
      }

      return res.render('pages/dice', { game, betsCount, betsSum, hash, user: req.user });

    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  }

  async play(req, res) {
    const { id_user, sum: rawSum, perc: rawPerc, balType } = req.body;

    if (!id_user || !rawSum || !rawPerc || !balType)
      return res.status(400).json({ type: 'error', msg: 'Data not complete' });

    const sum = parseFloat(rawSum);
    const perc = parseFloat(rawPerc);

    if (!(balType === 'money'))
      return res.json({ type: 'error', msg: 'Balance type invalid' });
    if (sum < MIN_BET || sum > MAX_BET)
      return res.json({ type: 'error', msg: `Bet between ${MIN_BET} and ${MAX_BET}` });
    if (perc < 1 || perc > 95)
      return res.json({ type: 'error', msg: 'Chance must be 1–95' });

    const conn = await pool.getConnection();
    await conn.beginTransaction();

    try {
      const [users] = await conn.query(`SELECT * FROM users WHERE id_user = ? FOR UPDATE`, [id_user]);
      const user = users[0];
      if (!user) throw new Error('User not found');
      if (user.money < sum)
        throw new Error('Insufficient balance');

      const vip = +(96 / perc).toFixed(2);
      const rand = Math.floor(Math.random() * 10001);
      const generate = rand / 100;

      const payout = +(sum * vip).toFixed(2);
      if (Math.abs(payout - sum) < 0.01)
        throw new Error('Invalid payout calculation');

      let win = 0, win_sum = -sum, profit = sum;
      let newBalance = user.money - sum;

      if (perc >= generate) {
        win = 1;
        win_sum = payout;
        profit = - (payout - sum);
        newBalance = user.money + payout - sum;
      }

      await conn.query(`UPDATE users SET money = ? WHERE id_user = ?`, [newBalance, id_user]);

      const dbHash = crypto.randomBytes(16).toString('hex');
      await conn.query(`
        INSERT INTO dice (user_id, sum, perc, vip, num, win, win_sum, balType, hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id_user, sum, perc, vip, generate, win, win_sum, balType, dbHash]);

      if (win === 1 && user.invite) {
        const [reffRows] = await conn.query(`SELECT * FROM users WHERE code = ? FOR UPDATE`, [user.invite]);
        const ref = reffRows[0];
        if (ref) {
          const komisi = Math.floor((payout - sum) * 0.01);
          if (komisi > 0) {
            await conn.query(`
              UPDATE users 
              SET money = money + ?, roses_f = roses_f + ?, roses_today = roses_today + ?
              WHERE id_user = ?
            `, [komisi, komisi, komisi, ref.id_user]);
          }
        }
      }

      await conn.commit();
      conn.release();

      return res.json({
        status: win ? 'win' : 'lose',
        chislo: generate,
        chance: perc,
        win,
        win_sum,
        hash: dbHash,
        currentMoney: newBalance
      });
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error(err);
      return res.status(500).json({ type: 'error', msg: err.message || 'Server error' });
    }
  }
}

export default new DiceController();
