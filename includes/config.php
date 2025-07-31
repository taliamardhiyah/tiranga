<?php
$host = "localhost"; // Sesuaikan dengan host database
$user = "root"; // Sesuaikan dengan user database
$password = "786lottery"; // Sesuaikan dengan password database
$database = "tirangasgame"; // Sesuaikan dengan nama database

$conn = new mysqli($host, $user, $password, $database);

// Cek koneksi
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}
?>
