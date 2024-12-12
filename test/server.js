const express = require('express');
const mqtt = require('mqtt');
const cors = require('cors');
const mysql = require('mysql2'); // Thư viện kết nối MySQL
const os = require('os'); // Thư viện để lấy IP của hệ thống

const app = express();
app.use(cors());

// Khởi tạo cổng cho server
const port = 3003;

// Hàm lấy địa chỉ IP cục bộ của máy
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.address;
      }
    }
  }
  return '127.0.0.1'; // Nếu không tìm thấy, trả về localhost
}

// Lấy địa chỉ IP động của máy khi khởi động
const localIP = getLocalIP();
console.log(`Detected local IP: ${localIP}`);

// Cấu hình MQTT với IP động
const mqttBroker = `mqtt://${localIP}:1997`;
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

// Hàm kiểm tra dữ liệu `temp` trong MySQL và cập nhật trạng thái LED
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
      const message = temp >= 20 ? 'L1_on' : 'L1_off';
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
  if (id === '1') {
    message = status === '1' ? 'L1_on' : 'L1_off';
  } else if (id === '2') {
    message = status === '1' ? 'L2_on' : 'L2_off';
  } else {
    res.status(400).send('Invalid LED ID');
    return;
  }

  // Gửi trạng thái qua MQTT để điều khiển LED và icon đồng bộ
  client.publish('Led', message, (err) => {
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

// API trả về IP hiện tại của server
app.get('/get-ip', (req, res) => {
    res.json({ ip: localIP });  // localIP là biến chứa địa chỉ IP đã lấy từ hàm getLocalIP()
});


// Cấu hình server Express
app.listen(port, () => {
  console.log(`Server is running at http://${localIP}:${port}`);
});
