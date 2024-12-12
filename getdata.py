import socket
import paho.mqtt.client as mqtt
import json
import mysql.connector

# Hàm lấy địa chỉ IP của máy tính trong mạng
def get_local_ip():
    try:
        # Tạo một socket kết nối giả để lấy IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception as e:
        print(f"Unable to get local IP: {e}")
        return "127.0.0.1"  # IP mặc định nếu lỗi

db = mysql.connector.connect(
    user='root',
    password='Quang',
    host='127.0.0.1',
    database='quang',
)

cursor = db.cursor()

def save_datasensor(temperature, humidity, light, sensor):
    try:
        sql = "INSERT INTO datasensor (temp, humi, light, sensor) VALUES  (%s, %s, %s, %s)"
        values = (temperature, humidity, light, sensor)
        cursor.execute(sql, values)
        db.commit()
        print(f"Data saved to datasensor: Temp={temperature}, Hum={humidity}, Light={light}, Add_sensor={sensor}")
        if sensor > 50:
            save_data1("WARNING", "on")
    except mysql.connector.Error as err:
        print(f"Error: {err}")

def save_data1(led, ledact):
    try:
        sql = "INSERT INTO device (device, action) VALUES (%s, %s)"
        values = (led, ledact)
        cursor.execute(sql, values)
        db.commit()
        print(f"Data saved to device: device={led}, action={ledact}")
    except mysql.connector.Error as err:
        print(f"Error: {err}")

def save_data(check):
    ledact = "on" if check == 1 else "off"
    for led in ["led_1", "led_2", "led_3", "led_5"]:
        try:
            sql = "INSERT INTO device (device, action) VALUES (%s, %s)"
            values = (led, ledact)
            cursor.execute(sql, values)
            db.commit()
            print(f"Data saved to devices: device={led}, action={ledact}")
        except mysql.connector.Error as err:
            print(f"Error: {err}")

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()
    print(f"Received message from topic {topic}: {payload}")
    if topic == "data":
        try:
            received_data = msg.payload.decode()
            data_parts = received_data.split(', ')
            temperature = None
            humidity = None
            light = None

            for part in data_parts:
                key, value = part.split(': ')
                if key == 'Temperature':
                    temperature = float(value.replace(' C', '').strip())
                elif key == 'Humidity':
                    humidity = float(value.replace('%', '').strip())
                elif key == 'Light':
                    light = int(value.replace(' Lux', '').strip())
                elif key == 'Sensor':
                    sensor = int(value.replace('', '').strip())

            save_datasensor(temperature, humidity, light, sensor)
        except Exception as e:
            print(f"Error processing data message: {e}")
    elif topic == "Led":
        if payload == "L1_on":
            save_data1("Led_1", "on")
        elif payload == "L1_off":
            save_data1("Led_1", "off")
        elif payload == "L2_on":
            save_data1("Led_2", "on")
        elif payload == "L2_off":
            save_data1("Led_2", "off")
        elif payload == "L3_off":
            save_data1("Led_3", "off")
        elif payload == "l3_on":
            save_data1("Led_3", "on")
        elif payload == "L5_off":
            save_data1("Led_5", "off")
        elif payload == "l5_on":
            save_data1("Led_5", "on")
        elif payload == "on":
            save_data(1)
        elif payload == "off":
            save_data(0)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker!")
        client.subscribe("Led")
        client.subscribe("data")
    else:
        print(f"Failed to connect, return code {rc}")

mqtt_client = mqtt.Client()
mqtt_client.username_pw_set("quang", "123")

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

local_ip = get_local_ip()
print(f"Local IP detected: {local_ip}")

mqtt_client.connect(local_ip, 1997, 60)
mqtt_client.loop_forever()
