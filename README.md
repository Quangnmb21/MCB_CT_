
# Hướng Dẫn Cài Đặt và Sử Dụng Hệ Thống Điều Khiển và Giám Sát Thiết Bị IoT

## Giới Thiệu

Dự án này bao gồm: 
1. Giao diện web (HTML, CSS, JS) để hiển thị và điều khiển các thiết bị IoT.
2. Hệ thống server Node.js xử lý dữ liệu và giao tiếp với cơ sở dữ liệu MySQL.
3. ESP8266 để điều khiển LED qua WiFi.

## Các Thành Phần Cần Thiết

### Yêu cầu phần mềm:
- Node.js (phiên bản mới nhất)
- MySQL
- Trình duyệt web hỗ trợ HTML5 (Chrome, Firefox, ...)

### Yêu cầu phần cứng:
- Máy tính cài đặt Node.js và MySQL
- Thiết bị ESP8266 hoặc tương tự
- Đường truyền WiFi

---

## Hướng Dẫn Cài Đặt

### 1. Cài đặt môi trường:
1. **Cài đặt Node.js**:
   - Tải và cài đặt Node.js từ [https://nodejs.org](https://nodejs.org).

2. **Cài đặt MySQL**:
   - Thiết lập cơ sở dữ liệu theo cấu trúc:
     ```sql
     CREATE TABLE quang.device (
         id INT AUTO_INCREMENT PRIMARY KEY,
         device CHAR(25),
         action CHAR(25),
         Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
     );

     CREATE TABLE quang.datasensor (
         id INT AUTO_INCREMENT PRIMARY KEY,
         temp FLOAT,
         humi FLOAT,
         light INT,
         Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
     );
     ```

3. **Tạo tài khoản MySQL phù hợp**:
   - Đổi `user`, `password`, và `database` trong các file API để khớp với cấu hình của bạn. Ví dụ:
     ```js
     const db = mysql.createConnection({
         host: 'localhost',
         user: 'root',
         password: 'yourpassword',
         database: 'yourdatabase'
     });
     ```

### 2. Cài đặt Node.js server:
1. **Tải các thư viện cần thiết**:
   - Mở terminal tại thư mục dự án và chạy:
     ```bash
     npm install express body-parser cors mysql2 dotenv
     npm install -g nodemon
     ```

2. **Cấu hình server**:
   - Đổi các thông số kết nối MySQL và ESP8266 trong file `server-led.js`:
     ```js
     const MQTT_BROKER = '192.168.1.4'; // Địa chỉ IP của broker MQTT
     const MQTT_PORT = 1977; // Port MQTT
     const MQTT_USER = 'quang'; // Tên đăng nhập
     const MQTT_PASSWORD = 'password'; // Mật khẩu
     ```

3. **Khởi chạy server**:
   - Chạy `server-master.js` để khởi động toàn bộ hệ thống server:
     ```bash
     nodemon server-master.js
     ```

---

## Hướng Dẫn Sử Dụng

### 1. Giao diện web:
- Mở file `index.html` trong trình duyệt.
- Các tính năng:
  - **Xem dữ liệu cảm biến**: Hiển thị thông tin `nhiệt độ`, `độ ẩm`, `ánh sáng`.
  - **Xem lịch sử hành động**: Hiển thị bảng lịch sử thiết bị được điều khiển.

### 2. Điều khiển LED:
- Giao tiếp với ESP8266 qua MQTT để bật/tắt đèn LED:
  - Mở trình duyệt tại giao diện chính và chọn nút bật/tắt LED.

---

## Lưu Ý

### Đối với ESP8266:
- Nạp chương trình `control_led_2.cpp` lên ESP8266.
- Cập nhật thông số mạng (SSID, Password) để khớp với mạng của bạn.

### Đối với API:
- Trong các file API, đảm bảo cột trong HTML trùng khớp với cột của bảng trong cơ sở dữ liệu. Ví dụ:
  ```html
  <td>${row.id}</td>
  <td>${row.temp}</td>
  <td>${row.humi}</td>
  <td>${row.light}</td>
  <td>${row.Thoi_gian}</td>
  ```

---

## Hỗ Trợ

Nếu gặp vấn đề, hãy liên hệ [người phát triển hệ thống].
