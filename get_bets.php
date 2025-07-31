<?php
header("Content-Type: application/json");

$servername = "localhost";
$username = "root"; // Sesuaikan dengan database
$password = "786lottery"; 
$dbname = "tirangasgame"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database error"]));
}

// Ambil taruhan terbaru
$sql = "SELECT * FROM taruhan_log ORDER BY timestamp DESC LIMIT 10";
$result = $conn->query($sql);

$bets = [];
while ($row = $result->fetch_assoc()) {
    $bets[] = $row;
}

$conn->close();
echo json_encode($bets);
?>