import time
import telebot
from collections import defaultdict
import threading
import logging

# Ganti dengan token bot Anda
TOKEN = '6844953276:AAErhm-a67gCEF70aum5KjcLlfNlb8-_CHs'

# Daftar ID grup yang ingin dipantau
group_ids = [-1001460863353, -1001834989539]  # Ganti dengan ID grup Anda

# Inisialisasi bot
bot = telebot.TeleBot(TOKEN)

# Dictionary untuk menyimpan data pesan yang dikirim per user per grup
group_messages = defaultdict(lambda: defaultdict(list))

# Fungsi untuk menghitung pesan per menit
def count_messages_per_minute():
    current_time = time.time()
    
    for group_id, user_messages in group_messages.items():
        for user_id, timestamps in list(user_messages.items()):
            # Hapus pesan yang lebih dari 1 menit
            group_messages[group_id][user_id] = [timestamp for timestamp in timestamps if current_time - timestamp < 60]
            
            # Jika lebih dari 2 pesan dalam 1 menit, kirim peringatan
            if len(group_messages[group_id][user_id]) > 2:
                bot.send_message(user_id, f"🚨 Peringatan! Anda telah mengirim lebih dari 2 pesan dalam 1 menit di grup {group_id}. Harap lebih bijak!")
            
            # Kirim biaya pesan yang telah dikirim
            total_messages = len(group_messages[group_id][user_id])
            biaya = total_messages * 20  # Rp 20 per pesan
            if total_messages > 0:
                bot.send_message(user_id, f"Di grup {group_id}, Anda telah mengirim {total_messages} pesan. Total biaya: Rp {biaya}")
    
    # Setiap detik, periksa pesan dan update waktu
    time.sleep(60)
    count_messages_per_minute()

# Menangani pesan yang dikirim oleh pengguna
@bot.message_handler(func=lambda message: True)
def handle_message(message):
    # Memeriksa apakah pesan datang dari salah satu grup yang dipantau
    if message.chat.id in group_ids:  
        if message.text:  # Menghitung pesan teks (stiker tidak dihitung)
            user_id = message.from_user.id
            group_id = message.chat.id
            group_messages[group_id][user_id].append(time.time())  # Menyimpan waktu pengiriman pesan

            # Log pesan yang diterima
            logging.info(f"Pesan diterima dari {message.from_user.username} di grup {group_id}: {message.text}")
        
        elif message.sticker:  # Tidak menghitung stiker
            logging.info(f"Stiker diterima dari {message.from_user.username} di grup {message.chat.id}. Tidak dihitung.")
            return

# Menambahkan perintah /cek_pesan untuk melihat pesan yang sudah dikirim
@bot.message_handler(commands=['cek_pesan'])
def cek_pesan(message):
    # Memeriksa apakah pesan datang dari salah satu grup yang dipantau
    if message.chat.id in group_ids:
        user_id = message.from_user.id
        group_id = message.chat.id
        total_pesan = len(group_messages[group_id][user_id])  # Menghitung jumlah pesan
        biaya = total_pesan * 20  # Rp 20 per pesan
        bot.send_message(message.chat.id, f"Di grup {group_id}, Anda telah mengirim {total_pesan} pesan. Total biaya: Rp {biaya}")

# Setup logging untuk melihat pesan yang diterima
logging.basicConfig(level=logging.INFO)

# Jalankan fungsi perhitungan pesan per menit di latar belakang
threading.Thread(target=count_messages_per_minute, daemon=True).start()

# Mulai bot
bot.polling(none_stop=True)
