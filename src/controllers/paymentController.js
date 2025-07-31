import connection from "../config/connectDB";
import axios from 'axios';
import moment from "moment";
import crypto from "crypto";
import TelegramBot from 'node-telegram-bot-api';
import querystring from "querystring"

// Ganti dengan data merchant Anda
const merchantCode = 'S820250606133910000003';
const platPublicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCuNPCTEIg9UEBhJnZ3eB9MelipUiZVsgdVswR24No3HBfNHN3kcsCOtTGbDTFmLl9FKbvYU896c3R3WirUuKpPqOgS91x83zLM8Gy8aab2i9r9cyDyGRY0HwQc8lQFCxwEvOyLNXSuTuVZsFnNIwObLu1WK2xuFDizC4el4CSXaQIDAQAB';
// Private key dalam format PEM
const mchPrivateKey = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAK408JMQiD1QQGEmdnd4H0x6WKlSJlWyB1WzBHbg2jccF80c3eRywI61MZsNMWYuX0Upu9hTz3pzdHdaKtS4qk+o6BL3XHzfMszwbLxppvaL2v1zIPIZFjQfBBzyVAULHAS87Is1dK5O5VmwWc0jA5su7VYrbG4UOLMLh6XgJJdpAgMBAAECgYBI/yLtpOhJtOZ9LvZGIl4PGFctgCBTGVnMdcqBm7+khw+MIbPzBYidY9yI6ZLRC85c91tgjuHqIBXl6zD2WPj33V2ZHFGrMjYG07yKsIzMTCihg2kfc9624VIsHzKjFAHK01bax3j1X3DqhCcWrZCUcawLu6AVcg+/e0I/YmugDwJBAOmydvyHZ59ZgOPwdW9G+inMbtPOEEiZ6QZJDc540seSx92+MjuEMBlFsVgME5ExKur5Y+fwpm1lzgR2/6zs9B8CQQC+HKoQE36HtLF5197bKMEQxNCRg85tBk5mcLUj99nPoxTR+vU5g8AOs7i7c4KJT/ZJu845CPG48qoZS6suahUN3AkEA47IcuKN9VQcxy+UHpqozJ/KlsPy/ZN2A67zWFOwoAoeC8QxViSOccaMzzaPGlNqhBFyE+QHCRijA+ByxtF0S5QJAMVCNBGFIfnaaRCHXxXhBCksXYKj4d5M9Kb8Ph2XzWPl1um7hWlusF3xVz+6dBGd6+AEouiUzt6m5nKPgicX2cQJBALEdkZBjmiPZprbxzFSgRoIx96t1YCZSBYAaEzmpjH81BVD+F6Kqd20Aj5fEjBEx+8LYXBZ03+mRInqdOvwyYOE=
-----END PRIVATE KEY-----`;

function signData(data, privateKey) {
  // Urutkan key alphabet lalu gabung value-nya
  const keys = Object.keys(data).sort();
  let paramsStr = '';
  keys.forEach(k => paramsStr += data[k]);
  // Sign pakai privateKey
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(paramsStr);
  return signer.sign(privateKey, 'base64');
}

const depositJayapayForm = (req, res) => {
  res.render('jayapay', { error: null });
};

const depositJayapay = async (req, res) => {
  try {
    const {
      money,
      name,
      mobile,
      email,
      bankCode,
      number, // nomor rekening tujuan
      description
    } = req.body;

    const orderNum = 'T' + new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14) + Math.floor(Math.random()*1000);
    const dateTime = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

    const params = {
      merchantCode,
      orderType: '0',
      method: 'Transfer',
      orderNum,
      money,
      feeType: '1',
      dateTime,
      number: number || '123456', // default dummy
      bankCode: bankCode || '014', // default BCA
      name,
      mobile,
      email,
      notifyUrl: 'https://pasificrim.live/jayapay/callback', // Ganti dengan URL callback Anda
      description: description || 'Deposit Jayapay'
    };

    params.sign = signData(params, mchPrivateKey);

    const response = await axios.post(
      'https://openapi.jayapayment.com/gateway/cash',
      params,
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Sukses dari Jayapay
    if (response.data && response.data.status == 0) {
      res.render('jayapay_success', { result: response.data });
    } else {
      res.render('jayapay_failed', { result: response.data });
    }
  } catch (err) {
    res.render('jayapay', { error: err.message });
  }
};

// Untuk menerima callback dari Jayapay
const jayapayCallback = (req, res) => {
  // Proses update status deposit user di database Anda sesuai data callback
  // Misal: req.body.orderNum, req.body.status, dll
  // Untuk demo, langsung kirim OK
  res.status(200).send('OK');
};

const token = '8044580404:AAER7Wx0BKPmDtskjZA5dDD2oZHLzh0MXnE';
const bot = new TelegramBot(token, { polling: true });
const groupId = '-1002678377140';

const sendTransactionInfo = (message) => {
    bot.sendMessage(groupId, message);
}

let timeNow = Date.now();

const PaymentStatusMap = {
    PENDING: 0,
    SUCCESS: 1,
    CANCELLED: 2
}

const PaymentMethodsMap = {
    UPI_GATEWAY: "upi_gateway",
    UPI_MANUAL: "upi_manual",
    USDT_MANUAL: "usdt_manual",
    WOW_PAY: "wow_pay",
    USDT: "usdt",
}

const initiateManualUPIPayment = async (req, res) => {
    const query = req.query

    const [bank_recharge_momo] = await connection.query("SELECT * FROM bank_recharge WHERE type = 'momo'");

    let bank_recharge_momo_data
    if (bank_recharge_momo.length) {
        bank_recharge_momo_data = bank_recharge_momo[0]
    }

    const momo = {
        bank_name: bank_recharge_momo_data?.name_bank || "",
        username: bank_recharge_momo_data?.name_user || "",
        upi_id: bank_recharge_momo_data?.stk || "",
        usdt_wallet_address: bank_recharge_momo_data?.qr_code_image || "",
    }

    return res.render("wallet/manual_payment.ejs", {
        Amount: query?.am,
        UpiId: momo.upi_id,
        UpiIda: momo.username,
        UpiIdb: momo.bank_name,
    });
}

const initiateManualUSDTPayment = async (req, res) => {
    const query = req.query

    const [bank_recharge_momo] = await connection.query("SELECT * FROM bank_recharge WHERE type = 'momo'");

    let bank_recharge_momo_data
    if (bank_recharge_momo.length) {
        bank_recharge_momo_data = bank_recharge_momo[0]
    }

    const momo = {
        bank_name: bank_recharge_momo_data?.name_bank || "",
        username: bank_recharge_momo_data?.name_user || "",
        upi_id: bank_recharge_momo_data?.stk || "",
        usdt_wallet_address: bank_recharge_momo_data?.qr_code_image || "",
    }

    return res.render("wallet/usdt_manual_payment.ejs", {
        Amount: query?.am,
        UsdtWalletAddress: momo.usdt_wallet_address,
    });
}

const addManualUPIPaymentRequest = async (req, res) => {
    try {
        const data = req.body
        let auth = req.cookies.auth;
        let money = parseInt(data.money);
        let utr = parseInt(data.utr);
        const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY)

        if (!money || !(money >= minimumMoneyAllowed)) {
            return res.status(400).json({
                message: `Money is Required and it should be Rp${minimumMoneyAllowed} or above!`,
                status: false,
                timeStamp: timeNow,
            })
        }

        if (!utr && utr?.length != 56) {
            return res.status(400).json({
                message: `panjang kode 56`,
                status: false,
                timeStamp: timeNow,
            })
        }

        const user = await getUserDataByAuthToken(auth)

        const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({ phone: user.phone, status: PaymentStatusMap.PENDING, type: PaymentMethodsMap.UPI_GATEWAY })

        if (pendingRechargeList.length !== 0) {
            const deleteRechargeQueries = pendingRechargeList.map(recharge => {
                return rechargeTable.cancelById(recharge.id)
            });

            await Promise.all(deleteRechargeQueries)
        }

        const orderId = getRechargeOrderId()

        const newRecharge = {
            orderId: orderId,
            transactionId: 'NULL',
            utr: utr,
            phone: user.phone,
            money: money,
            type: PaymentMethodsMap.UPI_MANUAL,
            status: 0,
            today: rechargeTable.getCurrentTimeForTodayField(),
            url: "NULL",
            time: timeNow,
        }

        const recharge = await rechargeTable.create(newRecharge)

// Kirim pesan ke Telegram
sendTransactionInfo(`Transaksi baru deposit:\nTelepon ${user.phone} jumlah saldo masuk ${money} Rp \ndengan UTR: ${utr}\nSilahkan cek depo @bangdoni01 @cspasificrim\nhttps://pasificrim.live/admin/manager/recharge`);

        return res.status(200).json({
            message: 'Payment Requested successfully Your Balance will update shortly!',
            recharge: recharge,
            status: true,
            timeStamp: timeNow,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        });
    }
}

