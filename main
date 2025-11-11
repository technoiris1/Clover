import serial
import os
import time
import threading
import telebot
import subprocess
import google.generativeai as genai
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Wedge, Circle

# ----------------- CONFIGURATION -----------------
BOT_TOKEN = "8028449072:AAGN9Y0g03HmkdDVUtzSxKv6NNqg0Jq6BKg"
CHAT_ID = "8449212157"
PIPER_MODEL_PATH = os.path.expanduser("~/zephy/en_US-amy-medium.onnx")
SERIAL_PORT = "/dev/ttyUSB0"
BAUD_RATE = 9600
GEMINI_API_KEY = "AIzaSyBEYFVipsK4f5qc2Ts8QNwZolWZym-hK9w"

# ----------------- SETUP -----------------
bot = telebot.TeleBot(BOT_TOKEN)
arduino = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # wait for Arduino to reset
genai.configure(api_key=GEMINI_API_KEY)

# ----------------- GLOBAL VARIABLES -----------------
sensor_data = {"HEART": 0, "BODYTEMP": 0.0, "AIRQUALITY": 0, "TEMP": 0.0, "HUMIDITY": 0.0}

# ----------------- HELPER FUNCTIONS -----------------
def speak(text):
    """Piper TTS output with Telegram echo and ALSA playback."""
    if not text:
        return
    print(f"💬 Clover: {text}")
    try:
        bot.send_message(CHAT_ID, f"💬 Clover: {text}")
        subprocess.run(
            f"echo '{text}' | piper -m {PIPER_MODEL_PATH} --output-raw | "
            f"aplay -r 22050 -f S16_LE 2>/dev/null",
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False
        )
    except Exception as e:
        print(f"⚠ Piper TTS error: {e}")

def generate_sensor_string():
    return (
        f"🌡 Body Temp: {sensor_data['BODYTEMP']}°C\n"
        f"🌡 Surround Temp: {sensor_data['TEMP']}°C\n"
        f"💧 Humidity: {sensor_data['HUMIDITY']}%\n"
        f"❤ Heart Rate: {sensor_data['HEART']} BPM\n"
        f"🌬 Air Quality (AQI): {sensor_data['AIRQUALITY']}"
    )

def health_analysis(issue):
    try:
        prompt = f"User health issue: {issue}\nSensor readings:\n{generate_sensor_string()}\nProvide advice, procedures, and medicines if needed."
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("⚠ Health module error:", e)
        return "⚠ Error generating health advice. Try again later."

# ----------------- IMPROVED STYLISH GRAPH FUNCTIONS -----------------
def generate_graphs():
    """Generate highly improved graphs for all sensors."""
    try:
        for key, value in sensor_data.items():
            file_path = f"/tmp/{key}.png"
            if key == "AIRQUALITY":
                plot_semicircle_gauge(value, 100, key, file_path)
            elif key in ["TEMP", "BODYTEMP"]:
                plot_thermometer_realistic(value, 50, key, file_path)
            elif key == "HUMIDITY":
                plot_semicircle_gauge(value, 100, key, file_path)
            elif key == "HEART":
                plot_heart_realistic(value, key, file_path)

            with open(file_path, 'rb') as img:
                bot.send_photo(CHAT_ID, img)
    except Exception as e:
        print("⚠ Graph generation error:", e)

def plot_semicircle_gauge(value, max_val, title, file_path):
    """Upside-up semicircular gauge with dynamic pointer and colored segments."""
    fig, ax = plt.subplots(figsize=(4,2.5))
    ax.axis('off')
    
    # Colored ranges
    segments = [(0, 0.5, 'green'), (0.5, 0.75, 'yellow'), (0.75, 1.0, 'red')]
    for start, end, color in segments:
        wedge = Wedge(center=(0,0), r=1, theta1=180*start, theta2=180*end, width=0.3, facecolor=color, edgecolor='white')
        ax.add_patch(wedge)
    
    # Pointer
    angle = 180*(value/max_val)
    angle_rad = np.radians(angle)
    ax.plot([0, np.cos(np.pi - angle_rad)*0.7], [0, np.sin(np.pi - angle_rad)*0.7], color='darkred', linewidth=4)
    
    # Label
    ax.text(0, -0.2, f"{title}\n{value}/{max_val}", ha='center', va='center', fontsize=12, fontweight='bold')
    
    ax.set_xlim(-1,1)
    ax.set_ylim(-0.1,1.1)
    plt.savefig(file_path, bbox_inches='tight', transparent=True)
    plt.close()

