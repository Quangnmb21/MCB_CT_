const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 3002;

// Kết nối với cơ sở dữ liệu MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Quang',
    database: 'quang'
});

// Kết nối đến MySQL
db.connect((err) => {
    if (err) {
        console.error('Không thể kết nối tới MySQL:', err);
        return;
    }
    console.log('Kết nối thành công đến MySQL');
});

// Sử dụng cors để mở API cho client ngoài
app.use(cors());

// API lấy dữ liệu lịch sử từ bảng device
app.get('/api/history/details', (req, res) => {
    // Truy vấn lấy dữ liệu từ bảng `device`
    const query = 'SELECT id, device, action, Thoi_gian FROM device ORDER BY Thoi_gian DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Lỗi khi lấy dữ liệu từ MySQL:', err);
            res.status(500).send('Lỗi server');
            return;
        }
        // Trả về dữ liệu dưới dạng JSON
        // Đảm bảo trường Thoi_gian là định dạng chuẩn MySQL
        results.forEach(row => {
            row.Thoi_gian = row.Thoi_gian.toISOString().slice(0, 19).replace('T', ' '); // Định dạng lại thời gian nếu cần
        });
        res.json(results);
    });
});



// Hàm format thời gian
function formatDate(date) {
    const newDate = new Date(date);
    return `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')} ${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}:${String(newDate.getSeconds()).padStart(2, '0')}`;
}

// Lắng nghe tại port 3002
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
