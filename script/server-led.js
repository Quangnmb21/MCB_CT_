const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const mysql = require('mysql2'); // Thư viện kết nối MySQL

const app = express();
app.use(cors());

// Khởi tạo cổng cho server
const port = 3003;

// Cấu hình MQTT
const mqttBroker = 'mqtt://192.168.1.4:1997';
const client = mqtt.connect(mqttBroker, {
  username: 'quang',
  password: '123',
});

client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe('Led', (err) => {
    if (err) {
      console.error('Subscribe failed: ', err);
    }
  });
});

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',    // Địa chỉ MySQL server của bạn
  user: 'root',         // Tên người dùng MySQL
  password: 'Quang',    // Mật khẩu MySQL
  database: 'quang',    // Tên cơ sở dữ liệu của bạn
});

// Hàm kiểm tra dữ liệu `temp` trong MySQL
function checkTempAndPublish() {
  db.query('SELECT temp FROM datasensor ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Database query failed: ', err);
      return;
    }

    if (results.length > 0) {
      const temp = results[0].temp;
      console.log(`Current temperature: ${temp}`);

      // Đảm bảo trạng thái LED đồng bộ với icon: nếu nhiệt độ >= 28 thì bật, ngược lại tắt
      const message = temp >= 28 ? 'L1_on' : 'L1_off';
      client.publish('Led', message, (err) => {
        if (err) {
          console.error('Failed to publish MQTT message: ', err);
        } else {
          console.log(`Published message: ${message}`);
        }
      });
    } else {
      console.log('No data found in datasensor table');
    }
  });
}

// Kiểm tra dữ liệu mỗi 10 giây
setInterval(checkTempAndPublish, 10000);

// API Express để điều khiển LED qua HTTP
app.get('/led/:id/:status', (req, res) => {
  const { id, status } = req.params;
  let message = '';

  // Đồng bộ trạng thái LED và icon: khi bật LED, icon cũng bật
  if (id === '5') {
    message = status === '1' ? 'L5_on' : 'L5_off';
  } else {
    res.status(400).send('Invalid LED ID');
    return;
  }

  // Gửi trạng thái qua MQTT để điều khiển LED và icon đồng bộ
  mqttClient.publish('home/led', message, (err) => {
    if (err) {
      return res.status(500).send('Failed to publish MQTT message');
    }
    res.send(`LED${id} is now ${status === '1' ? 'on' : 'off'}`);
  });
});


// API để lấy giá trị nhiệt độ từ MySQL
app.get('/temp', (req, res) => {
  db.query('SELECT temp FROM datasensor ORDER BY id DESC LIMIT 1', (err, results) => {
    if (err) {
      console.error('Database query failed: ', err);
      res.status(500).send('Failed to fetch temperature');
      return;
    }

    if (results.length > 0) {
      const temp = results[0].temp;
      res.json({ temp });
    } else {
      res.status(404).send('No temperature data available');
    }
  });
});

// Cấu hình server Express
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