const addManualUSDTPaymentRequest = async (req, res) => {
    try {
        const data = req.body
        let auth = req.cookies.auth;
        let money_usdt = parseInt(data.money);
        let money = money_usdt * 92;
        let utr = parseInt(data.utr);
        const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY)

        if (!money || !(money >= minimumMoneyAllowed)) {
            return res.status(400).json({
                message: `Money is Required and it should be Rp${minimumMoneyAllowed} or ${(minimumMoneyAllowed / 92).toFixed(2)} or above!`,
                status: false,
                timeStamp: timeNow,
            })
        }

        if (!utr) {
            return res.status(400).json({
                message: `Ref No. or UTR is Required`,
                status: false,
                timeStamp: timeNow,
            })
        }

        const user = await getUserDataByAuthToken(auth)

        const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({ phone: user.phone, status: PaymentStatusMap.PENDING, type: PaymentMethodsMap.UPI_GATEWAY })

        if (pendingRechargeList.length !== 0) {
            const deleteRechargeQueries = pendingRechargeList.map(recharge => {
                return rechargeTable.cancelById(recharge.id)
            });

            await Promise.all(deleteRechargeQueries)
        }

        const orderId = getRechargeOrderId()

        const newRecharge = {
            orderId: orderId,
            transactionId: 'NULL',
            utr: utr,
            phone: user.phone,
            money: money,
            type: PaymentMethodsMap.USDT_MANUAL,
            status: 0,
            today: rechargeTable.getCurrentTimeForTodayField(),
            url: "NULL",
            time: timeNow,
        }

        const recharge = await rechargeTable.create(newRecharge)

        return res.status(200).json({
            message: 'Payment Requested successfully Your Balance will update shortly!',
            recharge: recharge,
            status: true,
            timeStamp: timeNow,
        });
    } catch (error) {
        console.log(error)

        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        })
    }
}

