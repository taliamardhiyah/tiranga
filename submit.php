<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!empty($_POST["upi_ref_no"])) {
        echo "Kode Referensi: " . htmlspecialchars($_POST["upi_ref_no"]);
    } else {
        echo "Kode referensi wajib diisi!";
    }
} else {
    echo "Invalid request!";
}
?>
