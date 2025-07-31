<?php
session_start();
if (!isset($_SESSION['id_user'])) {
    header("Location: index.php"); // Redirect ke halaman login jika belum login
    exit;
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Klaim Bonus</title>
    <script src="assets/script.js" defer></script>
</head>
<body>
    <h2>Selamat Datang!</h2>
    <p>Silakan klaim bonus deposit 10% Anda.</p>

    <button id="claimBonus">Klaim Bonus 10%</button>
    <p id="result"></p>
</body>
</html>
