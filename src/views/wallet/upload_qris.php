<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $target_dir = "src/images/";
    $target_file = $target_dir . basename($_FILES["qris_image"]["name"]);
    $uploadOk = 1;

    // Check if image file is a valid image
    $check = getimagesize($_FILES["qris_image"]["tmp_name"]);
    if ($check !== false) {
        move_uploaded_file($_FILES["qris_image"]["tmp_name"], $target_file);

        // Simpan URL ke database
        $conn = new mysqli("localhost", "root", "cluu", "tirangasgame");
        $description = $conn->real_escape_string($_POST['description']);
        $sql = "INSERT INTO qris_data (image_url, description) VALUES ('$target_file', '$description')";
        $conn->query($sql);
        echo "QRIS berhasil diunggah.";
    } else {
        echo "File bukan gambar.";
    }
}
?>
