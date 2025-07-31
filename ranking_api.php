<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "786lottery"; // Jika ada password, isi di sini
$dbname = "tirangasgame";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die(json_encode(["error" => "Koneksi gagal: " . $conn->connect_error]));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
    $result = $conn->query("SELECT * FROM ranking ORDER BY amount DESC");
    $players = [];
    while ($row = $result->fetch_assoc()) {
        $players[] = $row;
    }
    echo json_encode($players);
}

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (isset($data["id"]) && isset($data["amount"])) {
        $stmt = $conn->prepare("UPDATE ranking SET amount = ? WHERE id = ?");
        $stmt->bind_param("ii", $data["amount"], $data["id"]);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["error" => "Gagal update"]);
        }
    } else {
        echo json_encode(["error" => "Data tidak valid"]);
    }
}

$conn->close();
?>
