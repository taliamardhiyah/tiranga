

<?php
session_start();

$apiUrl = "https://pasificrim.live/api/webapi/GetNoaverageEmerdList";
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxMTMsImlkX3VzZXIiOiIxNTkzNiIsInBob25lIjoiMTMxMjUiLCJ0b2tlbiI6ImNiYWI2Y2Q0YzMzNmQ5ODJlZmFjMTJmMGQ2YzBjNDVhIiwibmFtZV91c2VyIjoiTWVtYmVyNTE0MDQiLCJwbGFpbl9wYXNzd29yZCI6IjEyMzQxMjM0IiwidG90YWxfbW9uZXkiOjgwOTM4Mzg5LCJpbnZpdGVyX21vbmV5IjowLCJyb3Nlc19mMSI6MTczNjMxOTUsInJvc2VzX2YiOjY2MTIzMjk1LCJyb3Nlc190b2RheSI6MCwibGV2ZWwiOjEsInJhbmsiOjEsImNvZGUiOiJvQ3RQSjI4MDYwIiwiaW52aXRlIjoiNmZHR3c0MjQwMCIsImN0diI6IjAwMDAwMCIsIm90cCI6IjQ0NDA5NCIsInRvZGF5IjoiMjAyMy0xMC0wNFQxMjowMDoyNS4wMDBaIiwidGltZV9vdHAiOiIwIiwidXNlcl9sZXZlbCI6MSwiaGFzX3JlY2VpdmVkX2JvbnVzIjowLCJtZW1iZXJfdHlwZSI6Im5ldyJ9LCJ0aW1lTm93IjoxNzQxOTA4OTc2MjAxLCJpYXQiOjE3NDE5MjQ0MTksImV4cCI6MTc0MjAxMDgxOX0.FfnRrubOfTn5gAC0q3I5_erGNoEFnIyTYkobqC0v42Y"; // Ganti dengan token user yang valid
$historyFile = "history.json"; // File untuk menyimpan riwayat 20 hasil terakhir
$telegramBotToken = "7714318488:AAFXj73WH_ct0WWLGC4WihvUwfd9BPC7FHA"; // Token bot Telegram
$telegramChatID = "-1001460863353"; // Chat ID Group

// Fungsi untuk mengambil data dari API
function getGameData($url, $token) {
    $headers = [
        "Content-Type: application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie: token=$token"
    ];

    $postData = http_build_query([
        "typeid" => 1,
        "pageno" => 0,
        "pageto" => 10,
        "language" => "vi"
    ]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

// Fungsi untuk menyimpan dan mengelola riwayat
function updateHistory($newData, $file) {
    $history = [];

    // Cek jika file history sudah ada
    if (file_exists($file)) {
        $history = json_decode(file_get_contents($file), true);
    }

    // Tambahkan data terbaru
    array_unshift($history, $newData);

    // Batasi hanya 20 data terakhir
    if (count($history) > 20) {
        array_pop($history);
    }

    // Simpan kembali ke file JSON
    file_put_contents($file, json_encode($history, JSON_PRETTY_PRINT));
}

// Fungsi untuk mengirim pesan ke Telegram
function sendToTelegram($message, $botToken, $chatID) {
    $url = "https://api.telegram.org/bot$botToken/sendMessage";
    $data = [
        'chat_id' => $chatID,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];

    $options = [
        'http' => [
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
        ]
    ];

    $context  = stream_context_create($options);
    file_get_contents($url, false, $context);
}

// Ambil data game terbaru
$gameData = getGameData($apiUrl, $token);

if ($gameData && isset($gameData['data']['gameslist'])) {
    $games = $gameData['data']['gameslist'];
    $latestGame = $games[0]; // Game terbaru
    $latestPeriod = intval($latestGame['period']);

    // Tentukan prediksi periode berikutnya (BBKKBB)
    $pattern = ['B', 'B', 'K', 'K', 'B', 'B'];
    $nextPrediction = $pattern[$latestPeriod % count($pattern)];

    // Cek jika periode terbaru sudah keluar
    foreach ($games as $game) {
        if (intval($game['period']) === ($latestPeriod + 1)) {
            $actualAmount = $game['amount'];
            $actualResult = ($actualAmount >= 5) ? 'B' : 'K';

            $winLoss = ($nextPrediction === $actualResult) ? "Menang ✅" : "Kalah ❌";

            // Simpan hasil ke history
            updateHistory([
                "periode" => $latestPeriod + 1,
                "prediksi" => $nextPrediction,
                "hasil" => $actualResult,
                "status" => $winLoss
            ], $historyFile);

            // Format pesan untuk Telegram
            $message = "<b>🎰 Hasil Periode Terbaru</b>\n\n";
            $message .= "🆔 <b>Periode:</b> " . ($latestPeriod + 1) . "\n";
            $message .= "📌 <b>Prediksi:</b> $nextPrediction\n";
            $message .= "🎲 <b>Hasil:</b> $actualResult\n";
            $message .= "🏆 <b>Status:</b> $winLoss\n\n";

            // Riwayat 20 periode terakhir
            if (file_exists($historyFile)) {
                $history = json_decode(file_get_contents($historyFile), true);
                $message .= "<b>📜 Riwayat 20 Periode Terakhir</b>\n";
                foreach ($history as $entry) {
                    $message .= "📅 <b>Periode:</b> {$entry['periode']} | 🎯 {$entry['prediksi']} | 🎲 {$entry['hasil']} | 🏅 {$entry['status']}\n";
                }
            }

            // Kata-kata menarik untuk prediksi berikutnya
            $message .= "\n🔥 <b>Prediksi Periode " . ($latestPeriod + 2) . ":</b> $nextPrediction\n";
            $message .= "💡 Peluang besar menanti, bersiaplah untuk kemenangan selanjutnya! 🎯🔥\n";

            // Kirim ke Telegram
            sendToTelegram($message, $telegramBotToken, $telegramChatID);
        }
    }
} else {
    echo "Gagal mengambil data game.";
}
?>
