// src/controllers/crashController.js
import express from 'express';
import { User, Profit, Crash, CrashBets } from '../models';
import { Cache, Redis, DB } from '../services'; // Pastikan Anda memiliki layanan ini di proyek Anda

const crashController = {
    async index(req, res) {
        let game = await Crash.findOne({ order: [['id', 'DESC']] });
        if (!game) {
            game = await Crash.create({ hash: getSecret() });
        }
        const gameData = {
            id: game.id,
            hash: game.hash,
            price: await CrashBets.sum('price', { where: { round_id: game.id } }),
            bets: await getBets(game.id)
        };
        const bet = req.user ? await CrashBets.findOne({ where: { user_id: req.user.id, round_id: game.id, status: 0 } }) : null;
        const history = await getHistory();
        res.render('pages.crash', { game: gameData, bet, history });
    },

    async newBet(req, res) {
        // Implementasi logika newBet di sini
    },

    async addBetFake(req, res) {
        // Implementasi logika addBetFake di sini
    },

    async startSlider(req, res) {
        // Implementasi logika startSlider di sini
    },

    async getFloat(req, res) {
        // Implementasi logika getFloat di sini
    },

    async Cashout(req, res) {
        // Implementasi logika Cashout di sini
    },

    async newGame(req, res) {
        // Implementasi logika newGame di sini
    },

    async init(req, res) {
        const game = await Crash.findOne({ order: [['id', 'DESC']] });
        res.json({
            id: game.id,
            status: game.status,
            timer: settings.crash_timer
        });
    },

    async gotThis(req, res) {
        const { multiplier } = req.body;
        const game = await Crash.findOne({ order: [['id', 'DESC']] });

        if (game.status >= 2) {
            return res.json({ msg: 'The game has started, you cannot tweak!', type: 'error' });
        }

        if (!game.id) {
            return res.json({ msg: 'Failed to get game number!', type: 'error' });
        }

        if (!multiplier) {
            return res.json({ msg: 'Failed to get multiplier!', type: 'error' });
        }

        await Crash.update({ multiplier }, { where: { id: game.id } });
        res.json({ msg: `You set x${multiplier}!`, type: 'success' });
    }
};

async function getBets(round_id) {
    const list = await CrashBets.findAll({ where: { round_id }, order: [['id', 'DESC']] });
    const bets = [];
    for (const bet of list) {
        const user = await User.findByPk(bet.user_id);
        if (user) {
            bets.push({
                user: {
                    username: user.username,
                    avatar: user.avatar,
                    unique_id: user.unique_id
                },
                price: bet.price,
                withdraw: round(bet.withdraw, 2),
                color: getNumberColor(bet.withdraw),
                won: round(bet.won, 2),
                balType: bet.balType,
                status: bet.status
            });
        }
    }
    return bets;
}

function getNumberColor(n) {
    if (n > 6.49) return '#037cf3';
    if (n > 4.49) return '#1337d4';
    if (n > 2.99) return '#7118d4';
    if (n > 1.99) return '#a8128f';
    return '#cf1213';
}

async function getHistory() {
    const list = await Crash.findAll({ where: { status: 2 }, order: [['id', 'DESC']], limit: 10 });
    for (const item of list) {
        item.color = getColor(item.multiplier);
    }
    return list;
}

function getColor(float) {
    if (float > 6.49) return '#eebef1';
    if (float > 4.49) return '#dcd0ff';
    if (float > 2.49) return '#ccccff';
    if (float > 1.49) return '#afdafc';
    return '#a6caf0';
}

function getSecret() {
    const str = require('crypto').randomBytes(16).toString('hex');
    const game = Crash.findOne({ where: { hash: str } });
    if (game) return getSecret();
    return str;
}

export default crashController;