const initiateUPIPayment = async (req, res) => {
    const type = PaymentMethodsMap.UPI_GATEWAY
    let auth = req.cookies.auth;
    let money = parseInt(req.body.money);

    const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY)

    if (!money || !(money >= minimumMoneyAllowed)) {
        return res.status(400).json({
            message: `Money is Required and it should be Rp${minimumMoneyAllowed} or above!`,
            status: false,
            timeStamp: timeNow,
        })
    }

    try {
        const user = await getUserDataByAuthToken(auth)

        const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({ phone: user.phone, status: PaymentStatusMap.PENDING, type: PaymentMethodsMap.UPI_GATEWAY })

        if (pendingRechargeList.length !== 0) {
            const deleteRechargeQueries = pendingRechargeList.map(recharge => {
                return rechargeTable.cancelById(recharge.id)
            });

            await Promise.all(deleteRechargeQueries)
        }

        const orderId = getRechargeOrderId()

        const ekqrResponse = await axios.post('https://api.ekqr.in/api/create_order', {
            key: process.env.UPI_GATEWAY_PAYMENT_KEY,
            client_txn_id: orderId,
            amount: String(money),
            p_info: process.env.PAYMENT_INFO,
            customer_name: user.username,
            customer_email: process.env.PAYMENT_EMAIL,
            customer_mobile: user.phone,
            redirect_url: `${process.env.APP_BASE_URL}/wallet/verify/upi`,
            udf1: process.env.APP_NAME,
        })

        const ekqrData = ekqrResponse?.data

        if (ekqrData === undefined || ekqrData.status === false) {
            throw Error("Gateway er!#ror from ekqr!")
        }

        const newRecharge = {
            orderId: orderId,
            transactionId: 'NULL',
            utr: null,
            phone: user.phone,
            money: money,
            type: type,
            status: 0,
            today: rechargeTable.getCurrentTimeForTodayField(),
            url: ekqrData.data.payment_url,
            time: timeNow,
        }

        const recharge = await rechargeTable.create(newRecharge)

        console.log(ekqrData)

        return res.status(200).json({
            message: 'Payment Initiated successfully',
            recharge: recharge,
            urls: {
                web_url: ekqrData.data.payment_url,
                bhim_link: ekqrData.data?.upi_intent?.bhim_link || "",
                phonepe_link: ekqrData.data?.upi_intent?.phonepe_link || "",
                paytm_link: ekqrData.data?.upi_intent?.paytm_link || "",
                gpay_link: ekqrData.data?.upi_intent?.gpay_link || "",
            },
            status: true,
            timeStamp: timeNow,
        });
    } catch (error) {
        console.log(error)

        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        })
    }
}

