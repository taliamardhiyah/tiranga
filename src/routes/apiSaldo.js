import express from 'express';
import connection from '../config/connectDB.js';
const router = express.Router();

router.get('/api/saldo', async (req, res) => {
  const auth = req.cookies.auth;
  if (!auth) return res.json({ saldo: 0 });
  const [userRows] = await connection.query("SELECT money FROM users WHERE token = ? AND veri = 1 LIMIT 1", [auth]);
  const saldo = userRows[0]?.money || 0;
  res.json({ saldo });
});

export default router;
