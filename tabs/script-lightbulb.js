// Trạng thái ban đầu của LED (tắt)
let isLedOn = false;

// Hàm bật/tắt LED và gửi yêu cầu API điều khiển LED
function toggleLED() {
    // Lấy icon LED
    const ledIcon = document.getElementById("ledIcon");

    // Thay đổi trạng thái LED
    isLedOn = !isLedOn;

    // Thay đổi icon (bật/tắt LED)
    if (isLedOn) {
        ledIcon.classList.add("on");  // Thêm class 'on' khi LED bật
    } else {
        ledIcon.classList.remove("on");  // Xóa class 'on' khi LED tắt
    }

    // Gửi lệnh qua API đến server để bật/tắt LED
    const deviceStatus = isLedOn ? '1' : '0';

    fetch(`http://localhost:3004/led/5/${deviceStatus}`)
        .then(response => response.text())
        .then(data => {
            console.log(`LED5 updated: ${data}`);
        })
        .catch(error => {
            console.error('Error updating LED5:', error);
            // Nếu có lỗi khi gửi yêu cầu, reset lại trạng thái của LED
            isLedOn = !isLedOn;
            if (isLedOn) {
                ledIcon.classList.add("on");
            } else {
                ledIcon.classList.remove("on");
            }
        });
}

// Hàm nhấp nháy LED 3 lần
// function blinkLed() {
//     const ledIcon = document.getElementById("ledIcon");
//     let blinkCount = 0;

//     const interval = setInterval(() => {
//         ledIcon.classList.toggle("on"); // Bật tắt icon
//         blinkCount++;

//         if (blinkCount >= 6) { // 3 lần nhấp nháy (bật + tắt = 1 lần)
//             clearInterval(interval); // Dừng nhấp nháy
//         }
//     }, 500); // Mỗi 500ms đổi trạng thái
// }

// Hàm kiểm tra giá trị cảm biến và nhấp nháy LED nếu cần
function checkSensorStatus() {
    fetch('http://localhost:3004/api/sensor/latest')
        .then(response => response.json())
        .then(data => {
            const latestSensorValue = data[0].sensor;

            if (latestSensorValue > 50) {
                // Nếu giá trị cảm biến > 50, gọi L5_on và nhấp nháy LED
                console.log('Sensor value > 50, triggering L5_on and blinking LED');
                blinkLed();
            } else {
                console.log('Sensor value <= 50, no action required');
            }
        })
        .catch(error => console.error('Error fetching sensor data:', error));
}

// Gọi kiểm tra mỗi 10 giây
setInterval(checkSensorStatus, 10000);


checkSensorStatus();  // Gọi hàm khi trang web tải





// Gọi API và vẽ biểu đồ
async function drawSensorChart() {
    try {
        // Gọi API lấy dữ liệu
        const response = await fetch('http://localhost:3004/api/sensor/latest');
        const data = await response.json();

        // Trích xuất giá trị để vẽ
        const labels = data.map(item => item.Thoi_gian); // Dùng thời gian làm nhãn
        const values = data.map(item => item.sensor);   // Giá trị sensor

        // Vẽ biểu đồ bằng Chart.js
        const ctx = document.getElementById('sensorChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.reverse(), // Hiển thị từ cũ đến mới
                datasets: [{
                    label: 'Sensor Data',
                    data: values.reverse(),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Sensor Value'
                        }
                    }
                }
            }
        });

        // Hiển thị giá trị sensor mới nhất vào phần Fan
        const latestSensorValue = data[0].sensor; // Lấy giá trị sensor đầu tiên
        const fanText = document.getElementById("fanIcon-text");
        fanText.innerHTML = `${latestSensorValue} m/s`; // Cập nhật giá trị vào phần Fan

        // Kiểm tra và tự động bật/tắt LED dựa trên giá trị cảm biến
        if (latestSensorValue > 50 && !isLedOn) {
            toggleLED(true); // Bật LED
        } else if (latestSensorValue <= 50 && isLedOn) {
            toggleLED(false); // Tắt LED
        }

    } catch (error) {
        console.error('Lỗi khi tải dữ liệu hoặc vẽ biểu đồ:', error);
    }
}

// Gọi hàm vẽ biểu đồ khi tải trang
drawSensorChart();

// Lắng nghe sự kiện tải DOM để vẽ lại biểu đồ
document.addEventListener("DOMContentLoaded", () => {
    drawSensorChart();
});

// Trạng thái ban đầu của Fan (dừng) và LED (tắt)
let isFanSpinning = false;


// Hàm bật/tắt quạt
function toggleFan() {
    const fanIcon = document.getElementById("fanIcon");
    isFanSpinning = !isFanSpinning;

    if (isFanSpinning) {
        fanIcon.classList.add("spin");
    } else {
        fanIcon.classList.remove("spin");
    }
}

// Hàm bật/tắt LED và gửi lệnh qua MQTT