const verifyUPIPayment = async (req, res) => {
    const type = PaymentMethodsMap.UPI_GATEWAY
    let auth = req.cookies.auth;
    let orderId = req.query.client_txn_id;

    if (!auth || !orderId) {
        return res.status(400).json({
            message: `orderId is Required!`,
            status: false,
            timeStamp: timeNow,
        })
    }
    try {
        const user = await getUserDataByAuthToken(auth)

        const recharge = await rechargeTable.getRechargeByOrderId({ orderId })

        if (!recharge) {
            return res.status(400).json({
                message: `Unable to find recharge with this order id!`,
                status: false,
                timeStamp: timeNow,
            })
        }

        const ekqrResponse = await axios.post('https://api.ekqr.in/api/check_order_status', {
            key: process.env.UPI_GATEWAY_PAYMENT_KEY,
            client_txn_id: orderId,
            txn_date: rechargeTable.getDMYDateOfTodayFiled(recharge.today),
        });

        const ekqrData = ekqrResponse?.data

        if (ekqrData === undefined || ekqrData.status === false) {
            throw Error("Gateway error from ekqr!")
        }

        if (ekqrData.data.status === "created") {
            return res.status(200).json({
                message: 'Your payment request is just created',
                status: false,
                timeStamp: timeNow,
            });
        }

        if (ekqrData.data.status === "scanning") {
            return res.status(200).json({
                message: 'Waiting for confirmation',
                status: false,
                timeStamp: timeNow,
            });
        }

        if (ekqrData.data.status === 'success') {

            if (recharge.status === PaymentStatusMap.PENDING || recharge.status === PaymentStatusMap.CANCELLED) {

                await rechargeTable.setStatusToSuccessByIdAndOrderId({
                    id: recharge.id,
                    orderId: recharge.orderId
                })

                await addUserAccountBalance({
                    phone: user.phone,
                    money: recharge.money,
                    code: user.code,
                    invite: user.invite,
                })
            }

            // return res.status(200).json({
            //     status: true,
            //     message: "Payment verified",
            //     timestamp: timeNow
            // })
            return res.redirect("/wallet/rechargerecord")
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        })
    }
}

