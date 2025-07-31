<?php
include '../includes/config.php'; // Koneksi ke database

session_start();
$id_user = $_SESSION['id_user']; // Ambil ID user dari sesi

if (!$id_user) {
    echo json_encode(['status' => 'error', 'message' => 'Silakan login terlebih dahulu']);
    exit;
}

// Cek apakah user sudah klaim bonus
$query_check = $conn->prepare("SELECT has_received_bonus FROM users WHERE id_user = ?");
$query_check->bind_param("s", $id_user);
$query_check->execute();
$result_check = $query_check->get_result();
$user = $result_check->fetch_assoc();

if ($user['has_received_bonus'] == 1) {
    echo json_encode(['status' => 'error', 'message' => 'Anda sudah pernah klaim bonus.']);
    exit;
}

// Ambil total deposit sukses user dari tabel recharge
$query_recharge = $conn->prepare("SELECT SUM(money) AS total_deposit FROM recharge WHERE phone = (SELECT phone FROM users WHERE id_user = ?) AND status = 'success'");
$query_recharge->bind_param("s", $id_user);
$query_recharge->execute();
$result_recharge = $query_recharge->get_result();
$deposit = $result_recharge->fetch_assoc();

$total_deposit = $deposit['total_deposit'] ?? 0;
if ($total_deposit <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'Anda belum melakukan deposit yang valid.']);
    exit;
}

// Hitung bonus 10%
$bonus = $total_deposit * 0.1;

// Update saldo user dan tandai sebagai sudah menerima bonus
$query_update = $conn->prepare("UPDATE users SET money = money + ?, has_received_bonus = 1 WHERE id_user = ?");
$query_update->bind_param("ds", $bonus, $id_user);
if ($query_update->execute()) {
    echo json_encode(['status' => 'success', 'message' => "Bonus Rp" . number_format($bonus) . " berhasil diklaim!"]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Gagal klaim bonus, coba lagi.']);
}
?>
