<?php
include 'config.php';

$sql = "INSERT INTO taruhan_log (member, bet, amount, result, timestamp) 
        VALUES (1, 'Besar', 10000, 'Pending', NOW())";

if (mysqli_query($conn, $sql)) {
    echo "Sukses!";
} else {
    echo "Error: " . mysqli_error($conn);
}
?>
