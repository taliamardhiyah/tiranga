import { getUser, createUser, updateUser } from "../models/user.js";

export const claimFreebet = (req, res) => {
  const { userId } = req.body;
  let user = getUser(userId) || createUser(userId);

  if (user.hasClaimedFreebet)
    return res.status(400).json({ msg: "Freebet sudah di-claim." });

  user.balance += 10000;
  user.hasClaimedFreebet = true;
  updateUser(userId, user);

  return res.json({ msg: "Freebet 10K berhasil diklaim.", balance: user.balance });
};

export const checkWithdrawEligibility = (req, res) => {
  const { userId } = req.body;
  const user = getUser(userId);

  if (!user) return res.status(404).json({ msg: "User tidak ditemukan." });

  const gain = user.balance - 10000; // diasumsikan saldo awal dari freebet
  let requiredDeposit = 0;

  if (gain >= 50000 && gain < 100000) requiredDeposit = 50000;
  else if (gain >= 100000 && gain < 200000) requiredDeposit = 100000;
  else if (gain >= 200000 && gain < 300000) requiredDeposit = 200000;
  else if (gain >= 300000 && gain < 400000) requiredDeposit = 300000;
  else if (gain >= 400000 && gain < 500000) requiredDeposit = 400000;
  else if (gain >= 500000) requiredDeposit = 500000;

  if (requiredDeposit === 0) {
    return res.json({ eligible: true, msg: "Boleh withdraw tanpa syarat tambahan." });
  }

  if (user.depositTotal >= requiredDeposit) {
    return res.json({
      eligible: true,
      msg: `Boleh withdraw (karena sudah deposit minimal ${requiredDeposit})`,
    });
  } else {
    return res.json({
      eligible: false,
      msg: `Harus deposit minimal ${requiredDeposit} untuk withdraw.`,
    });
  }
};
