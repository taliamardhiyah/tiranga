import moment from "moment";
import connection from "../config/connectDB.js";

import {
  REWARD_STATUS_TYPES_MAP,
  REWARD_TYPES_MAP,
} from "../constants/reward_types.js";

const VIP_REWORDS_LIST = [
  {
    level: 0,
    expRequired: 0,
    levelUpReward: 0,
    monthlyReward: 0,
    safePercentage: 0,
    rebateRate: 0,
  },
  {
    level: 1,
    expRequired: 30_000_000,
    levelUpReward: 79000,
    monthlyReward: 30000,
    safePercentage: 0.2,
    rebateRate: 0.05,
  },
  {
    level: 2,
    expRequired: 60_770_000,
    levelUpReward: 124000,
    monthlyReward: 60000,
    safePercentage: 0.2,
    rebateRate: 0.05,
  },
  {
    level: 3,
    expRequired: 255_500_000,
    levelUpReward: 230000,
    monthlyReward: 124000,
    safePercentage: 0.2,
    rebateRate: 0.1,
  },
  {
    level: 4,
    expRequired: 1_055_000_000,
    levelUpReward: 1100000,
    monthlyReward: 340000,
    safePercentage: 0.3,
    rebateRate: 0.1,
  },
  {
    level: 5,
    expRequired: 10_000_000,
    levelUpReward: 4000,
    monthlyReward: 1600,
    safePercentage: 0.3,
    rebateRate: 0.1,
  },
  {
    level: 6,
    expRequired: 80_000_000,
    levelUpReward: 16000,
    monthlyReward: 4000,
    safePercentage: 0.3,
    rebateRate: 0.15,
  },
  {
    level: 7,
    expRequired: 300_000_000,
    levelUpReward: 65000,
    monthlyReward: 16000,
    safePercentage: 0.4,
    rebateRate: 0.15,
  },
  {
    level: 8,
    expRequired: 1_000_000_000,
    levelUpReward: 170000,
    monthlyReward: 65000,
    safePercentage: 0.4,
    rebateRate: 0.15,
  },
  {
    level: 9,
    expRequired: 5_000_000_000,
    levelUpReward: 700000,
    monthlyReward: 170000,
    safePercentage: 0.4,
    rebateRate: 0.2,
  },
  {
    level: 10,
    expRequired: 9_999_999_999,
    levelUpReward: 1700000,
    monthlyReward: 700000,
    safePercentage: 0.7,
    rebateRate: 0.3,
  },
];

// helpers ---------------------------------------------------------------------
const getSubordinateDataByPhone = async (phone) => {
  const [gameWingo] = await connection.query(
    "SELECT SUM(money) as totalBettingAmount FROM minutes_1 WHERE phone = ?",
    [phone],
  );
  const gameWingoBettingAmount = gameWingo[0].totalBettingAmount || 0;

  const [gameK3] = await connection.query(
    "SELECT SUM(money) as totalBettingAmount FROM result_k3 WHERE phone = ?",
    [phone],
  );
  const gameK3BettingAmount = gameK3[0].totalBettingAmount || 0;

  const [game5D] = await connection.query(
    "SELECT SUM(money) as totalBettingAmount FROM result_5d WHERE phone = ?",
    [phone],
  );
  const game5DBettingAmount = game5D[0].totalBettingAmount || 0;

  const [gameTrxWingo] = await connection.query(
    "SELECT SUM(money) as totalBettingAmount FROM trx_wingo_bets WHERE phone = ?",
    [phone],
  );
  const gameTrxWingoBettingAmount = gameTrxWingo[0].totalBettingAmount || 0;

  return {
    bettingAmount:
      parseInt(gameWingoBettingAmount) +
      parseInt(gameK3BettingAmount) +
      parseInt(game5DBettingAmount) +
      parseInt(gameTrxWingoBettingAmount),
  };
};

