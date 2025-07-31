<?php
header("Content-Type: application/json");

$servername = "localhost";
$username = "root"; // Ganti dengan user database
$password = "786lottery"; // Ganti dengan password database
$dbname = "tirangasgame"; // Sesuaikan dengan database kamu

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database error"]));
}

// Simulasi taruhan baru
$member = "Mem" . rand(10000, 99999);
$bet = ["Green", "Orange", "Big", "Small"][rand(0, 3)];
$amount = rand(1000, 100000);
$result = rand(0, 1) ? "menang" : "kalah";

$sql = "INSERT INTO taruhan_log (member, bet, amount, result) VALUES ('$member', '$bet', '$amount', '$result')";
if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Taruhan berhasil disimpan"]);
} else {
    echo json_encode(["status" => "error", "message" => "Gagal menyimpan taruhan"]);
}

$conn->close();
?>
