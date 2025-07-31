const withdrawalList = document.getElementById("withdrawal-list");

// Data awal daftar penarikan
let withdrawals = [
    { user: "userxxx1000", amount: 123456 },
    { user: "userxxx2000", amount: 654321 },
    { user: "userxxx3000", amount: 789012 },
    { user: "userxxx4000", amount: 345678 },
    { user: "userxxx5000", amount: 987654 },
    { user: "userxxx6000", amount: 234567 },
    { user: "userxxx7000", amount: 876543 },
    { user: "userxxx8000", amount: 543210 },
    { user: "userxxx9000", amount: 210987 },
];

// Fungsi untuk memperbarui daftar penarikan di UI
function updateWithdrawals() {
    withdrawalList.innerHTML = ""; // Hapus daftar lama

    withdrawals.slice(-10).forEach((data) => {
        let item = document.createElement("div");
        item.className = "withdrawal-item";
        item.innerHTML = `<span>${data.user}</span> <strong>Rp${data.amount.toLocaleString()}</strong>`;
        withdrawalList.appendChild(item);
    });
}

// Fungsi untuk menambahkan data baru setiap 6 detik
function addWithdrawal() {
    let newUser = `userxxx${Math.floor(Math.random() * 9000) + 1000}`;
    let newAmount = Math.floor(Math.random() * 1000000) + 100000;

    withdrawals.push({ user: newUser, amount: newAmount });

    if (withdrawals.length > 10) {
        withdrawals.shift(); // Hapus yang paling lama jika lebih dari 10
    }

    updateWithdrawals();
}

// Jalankan pertama kali dan perbarui setiap 6 detik
updateWithdrawals();
setInterval(addWithdrawal, 6000);
