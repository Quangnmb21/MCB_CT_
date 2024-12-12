const express = require('express');
const mysql = require('mysql2');
const mqtt = require('mqtt');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());

// Hàm lấy địa chỉ IP động của máy
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const details of iface) {
            if (details.family === 'IPv4' && !details.internal) {
                return details.address; // Trả về IP mạng nội bộ
            }
        }
    }
    return 'localhost'; // Trường hợp không lấy được IP
}

// Lấy IP hiện tại
const localIP = getLocalIP();
console.log(`Địa chỉ IP của máy là: ${localIP}`);

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Thay bằng username MySQL của bạn
    password: 'Quang', // Thay bằng password của bạn
    database: 'quang' // Thay bằng tên database của bạn
});

// Kiểm tra kết nối MySQL
db.connect(err => {
    if (err) {
        console.error('Kết nối MySQL thất bại:', err);
        return;
    }
    console.log('Kết nối MySQL thành công!');
});

// Kết nối với MQTT Broker bằng IP động
const mqttClient = mqtt.connect(`mqtt://${localIP}:1997`, {
    username: 'quang',
    password: '123'
});

mqttClient.on('connect', () => {
    console.log('Đã kết nối đến MQTT Broker');
});

app.get('/api/sensor/latest', (req, res) => {
    const query = 'SELECT id, sensor, Thoi_gian FROM datasensor ORDER BY id DESC LIMIT 6';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu:', err);
            return res.status(500).send('Lỗi server khi truy vấn dữ liệu');
        }

        const response = results.map(row => ({
            id: row.id,
            sensor: row.sensor,
            Thoi_gian: row.Thoi_gian.toISOString().slice(0, 19).replace('T', ' ')
        }));

        // Gửi lệnh MQTT nếu giá trị cảm biến > 50
        const latestSensorValue = response[0].sensor;
        const ledCommand = latestSensorValue > 50 ? 'L5_on' : 'L5_off';

        if (mqttClient.connected) {
            mqttClient.publish('Led', ledCommand, (err) => {
                if (err) {
                    console.error('Lỗi khi gửi lệnh bật/tắt LED:', err);
                } else {
                    console.log(`Đã gửi lệnh: ${ledCommand}`);
                }
            });
        } else {
            console.log("MQTT chưa kết nối, không thể gửi lệnh bật/tắt LED");
        }

        res.json(response);
    });
});

// API để điều khiển LED
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
    mqttClient.publish('Led', message, (err) => {
        if (err) {
            return res.status(500).send('Failed to publish MQTT message');
        }
        res.send(`LED${id} is now ${status === '1' ? 'on' : 'off'}`);
    });
});

// Cập nhật dữ liệu mỗi 5 giây
setInterval(() => {
    const query = 'SELECT id, sensor, Thoi_gian FROM datasensor ORDER BY id DESC LIMIT 6';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu:', err);
            return;
        }

        // Xử lý và đảm bảo giá trị thời gian đúng định dạng
        const response = results.map(row => ({
            id: row.id,
            sensor: row.sensor,  // Đảm bảo không có thay đổi kiểu
            Thoi_gian: row.Thoi_gian.toISOString().slice(0, 19).replace('T', ' ') // Chuyển đổi định dạng thời gian
        }));

        // Kiểm tra giá trị cảm biến và gửi lệnh MQTT nếu cần
        const latestSensorValue = response[0].sensor;
        const ledCommand = latestSensorValue > 50 ? 'L5_on' : 'L5_off';

        if (mqttClient.connected) {
            mqttClient.publish('home/led', ledCommand, (err) => {
                if (err) {
                    console.error('Lỗi khi gửi lệnh bật/tắt LED:', err);
                } else {
                    console.log(`Đã gửi lệnh: ${ledCommand}`);
                }
            });
        } else {
            console.log("MQTT chưa kết nối, không thể gửi lệnh bật/tắt LED");
        }
    });
}, 5000); // Cập nhật dữ liệu mỗi 5 giây

// Khởi chạy server
const PORT = 3004;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});