import requests
import asyncio
from telegram import Bot

url = "https://pasificrim.live/api/webapi/GetNoaverageEmerdList"
headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64)",
    "X-Requested-With": "XMLHttpRequest",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Ganti token dengan yang benar
}

response = requests.post(url, headers=headers)

print(response.status_code)
print(response.text)  # Lihat respons dari server

TOKEN_TELEGRAM = "6844953276:AAE3OiWsYM4musWVw1Iy4_20sJDkc6bmIiM"
CHAT_ID = "-1001460863353"

bot = Bot(token=TOKEN_TELEGRAM)
last_sent_period = None  # Simpan periode terakhir agar tidak mengirim dobel


def fetch_latest_result():
    """ Mengambil data terbaru dari API """
    try:
        response = requests.post(API_URL, headers=HEADERS, data={})  # Tambahkan parameter jika diperlukan
        if response.status_code == 200:
            data = response.json()
            if "data" in data and "gameslist" in data["data"] and len(data["data"]["gameslist"]) > 0:
                return data["data"]["gameslist"][0]  # Ambil data terbaru
        return None
    except Exception as e:
        print(f"Error API: {e}")
        return None


def calculate_prediction(numbers):
    """ Menghitung prediksi berdasarkan jumlah semua angka di 'number' """
    if not numbers:
        return None

    total_sum = sum(int(n) for n in numbers)  # Jumlahkan semua angka
    last_digit = total_sum % 10  # Ambil digit terakhir
    prediction = "Besar" if last_digit >= 5 else "Kecil"

    return prediction, last_digit


async def send_prediction():
    global last_sent_period

    while True:
        result = fetch_latest_result()
        if result:
            period = result.get("period")
            numbers = result.get("number", [])  # Pastikan ini dalam bentuk list angka
            amount = result.get("amount")  # Hasil dari API

            if amount is not None and last_sent_period != period and numbers:
                prediction, last_digit = calculate_prediction(numbers)
                actual_result = "Besar" if amount >= 5 else "Kecil"  # Cek hasil dari API
                status = "✅ *Menang*" if prediction == actual_result else "❌ *Kalah*"

                message = (
                    f"📢 **Prediksi Wingo**\n"
                    f"Periode: {period}\n"
                    f"Angka: {numbers} (Jumlah: {sum(map(int, numbers))}, Digit Akhir: {last_digit})\n"
                    f"Prediksi: *{prediction}*\n"
                    f"Hasil: {amount} → *{actual_result}*\n"
                    f"Status: {status}"
                )

                last_sent_period = period  # Simpan periode terakhir biar tidak dobel kirim
                await bot.send_message(chat_id=CHAT_ID, text=message, parse_mode="Markdown")
                print(f"Prediksi {prediction} dikirim untuk periode {period}, Hasil: {actual_result}, Status: {status}")

        await asyncio.sleep(5)  # Tunggu 5 detik sebelum cek ulang


if __name__ == "__main__":
    asyncio.run(send_prediction())