const insertRewordClaim = async ({
  rewardId,
  rewardType,
  phone,
  amount,
  status,
  time,
}) => {
  await connection.execute(
    "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
    [rewardId, rewardType, phone, amount, status, time],
  );
};
// ------------------------------------------------------------------------------

// controllers -----------------------------------------------------------------

const DailyRebateBonusList = [
  {
    id: 1,
    rebetAmount: 50,
    bonusAmount: 0,
  },
]

const releaseRebateCommission = async () => {
  try {
    const [users] = await connection.query(
      "SELECT `vip_level`, `phone`, `money`,`id` FROM `users`",
    );

    for (let user of users) {
      const dailyRebateRewordId = 1;
      const today = moment().subtract(1, "days").valueOf();
      //const today = moment().startOf("day").valueOf();
      const [commissions] = await connection.query('SELECT SUM(`money`) as `sum` FROM commissions WHERE phone = ? AND `time` >= ? AND `level` <= 6;', [user.phone, today]);
      let comm_amt = 0;
      comm_amt = commissions[0].sum || 0;
    
      const todayRebateAmount = comm_amt;
  
  
      const [claimedBettingRow] = await connection.execute(
        "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ? AND `time` >= ?",
        [REWARD_TYPES_MAP.REBATE_BONUS, user.phone, today],
      );
  
      const dailyRebateRewordList = DailyRebateBonusList.map((item) => {
        return {
          id: item.id,
          bettingAmount: todayRebateAmount,
          requiredBettingAmount: item.rebetAmount,
          bonusAmount: todayRebateAmount,
          isFinished: todayRebateAmount >= item.rebetAmount,
          isClaimed: claimedBettingRow.some(
            (claimedReward) => claimedReward.reward_id === item.id,
          ),
        };
      });
  
      const claimableBonusData = dailyRebateRewordList.filter(
        (item) =>
          item.isFinished && item.bettingAmount >= item.requiredBettingAmount,
      );
      if (claimableBonusData.length === 0) {
        console.log("You does not meet the requirements to claim this reward!");
      }
      else{
        const claimedBonusData = claimableBonusData?.find(
          (item) => item.id === parseInt(dailyRebateRewordId),
        );
        const [bonusList] = await connection.query(
          "SELECT * FROM `claimed_rewards` WHERE `type` = ? AND `phone` = ? AND `time` >= ? AND `reward_id` = ?",
          [
            REWARD_TYPES_MAP.REBATE_BONUS,
            user.phone,
            today,
            claimedBonusData?.id,
          ],
        );
        if (bonusList.length > 0) {
          console.log("Bonus already claimed");
        }
        else{
        const time = moment().valueOf();
    
        await connection.execute(
          "UPDATE `users` SET `money` = `money` + ?, `total_money` = `total_money` + ? WHERE `phone` = ?",
          [claimedBonusData.bonusAmount, claimedBonusData.bonusAmount, user.phone],
        );
    
        await connection.execute(
          "INSERT INTO `claimed_rewards` (`reward_id`, `type`, `phone`, `amount`, `status`, `time`) VALUES (?, ?, ?, ?, ?, ?)",
          [
            claimedBonusData.id,
            REWARD_TYPES_MAP.REBATE_BONUS,
            user.phone,
            claimedBonusData.bonusAmount,
            REWARD_STATUS_TYPES_MAP.SUCCESS,
            time,
          ],
        );
        console.log("Successfully claimed daily betting bonus");
      }
      }
    }
  } catch (error) {
    console.log(error);
  }
}
const releaseVIPLevel = async () => {
  try {
    // let lastMonth1st2amUnix = moment().subtract(1, "months").startOf("month").add(2, "hours").unix();
    // let lastMonth1st2am = moment(lastMonth1st2amUnix * 1000).format("YYYY-MM-DD HH:mm:ss");
    const [users] = await connection.query(
      "SELECT `vip_level`, `phone`, `money`,`id` FROM `users`",
    );

    for (let user of users) {
      const { phone, money, vip_level: lastVipLevel, id } = user;
      const { bettingAmount: expPoint } =
        await getSubordinateDataByPhone(phone);

      const currentVipLevel = VIP_REWORDS_LIST.find((vip, index) => {
        if (VIP_REWORDS_LIST?.[index + 1]) {
          return (
            expPoint >= vip.expRequired &&
            expPoint < VIP_REWORDS_LIST[index + 1].expRequired
          );
        } else {
          return expPoint >= vip.expRequired;
        }
      });

      if (currentVipLevel.level === 0) {
        continue;
      }
      if (currentVipLevel.level > parseInt(lastVipLevel)) {
        // Update user's VIP level and Insert levelUpReward
        await connection.execute(
          "UPDATE users SET vip_level = ?, money = money + ?, total_money = total_money + ? WHERE phone = ?",
          [
            currentVipLevel.level,
            currentVipLevel.levelUpReward,
            currentVipLevel.levelUpReward,
            phone,
          ],
        );

        await insertRewordClaim({
          rewardId: currentVipLevel.level,
          rewardType: REWARD_TYPES_MAP.VIP_LEVEL_UP_BONUS,
          phone,
          amount: currentVipLevel.levelUpReward,
          status: REWARD_STATUS_TYPES_MAP.SUCCESS,
          time: moment().unix(),
        });
      } else {
        await connection.execute(
          "UPDATE users SET vip_level = ? WHERE phone = ?",
          [currentVipLevel.level, phone],
        );
      }

      // Insert monthly reward
      await insertRewordClaim({
        rewardId: currentVipLevel.level,
        rewardType: REWARD_TYPES_MAP.VIP_MONTHLY_REWARD,
        phone,
        amount: currentVipLevel.monthlyReward,
        status: REWARD_STATUS_TYPES_MAP.SUCCESS,
        time: moment().unix(),
      });
      let sql_noti = 'INSERT INTO notification SET recipient = ?, description = ?, isread = ?, noti_type = ?';
      await connection.query(sql_noti, [id, "Congrates! you received an monthly reward of "+currentVipLevel.monthlyReward+" !", '0', "Reward"]);
      await connection.execute(
        "UPDATE users SET money = money + ? WHERE phone = ?",
        [currentVipLevel.monthlyReward, phone],
      );
    }
  } catch (error) {
    console.log(error);
  }
};

