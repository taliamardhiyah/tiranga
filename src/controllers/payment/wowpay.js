// controllers/payment/wowpay.js
const wowpayConfig = {
  merchantId: 'ISI_ID_MERCHANT',
  merchantKey: 'ISI_KEY_MERCHANT'
  // ...config lain...
};

async function depositWowpay(req, res) {
  // Implementasi deposit Wowpay
  res.json({ message: "Wowpay deposit endpoint" });
}

module.exports = {
  depositWowpay,
  // fungsi lain terkait Wowpay
};