// app.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set EJS sebagai view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Koneksi Database (Gunakan MySQL dengan Sequelize)
const sequelize = new Sequelize('tirangasgame', 'root', '786lottery', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
});

// Model untuk Game Crash dan User
const CrashGame = sequelize.define('CrashGame', {
    crash_point: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'waiting' },
}, { timestamps: true });

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    balance: { type: DataTypes.FLOAT, defaultValue: 1000 },
}, { timestamps: true });

const Bet = sequelize.define('Bet', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    crashAt: { type: DataTypes.FLOAT, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
}, { timestamps: true });

User.hasMany(Bet, { foreignKey: 'userId' });
Bet.belongsTo(User, { foreignKey: 'userId' });
sequelize.sync({ force: true }); // Hapus tabel lama dan buat ulang

// Variabel game
let crashPoint = 1.00;
let gameRunning = false;
let bets = [];

// Fungsi untuk memulai game Crash
const startCrashGame = () => {
    if (gameRunning) return;
    gameRunning = true;
    crashPoint = 1.00;
    bets = [];

    let interval = setInterval(() => {
        crashPoint += 0.01;
        io.emit('crash_update', { crashPoint });

        if (Math.random() < 0.02 || crashPoint >= 10) { // Simulasi crash
            clearInterval(interval);
            io.emit('crash_end', { crashPoint });
            CrashGame.create({ crash_point: crashPoint, status: 'completed' });
            gameRunning = false;
            
            bets.forEach(async (bet) => {
                const user = await User.findByPk(bet.userId);
                if (bet.crashAt >= crashPoint) {
                    let winnings = bet.amount * bet.crashAt;
                    await user.update({ balance: user.balance + winnings });
                } else {
                    await user.update({ balance: user.balance - bet.amount });
                }
            });
            setTimeout(startCrashGame, 5000); // Tunggu 5 detik sebelum mulai lagi
        }
    }, 100);
};

// Socket.io Handler
io.on('connection', (socket) => {
    console.log('User connected');
    socket.emit('crash_update', { crashPoint });
});

// Route untuk menampilkan halaman game
app.get('/', async (req, res) => {
    const users = await User.findAll();
    res.render('index', { crashPoint, users });
});

// Route untuk bertaruh
app.post('/bet', async (req, res) => {
    const { username, amount, crashAt } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || user.balance < amount) {
        return res.status(400).send('Saldo tidak cukup atau user tidak ditemukan.');
    }
    const bet = await Bet.create({ userId: user.id, amount, crashAt, status: 'pending' });
    bets.push(bet);
    res.redirect('/');
});

// Route untuk panel admin
app.get('/admin', async (req, res) => {
    const users = await User.findAll();
    const games = await CrashGame.findAll();
    const allBets = await Bet.findAll({ include: User });
    res.render('admin', { users, games, allBets });
});

// Mulai server
const PORT = 3455;
server.listen(PORT, '0.0.0.0', () => {

    console.log(`Server berjalan di port ${PORT}`);
    startCrashGame(); // Mulai game saat server berjalan
});
