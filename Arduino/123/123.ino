#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

// Các định nghĩa cũ
#define DPIN 4        // GPIO kết nối cảm biến DHT (D2)
#define DTYPE DHT11
DHT dht(DPIN, DTYPE);

// Cấu hình các chân
#define ANALOG_INPUT_PIN A0  // Chân analog (A0 trên ESP8266)
#define DIGITAL_INPUT_PIN 5  // Chân digital (D1 trên ESP8266 tương ứng với GPIO5)

// Các chân điều khiển LED hiện tại
#define D5 14  // Chân D5 (GPIO14) cho LED1
#define D6 12  // Chân D6 (GPIO12) cho LED2
#define D7 13  // Chân D7 (GPIO13) cho LED3

// Thêm các chân LED 4 và LED 5
#define D3 0   // Chân D3 (GPIO0) cho LED4
#define D4 2   // Chân D4 (GPIO2) cho LED5

// Wi-Fi và MQTT
const char* ssid = "Quang Tuan C5 2.4G";
const char* password = "quangtuan";
const char* mqtt_server = "192.168.1.4";

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (100)
char msg[MSG_BUFFER_SIZE];

// Hàm kết nối Wi-Fi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

// Hàm callback nhận lệnh từ MQTT
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);

  // Điều khiển các LED dựa trên lệnh nhận được
  if (message == "L1_off") {
    digitalWrite(D5, LOW);   // Tắt LED1
  } else if (message == "L1_on") {
    digitalWrite(D5, HIGH);  // Bật LED1
  } else if (message == "L2_off") {
    digitalWrite(D6, LOW);   // Tắt LED2
  } else if (message == "L2_on") {
    digitalWrite(D6, HIGH);  // Bật LED2
  } else if (message == "L3_off") {
    digitalWrite(D7, LOW);   // Tắt LED3
  } else if (message == "L3_on") {
    digitalWrite(D7, HIGH);  // Bật LED3
  } else if (message == "L4_off") {
    digitalWrite(D3, LOW);   // Tắt LED4
  } else if (message == "L4_on") {
    digitalWrite(D3, HIGH);  // Bật LED4
  } else if (message == "L5_off") {
    digitalWrite(D4, LOW);   // Tắt LED5
  } else if (message == "L5_on") {  
    digitalWrite(D4, HIGH);  // Bật LED5
  }
}

// Hàm kết nối MQTT
void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), "quang", "123")) {
      Serial.println("connected");
      client.subscribe("Led");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(BUILTIN_LED, OUTPUT);  // Khởi tạo chân LED tích hợp (nếu có)
  pinMode(D5, OUTPUT); // LED1
  pinMode(D6, OUTPUT); // LED2
  pinMode(D7, OUTPUT); // LED3  
  pinMode(D3, OUTPUT); // LED4
  pinMode(D4, OUTPUT); // LED5  
  pinMode(DIGITAL_INPUT_PIN, INPUT);  // Chân digital (D1)
  
  dht.begin();
  
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1997);
  client.setCallback(callback);
}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsg > 10000) {
    lastMsg = now;
  
    // Đọc dữ liệu từ cảm biến DHT
    float temp = dht.readTemperature(false);  // Đọc nhiệt độ (°C)
    float humi = dht.readHumidity();          // Đọc độ ẩm

    // Đọc giá trị từ các chân analog và digital
    int analogValue = random (0, 1000); // Đọc giá trị từ chân A0 (cảm biến ánh sáng)
    int digitalValue = digitalRead(DIGITAL_INPUT_PIN); // Đọc giá trị từ GPIO5 (chân digital)
    int add_sensor = random (0, 100);

    // Kiểm tra lỗi đọc cảm biến DHT
    if (isnan(temp) || isnan(humi)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      snprintf(msg, MSG_BUFFER_SIZE, "Temperature: %.2f C, Humidity: %.0f%%, Light: %d Lux, Sensor: %d", temp, humi, analogValue, add_sensor);
    }

    Serial.print("Publish message: ");
    Serial.println(msg);
    client.publish("data", msg);

    // Kiểm tra nếu giá trị cảm biến > 50, bật LED5 nhấp nháy 3 lần
    if (add_sensor > 50) {
      for (int i = 0; i < 3; i++) {
        digitalWrite(D4, HIGH);  // Bật LED5
        delay(250);              // Delay 250ms
        digitalWrite(D4, LOW);   // Tắt LED5
        delay(250);              // Delay 250ms
      }
    } else {
      digitalWrite(D4, LOW); // Tắt LED5 khi sensor <= 50
    }
  }
}
