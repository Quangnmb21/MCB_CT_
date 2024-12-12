const express = require('express');
const mysql = require('mysql2');
const mqtt = require('mqtt');
const cors = require('cors');

const app = express();
app.use(cors());

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

// Kết nối với MQTT Broker
const mqttClient = mqtt.connect('mqtt://192.168.1.11:1997', {
    username: 'quang',
    password: '123'
});

mqttClient.on('connect', () => {
    console.log('Đã kết nối đến MQTT Broker');
});

// API lấy 6 giá trị mới nhất từ cảm biến
app.get('/api/sensor/latest', (req, res) => {
    const query = 'SELECT id, sensor, Thoi_gian FROM datasensor ORDER BY id DESC LIMIT 6';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn dữ liệu:', err);
            res.status(500).send('Lỗi server');
            return;
        }

        // Kiểm tra giá trị cảm biến và gửi lệnh MQTT nếu cần
        const latestSensorValue = results[0].sensor;
        if (latestSensorValue > 50) {
            // Gửi lệnh bật LED qua MQTT nếu sensor > 50
            if (mqttClient.connected) {
                mqttClient.publish('home/led', 'L4_on', (err) => {
                    if (err) {
                        console.error('Lỗi khi gửi lệnh bật LED:', err);
                        res.status(500).send('Lỗi khi gửi lệnh bật LED');
                        return;
                    }
                    console.log('Đã gửi lệnh bật LED');
                });
            } else {
                console.log("MQTT chưa kết nối, không thể gửi lệnh bật LED");
            }
        } else {
            // Gửi lệnh tắt LED qua MQTT nếu sensor <= 50
            if (mqttClient.connected) {
                mqttClient.publish('home/led', 'L4_off', (err) => {
                    if (err) {
                        console.error('Lỗi khi gửi lệnh tắt LED:', err);
                        res.status(500).send('Lỗi khi gửi lệnh tắt LED');
                        return;
                    }
                    console.log('Đã gửi lệnh tắt LED');
                });
            } else {
                console.log("MQTT chưa kết nối, không thể gửi lệnh tắt LED");
            }
        }

        res.json(results);  // Trả về dữ liệu cảm biến cho frontend
    });
});

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
    mqttClient.publish('Led', message, (err) => {  // Thay 'client' thành 'mqttClient'
        if (err) {
            return res.status(500).send('Failed to publish MQTT message');
        }
        res.send(`LED${id} is now ${status === '1' ? 'on' : 'off'}`);
    });
});

// Khởi chạy server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