def plot_thermometer_realistic(value, max_val, title, file_path):
    """Realistic thermometer style with bulb and mercury fill."""
    fig, ax = plt.subplots(figsize=(2,6))
    ax.axis('off')
    
    # Draw outline
    ax.plot([0,0],[0,max_val], color='black', linewidth=4)
    ax.add_patch(Circle((0,0),0.5,color='black'))
    
    # Mercury fill
    height = min(value,max_val)
    cmap = plt.get_cmap('coolwarm')
    fill_color = cmap(height/max_val)
    ax.bar(0, height, width=0.8, color=fill_color, edgecolor='black', zorder=5)
    ax.add_patch(Circle((0,0),0.5,color=fill_color, zorder=6))
    
    # Scale ticks
    for t in range(0, max_val+1, 5):
        ax.plot([-0.4,0.4],[t,t], color='black', linewidth=1)
        ax.text(0.6,t,str(t), va='center', ha='left', fontsize=8)
    
    ax.set_title(title, fontsize=12, fontweight='bold')
    ax.set_ylim(0,max_val+5)
    plt.savefig(file_path, bbox_inches='tight', transparent=True)
    plt.close()

def plot_heart_realistic(value, title, file_path):
    fig, ax = plt.subplots(figsize=(4,4))
    t = np.linspace(0, 2*np.pi, 1000)
    x = 16*np.sin(t)**3
    y = 13*np.cos(t)-5*np.cos(2*t)-2*np.cos(3*t)-np.cos(4*t)
    ax.fill(x, y, color='red', alpha=0.8)
    
    # Heart shadow for 3D effect
    ax.fill(x*0.95, y*0.95, color='pink', alpha=0.3)
    
    ax.text(0, 0, f"{value} BPM", ha='center', va='center', fontsize=16, fontweight='bold', color='white')
    ax.axis('equal')
    ax.axis('off')
    ax.set_title(title, fontsize=12, fontweight='bold')
    plt.savefig(file_path, bbox_inches='tight', transparent=True)
    plt.close()

# ----------------- ARDUINO LISTENER THREAD -----------------
def arduino_listener():
    while True:
        try:
            line = arduino.readline().decode('utf-8', errors='replace').strip()
            if line:
                for pair in line.split(","):
                    if "=" in pair:
                        key, val = pair.split("=")
                        try:
                            sensor_data[key] = float(val) if "." in val else int(val)
                        except:
                            sensor_data[key] = val
        except Exception as e:
            print("⚠ Arduino read error:", e)
        time.sleep(0.05)

# ----------------- TELEGRAM HANDLER -----------------
@bot.message_handler(func=lambda m: True)
def handle_message(msg):
    try:
        text = msg.text.lower()
        reply_text = ""

        # Detect if message contains a health issue keyword
        if text.startswith(("health", "issue", "analyse")):
            # Extract the rest of the message as the issue description
            issue_description = text.split(maxsplit=1)
            if len(issue_description) > 1:
                issue_text = issue_description[1]
            else:
                issue_text = "general health check"
            def ai_response():
                reply_text = health_analysis(issue_text)
                speak(reply_text)
                generate_graphs()
            threading.Thread(target=ai_response).start()
            return

        # Normal sensor queries
        if "body temperature" in text:
            reply_text = f"🤒 Body Temperature: {sensor_data['BODYTEMP']}°C"
        elif "temperature" in text:
            reply_text = f"🌡 Surroundings Temperature: {sensor_data['TEMP']}°C"
        elif "humidity" in text:
            reply_text = f"💧 Humidity: {sensor_data['HUMIDITY']}%"
        elif "heart rate" in text:
            reply_text = f"❤ Heart Rate: {sensor_data['HEART']} BPM"
        elif "air quality" in text:
            reply_text = f"🌬 Air Quality (AQI): {sensor_data['AIRQUALITY']}"
        else:
            reply_text = "❓ Ask about body temperature, temperature, humidity, heart rate, air quality, or health."

        speak(reply_text)
    except Exception as e:
        print("⚠ Telegram handling error:", e)

# ----------------- MAIN -----------------
if _name_ == "_main_":
    threading.Thread(target=arduino_listener, daemon=True).start()
    bot.send_message(CHAT_ID, "Clover Telegram Bot is running... 🌟 Ready to serve you!")
    print("Clover Telegram Bot is running... 🌟 Ready to serve you!")
    bot.infinity_polling(timeout=5, long_polling_timeout=2)
