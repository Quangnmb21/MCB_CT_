let chartSensorData = []; // Đổi tên biến để tránh xung đột
const maxDataPoints = 10;

// Hàm vẽ biểu đồ (cần được định nghĩa ở đây hoặc gọi từ thư viện Chart.js)
function drawChart() {
    // Vẽ lại biểu đồ sử dụng dữ liệu trong chartSensorData
    const ctx = document.getElementById('sensorChart').getContext('2d');
    
    // Nếu biểu đồ chưa được tạo, tạo mới
    if (typeof window.chart !== 'undefined') {
        window.chart.destroy(); // Hủy biểu đồ cũ
    }

    window.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartSensorData.map(data => data.label),
            datasets: [{
                label: 'Nhiệt độ (℃)',
                data: chartSensorData.map(data => data.temp),
                borderColor: 'red',
                fill: false,
            }, {
                label: 'Ánh sáng (lux)',
                data: chartSensorData.map(data => data.light),
                borderColor: 'yellow',
                fill: false,
            }, {
                label: 'Độ ẩm (%)',
                data: chartSensorData.map(data => data.humi),
                borderColor: 'blue',
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'category',
                },
                y: {
                    beginAtZero: false
                }
            }
        }
    });
}

// Lấy dữ liệu từ API và cập nhật biểu đồ
async function fetchChartData() {
    try {
        const response = await fetch('http://localhost:3000/api/datasensor/latest/summary');
        if (!response.ok) {
            throw new Error('Lỗi kết nối đến API');
        }
        const data = await response.json();

        // Kiểm tra dữ liệu hợp lệ
        if (data && data.length > 0) {
            console.log('Dữ liệu nhận được:', data);

            // Thêm dữ liệu vào mảng chartSensorData (hạn chế tối đa 10 điểm dữ liệu)
            if (chartSensorData.length >= maxDataPoints) {
                chartSensorData.shift(); // Xóa phần tử đầu tiên khi có quá 10 phần tử
            }

            // Thêm dữ liệu mới vào cuối mảng
            chartSensorData.push(...data.reverse()); // Đảo ngược dữ liệu để biểu đồ hiển thị từ dữ liệu cũ đến mới

            // Cập nhật thông tin cảm biến vào HTML (cập nhật lần cuối cho cảm biến)
            document.querySelector('.temperature-text').textContent = `${data[0].temp} ℃`;
            document.querySelector('.light-text').textContent = `${data[0].light} lux`;
            document.querySelector('.humidity-text').textContent = `${data[0].humi} %`;

            // Vẽ lại biểu đồ
            drawChart();
        } else {
            console.error('Dữ liệu không hợp lệ:', data);
        }
    } catch (error) {
        console.error('Lỗi lấy dữ liệu:', error);
    }
}

// Lấy dữ liệu lần đầu tiên khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    fetchChartData(); // Lấy dữ liệu ngay khi trang tải
    setInterval(fetchChartData, 5000); // Cập nhật mỗi 5 giây sau đó
});