const initiateWowPayPayment = async (req, res) => {
    const type = PaymentMethodsMap.WOW_PAY
    let auth = req.cookies.auth;
    let money = parseInt(req.query.money);

    const minimumMoneyAllowed = parseInt(process.env.MINIMUM_MONEY)

    if (!money || !(money >= minimumMoneyAllowed)) {
        return res.status(400).json({
            message: `Money is Required and it should be Rp${minimumMoneyAllowed} or above!`,
            status: false,
            timeStamp: timeNow,
        })
    }

    try {
        const user = await getUserDataByAuthToken(auth)

        const pendingRechargeList = await rechargeTable.getRecordByPhoneAndStatus({ phone: user.phone, status: PaymentStatusMap.PENDING, type: PaymentMethodsMap.UPI_GATEWAY })

        if (pendingRechargeList.length !== 0) {
            const deleteRechargeQueries = pendingRechargeList.map(recharge => {
                return rechargeTable.cancelById(recharge.id)
            });

            await Promise.all(deleteRechargeQueries)
        }

        const orderId = getRechargeOrderId()
        const date = wowpay.getCurrentDate()

        const params = {
            version: '1.0',
            // mch_id: 222887002,
            mch_id: process.env.WOWPAY_MERCHANT_ID,
            mch_order_no: orderId,
            // pay_type: '151',
            pay_type: '151',
            trade_amount: money,
            order_date: date,
            goods_name: user.phone,
            // notify_url: `${process.env.APP_BASE_URL}/wallet/verify/wowpay`,
            notify_url: `https://pasificrim.live/wallet/verify/wowpay`,
            mch_return_msg: user.phone,
            // payment_key: 'TZLMQ1QWJCUSFLH02LAYRZBJ1WK7IHSG',
        };

        params.page_url = 'https://pasificrim.live/wallet/verify/wowpay';

        params.sign = wowpay.generateSign(params, process.env.WOWPAY_MERCHANT_KEY);
        // params.sign = wowpay.generateSign(params, 'TZLMQ1QWJCUSFLH02LAYRZBJ1WK7IHSG');
        // params.sign = wowpay.generateSign(params, 'MZBG89MDIBEDWJOJQYEZVSNP8EEVMSPM');
        params.sign_type = "MD5";


        console.log(params)

        const response = await axios({
            method: "post",
            url: 'https://pay6de1c7.wowpayglb.com/pay/web',
            data: querystring.stringify(params)
        })

        console.log(response.data)

        if (response.data.respCode === "SUCCESS" && response.data.payInfo) {
            return res.status(200).json({
                message: "Payment requested Successfully",
                payment_url: response.data.payInfo,
                status: true,
                timeStamp: timeNow,
            })
        }


        return res.status(400).json({
            message: "Payment request failed. Please try again Or Wrong Details.",
            status: false,
            timeStamp: timeNow,
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        })
    }
}


const verifyWowPayPayment = async (req, res) => {
    try {
        const type = PaymentMethodsMap.WOW_PAY
        let data = req.body;

        if (!req.body) {
            data = req.query;
        }

        console.log(data)

        let merchant_key = process.env.WOWPAY_MERCHANT_KEY;

        const params = {
            mchId: process.env.WOWPAY_MERCHANT_ID,
            amount: data.amount || '',
            mchOrderNo: data.mchOrderNo || '',
            merRetMsg: data.merRetMsg || '',
            orderDate: data.orderDate || '',
            orderNo: data.orderNo || '',
            oriAmount: data.oriAmount || '',
            tradeResult: data.tradeResult || '',
            signType: data.signType || '',
            sign: data.sign || '',
        };

        let signStr = "";
        signStr += "amount=" + params.amount + "&";
        signStr += "mchId=" + params.mchId + "&";
        signStr += "mchOrderNo=" + params.mchOrderNo + "&";
        signStr += "merRetMsg=" + params.merRetMsg + "&";
        signStr += "orderDate=" + params.orderDate + "&";
        signStr += "orderNo=" + params.orderNo + "&";
        signStr += "oriAmount=" + params.oriAmount + "&";
        signStr += "tradeResult=" + params.tradeResult;

        let flag = wowpay.validateSignByKey(signStr, merchant_key, params.sign);

        if (!flag) {
            console.log({
                status: false,
                message: "Something went wrong!",
                flag,
                timestamp: timeNow
            })
            return res.status(400).json({
                status: false,
                message: "Something went wrong!",
                flag,
                timestamp: timeNow
            })
        }

        const newRechargeParams = {
            orderId: params.mchOrderNo,
            transactionId: 'NULL',
            utr: null,
            phone: params.merRetMsg,
            money: params.amount,
            type: type,
            status: PaymentStatusMap.SUCCESS,
            today: rechargeTable.getCurrentTimeForTodayField(),
            url: 'NULL',
            time: timeNow,
        }


        const recharge = await rechargeTable.getRechargeByOrderId({ orderId: newRechargeParams.orderId })

        if (!!recharge) {
            console.log({
                message: `Recharge already verified!`,
                status: true,
                timeStamp: timeNow,
            })
            return res.status(400).json({
                message: `Recharge already verified!`,
                status: true,
                timeStamp: timeNow,
            })
        }

        const newRecharge = await rechargeTable.create(newRechargeParams)

        await addUserAccountBalance({
            phone: user.phone,
            money: recharge.money,
            code: user.code,
            invite: user.invite,
        })

        return res.redirect("/wallet/rechargerecord")
    } catch (error) {
        console.log({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        })
        return res.status(500).json({
            status: false,
            message: "Something went wrong!",
            timestamp: timeNow
        })
    }
}


