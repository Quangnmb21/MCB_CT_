const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001; // Port cho server API

// Sử dụng CORS để cho phép frontend truy cập vào server
app.use(cors());

// Tạo kết nối tới cơ sở dữ liệu MySQL
const db = mysql.createConnection({
    host: 'localhost', // Tên máy chủ cơ sở dữ liệu (localhost hoặc IP)
    user: 'root',      // Tên người dùng
    password: 'Quang',      // Mật khẩu
    database: 'quang' // Tên cơ sở dữ liệu
});

// Kết nối đến cơ sở dữ liệu
db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối cơ sở dữ liệu:', err);
        return;
    }
    console.log('Kết nối cơ sở dữ liệu thành công');
});

// API trả về tất cả dữ liệu từ bảng datasensor
app.get('/api/datasensor/details', (req, res) => {
    // Lấy tất cả dữ liệu từ bảng datasensor
    const query = 'SELECT * FROM datasensor ORDER BY Thoi_gian DESC'; // Truy vấn lấy tất cả dữ liệu

    db.query(query, (err, result) => {
        if (err) {
            console.error('Lỗi truy vấn:', err);
            return res.status(500).json({ error: 'Lỗi truy vấn dữ liệu' });
        }

        // Chuyển đổi thời gian trước khi trả về dữ liệu
        const data = result.map(row => ({
            ...row,
            Thoi_gian: formatDate(row.Thoi_gian) // Chuyển đổi thời gian từ ISO 8601 thành 'YYYY-MM-DD HH:MM:SS'
        }));

        res.json(data); // Trả về dữ liệu dưới dạng JSON
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

// Bắt đầu server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
