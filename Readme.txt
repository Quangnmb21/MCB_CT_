
### Hướng dẫn sử dụng dự án: Điều khiển và theo dõi dữ liệu cảm biến

#### 1. Cài đặt Node.js
- Tải và cài đặt Node.js từ trang web chính thức: [https://nodejs.org/](https://nodejs.org/).
- Sau khi cài đặt, kiểm tra Node.js và npm bằng cách mở Terminal và chạy:
  ```bash
  node -v
  npm -v
  ```

#### 2. Cài đặt các thư viện cần thiết
- Mở Terminal trong thư mục chứa mã nguồn của bạn và chạy các lệnh sau để cài đặt các thư viện cần thiết:
  ```bash
  npm install express
  npm install body-parser
  npm install cors
  npm install mysql2
  npm install dotenv
  npm install -g nodemon
  ```
- Nếu muốn cài đặt tất cả các thư viện cùng lúc:
  ```bash
  npm install express body-parser cors mysql2 dotenv
  ```

#### 3. Chạy giao diện HTML
- File giao diện chính là `index.html`. Chỉ cần mở file này trên trình duyệt web (hoặc sử dụng công cụ hỗ trợ như Live Server của VS Code).

#### 4. Chạy server chính
- Tất cả các chức năng đều được quản lý bởi file server chính: `server-master.js`.
- Để chạy server, dùng lệnh:
  ```bash
  nodemon server-master.js
  ```

#### 5. Điều chỉnh thông số cho ESP8266 (nếu cần điều khiển LED)
- File điều khiển LED là `server-led.js`. Trong file này, bạn cần sửa các thông tin:
  - **User**: thay `'quang'` bằng thông tin người dùng của bạn.
  - **Port**: thay `1977` bằng cổng bạn sử dụng.
  - **IP WiFi**: thay `192.168.1.4` bằng địa chỉ IP của mạng WiFi.
  - **Password**: điền mật khẩu tương ứng.

#### 6. Cấu hình MySQL cho các file API
- Các file API sẽ kết nối đến cơ sở dữ liệu MySQL. Bạn cần:
  - Thay đổi thông tin kết nối (user, password, database) phù hợp với cấu hình của bạn.
  - Ví dụ: 
    Nếu trong file API có đoạn:
    ```js
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Quang',
        database: 'quang'
    });
    ```
    Hãy thay đổi `user`, `password` và `database` tương ứng với MySQL của bạn.

- Bảng trong MySQL mẫu:
  ```sql
  CREATE TABLE quang.device(
      id INT AUTO_INCREMENT PRIMARY KEY,
      device CHAR(25),
      action CHAR(25),
      Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
  );

  CREATE TABLE quang.datasensor(
      id INT AUTO_INCREMENT PRIMARY KEY,
      temp FLOAT,
      humi FLOAT,
      light INT,
      sensor INT,
      Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
  );
  ```

#### 7. Điều chỉnh cột dữ liệu trong file API
- Khi hiển thị dữ liệu lên HTML, bạn phải đảm bảo cột trong MySQL trùng với các trường trong đoạn mã JavaScript.
- Ví dụ: Trong `API-data.js`, có đoạn mã:
  ```js
  tableBody.innerHTML = "";
  data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
          <td>${row.id}</td>
          <td>${row.temp}</td>
          <td>${row.humi}</td>
          <td>${row.light}</td>
          <td>${row.Thoi_gian}</td>
      `;
      tableBody.appendChild(tr);
  });
  ```
  Nếu bảng của bạn không có cột `temp`, `humi`, hoặc `light`, bạn cần sửa lại cho phù hợp với cấu trúc bảng MySQL.

#### 8. Lập trình ESP8266
- File nạp code cho ESP8266 là `control_led_2.cpp`. Hãy nạp file này vào board ESP8266 để điều khiển LED.

#### Lưu ý:
- Hãy kiểm tra và thay đổi thông tin phù hợp với cấu hình hệ thống của bạn để đảm bảo dự án hoạt động trơn tru.
