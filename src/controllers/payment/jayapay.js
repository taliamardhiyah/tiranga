// controllers/payment/jayapay.js
const axios = require('axios');

const jayapayConfig = {
  merchantCode: 'S820250606133910000003',
  merchantNumber: 'YN10317',
  platformPublicKey: '-----BEGIN PUBLIC KEY-----\n...isi key...\n-----END PUBLIC KEY-----',
  merchantPrivateKey: '-----BEGIN PRIVATE KEY-----\n...isi key...\n-----END PRIVATE KEY-----',
  key: 'KVGFDUF6AAM3OYNN',
  account: 'FinePay@YN10317'
};

async function depositJayapay(req, res) {
  try {
    // Ambil data dari req.body
    const { number, bankCode, name, mobile, email, money, description } = req.body;
    // Build params dan sign (implementasi sign sendiri sesuai kebutuhan)
    const params = {
      merchantCode: jayapayConfig.merchantCode,
      orderType: '0',
      method: 'Transfer',
      orderNum: 'T' + Date.now(),
      money: String(money),
      feeType: '1',
      dateTime: new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14),
      number, bankCode, name, mobile, email,
      notifyUrl: "https://pasificrim.live/wallet/jayapay-callback",
      description
    };
    // TODO: tambahkan sign jika perlu

    const response = await axios.post(
      "https://openapi.jayapayment.com/gateway/cash",
      params,
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal proses deposit Jayapay" });
  }
}

module.exports = {
  depositJayapay,
  // fungsi lain terkait Jayapay
};