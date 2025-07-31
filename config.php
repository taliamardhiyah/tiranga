<?php
$host = "localhost"; 
$user = "root"; 
$pass = "786lottery"; 
$db = "tirangasgame";

$conn = mysqli_connect($host, $user, $pass, $db);
if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>