// helpers ---------------
const getUserDataByAuthToken = async (authToken) => {
    let [users] = await connection.query('SELECT `phone`, `code`,`name_user`,`invite` FROM users WHERE `token` = ? ', [authToken]);
    const user = users?.[0]


    if (user === undefined || user === null) {
        throw Error("Unable to get user data!")
    }

    return {
        phone: user.phone,
        code: user.code,
        username: user.name_user,
        invite: user.invite,
    }
}


const addUserAccountBalance = async ({ money, phone, invite, rechargeId }) => {
    try {
        const totalRecharge = await rechargeTable.totalRechargeCount(
            PaymentStatusMap.SUCCESS,
            phone
        );

        let bonus = 0;
        let turnover = 0;

        // BONUS dan TURNOVER untuk DEPOSIT PERTAMA
        if (totalRecharge === 0) {
            bonus = (money / 100) * parseInt(process.env.FIRST_DEPOSIT_BONUS_PERCENT || "0", 10);
            turnover = money * parseInt(process.env.FIRST_DEPOSIT_TURNOVER || "0", 10);
        } else {
            // BONUS dan TURNOVER untuk MEMBER LAMA
            bonus = (money / 100) * parseInt(process.env.OLD_MEMBER_BONUS_PERCENT || "0", 10);
            turnover = money * parseInt(process.env.OLD_MEMBER_TURNOVER || "0", 10);
        }

        const userMoney = money + bonus;

        // Tambahkan saldo ke pengguna
        await connection.query(
            'UPDATE users SET money = money + ?, total_money = total_money + ? WHERE phone = ?',
            [userMoney, userMoney, phone]
        );

        // Tambahkan data turnover
        await rechargeTable.updateRemainingBet(phone, turnover, rechargeId, totalRecharge);

        console.log(`✅ Turnover sebesar ${turnover} ditambahkan. Deposit: ${money}, Bonus: ${bonus}`);

        // Tambahkan bonus ke inviter hanya saat deposit pertama
        if (invite && totalRecharge === 0) {
            const [inviter] = await connection.query('SELECT phone FROM users WHERE code = ?', [invite]);

            if (inviter.length) {
                const inviterBonus = (money / 100) * parseInt(process.env.AGENT_BONUS_PERCENT || "0", 10);
                await connection.query(
                    'UPDATE users SET money = money + ?, total_money = total_money + ? WHERE code = ? AND phone = ?',
                    [inviterBonus, inviterBonus, invite, inviter[0].phone]
                );
                console.log(`✅ Bonus inviter sebesar ${inviterBonus} untuk ${inviter[0].phone}`);
            } else {
                console.warn(`⚠️ Tidak ditemukan inviter untuk kode undangan: ${invite}`);
            }
        }

    } catch (error) {
        console.error("❌ Gagal memproses deposit dan bonus:", error);
        throw new Error("Gagal memproses deposit dan bonus.");
    }
};


