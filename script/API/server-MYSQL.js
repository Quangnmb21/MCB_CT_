const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Tạo ứng dụng Express
const app = express();
const port = 3000;

// Cấu hình CORS để cho phép frontend truy cập
app.use(cors({
    origin: '*',  // Cho phép tất cả các nguồn truy cập
}));

// Cấu hình kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Quang', // Sử dụng mật khẩu của bạn
    database: 'quang', // Tên database của bạn
});

// Kết nối với MySQL
db.connect((err) => {
    if (err) {
        console.error('Lỗi kết nối MySQL:', err);
    } else {
        console.log('Đã kết nối MySQL');
    }
});

// API lấy 10 dữ liệu mới nhất
app.get('/api/datasensor/latest/summary', (req, res) => {
    const query = 'SELECT * FROM datasensor ORDER BY Thoi_gian DESC LIMIT 10'; // Truy vấn lấy 10 dữ liệu mới nhất

    db.query(query, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            res.status(500).json({ error: 'Lỗi truy vấn dữ liệu' });
        } else {
            if (result.length > 0) {
                // Trả về 10 dòng dữ liệu mới nhất mà không thay đổi thời gian
                const data = result.map(row => ({
                    temp: row.temp,
                    light: row.light,
                    humi: row.humi,
                    label: row.Thoi_gian.toISOString().replace('T', ' ').slice(0, 19) // Chuyển thời gian về dạng 'YYYY-MM-DD HH:MM:SS'
                }));
                res.json(data); // Trả dữ liệu dưới dạng JSON
            } else {
                res.status(404).json({ error: 'Không tìm thấy dữ liệu' });
            }
        }
    });
});

// Hàm formatDate để chuyển đổi thời gian từ ISO 8601 thành 'YYYY-MM-DD HH:MM:SS'
function formatDate(date) {
    const newDate = new Date(date);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const hours = String(newDate.getHours()).padStart(2, '0');
    const minutes = String(newDate.getMinutes()).padStart(2, '0');
    const seconds = String(newDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Khởi động server tại cổng 3000
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