// releaseVIPLevel();

const getMyVIPLevelInfo = async (req, res) => {
  try {
    const authToken = req.cookies.auth;

    if (!authToken) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const [users] = await connection.execute(
      "SELECT `phone`, `vip_level` FROM `users` WHERE `token` = ?",
      [authToken],
    );
    const phone = users[0].phone;
    const vipLevel = users[0].vip_level;

    const { bettingAmount: expPoint } = await getSubordinateDataByPhone(phone);

    const payoutDaysLeft = moment()
      .startOf("month")
      .add(1, "month")
      .add(2, "hours")
      .diff(moment(), "days");

    res.status(200).json({
      status: true,
      data: {
        expPoint: expPoint,
        vipLevel: vipLevel,
        payoutDaysLeft: payoutDaysLeft,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const getVIPHistory = async (req, res) => {
  try {
    const authToken = req.cookies.auth;

    if (!authToken) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    const [users] = await connection.execute(
      "SELECT `phone` FROM `users` WHERE `token` = ?",
      [authToken],
    );
    const phone = users[0].phone;

    const [claimedRewards] = await connection.execute(
      "SELECT * FROM `claimed_rewards` WHERE `phone` = ? AND (type = ? OR type = ?)",
      [
        phone,
        REWARD_TYPES_MAP.VIP_LEVEL_UP_BONUS,
        REWARD_TYPES_MAP.VIP_MONTHLY_REWARD,
      ],
    );

    res.status(200).json({
      status: true,
      list: claimedRewards,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports  = {
  releaseVIPLevel,
  getMyVIPLevelInfo,
  getVIPHistory,
  releaseRebateCommission,
};