const getRechargeOrderId = () => {
    const date = new Date();
    let id_time = date.getUTCFullYear() + '' + date.getUTCMonth() + 1 + '' + date.getUTCDate();
    let id_order = Math.floor(Math.random() * (99999999999999 - 10000000000000 + 1)) + 10000000000000;

    return id_time + id_order
}

const rechargeTable = {
    getRecordByPhoneAndStatus: async ({ phone, status, type }) => {
        if (![PaymentStatusMap.SUCCESS, PaymentStatusMap.CANCELLED, PaymentStatusMap.PENDING].includes(status)) {
            throw Error("Invalid Payment Status!")
        }

        let recharge

        if (type) {
            [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ? AND type = ?', [phone, status, type]);
        } else {
            [recharge] = await connection.query('SELECT * FROM recharge WHERE phone = ? AND status = ?', [phone, status]);
        }

        return recharge.map((item) => ({
            id: item.id,
            orderId: item.id_order,
            transactionId: item.transaction_id,
            utr: item.utr,
            phone: item.phone,
            money: item.money,
            type: item.type,
            status: item.status,
            today: item.today,
            url: item.url,
            time: item.time,
        }))
    },
    getRechargeByOrderId: async ({ orderId }) => {
        const [recharge] = await connection.query('SELECT * FROM recharge WHERE id_order = ?', [orderId]);

        if (recharge.length === 0) {
            return null
        }

        return recharge.map((item) => ({
            id: item.id,
            orderId: item.id_order,
            transactionId: item.transaction_id,
            utr: item.utr,
            phone: item.phone,
            money: item.money,
            type: item.type,
            status: item.status,
            today: item.today,
            url: item.url,
            time: item.time,
        }))?.[0]
    },
    cancelById: async (id) => {
        if (typeof id !== "number") {
            throw Error("Invalid Recharge 'id' expected a number!")
        }


        await connection.query('UPDATE recharge SET status = 2 WHERE id = ?', [id]);
    },
    setStatusToSuccessByIdAndOrderId: async ({ id, orderId }) => {
        if (typeof id !== "number") {
            throw Error("Invalid Recharge 'id' expected a number!")
        }


        console.log(id, orderId)

        const [re] = await connection.query('UPDATE recharge SET status = 1 WHERE id = ? AND id_order = ?', [id, orderId]);
        console.log(re)
    },
    getCurrentTimeForTodayField: () => {
        return moment().format("YYYY-DD-MM h:mm:ss A")
    },
    getDMYDateOfTodayFiled: (today) => {
        return moment(today, "YYYY-DD-MM h:mm:ss A").format("DD-MM-YYYY")
    },
    create: async (newRecharge) => {

        if (newRecharge.url === undefined || newRecharge.url === null) {
            newRecharge.url = "0"
        }

        await connection.query(
            `INSERT INTO recharge SET id_order = ?, transaction_id = ?, phone = ?, money = ?, type = ?, status = ?, today = ?, url = ?, time = ?, utr = ?`,
            [newRecharge.orderId, newRecharge.transactionId, newRecharge.phone, newRecharge.money, newRecharge.type, newRecharge.status, newRecharge.today, newRecharge.url, newRecharge.time, newRecharge?.utr || "NULL"]
        );
        

        const [recharge] = await connection.query('SELECT * FROM recharge WHERE id_order = ?', [newRecharge.orderId]);

        if (recharge.length === 0) {
            throw Error("Unable to create recharge!")
        }

        return recharge[0]
    }
}






module.exports = {
    initiateUPIPayment,
    verifyUPIPayment,
    initiateWowPayPayment,
    verifyWowPayPayment,
    initiateManualUPIPayment,
    addManualUPIPaymentRequest,
    addManualUSDTPaymentRequest,
    initiateManualUSDTPayment,
    depositJayapayForm,
    depositJayapay,
    jayapayCallback,
}