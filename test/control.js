// Biến lưu trữ IP của server, mặc định là localhost
let serverIP = '127.0.0.1'; // Dùng tạm localhost khi chưa lấy được IP từ server

// Hàm lấy địa chỉ IP động từ server Express và tự động cập nhật
function getServerIP() {
    fetch('http://127.0.0.1:3003/get-ip') // Gọi API để lấy IP của server
        .then(response => response.json())
        .then(data => {
            serverIP = data.ip; // Cập nhật biến serverIP từ dữ liệu nhận được
            console.log(`Server IP updated: ${serverIP}`);
        })
        .catch(error => {
            console.error('Error fetching server IP:', error);
        });
}

// Hàm kiểm tra giá trị temp từ MySQL và tự động cập nhật LED/icon
function updateLedBasedOnTemp() {
    fetch(`http://${serverIP}:3003/temp`) // Gọi API để lấy nhiệt độ
        .then(response => response.json())
        .then(data => {
            const temp = data.temp; // Lấy giá trị nhiệt độ từ JSON
            console.log(`Current temperature: ${temp}`);

            // Nếu temp >= 28: bật LED và icon, ngược lại tắt
            const deviceStatus = temp >= 28 ? '1' : '0';

            // Cập nhật trạng thái LED1 và icon
            updateIconStatus('led1', deviceStatus);
        })
        .catch(error => {
            console.error('Error fetching temperature:', error);
        });
}

// Hàm cập nhật trạng thái icon theo trạng thái LED
function updateIconStatus(deviceId, status) {
    const iconElement = document.getElementById(`${deviceId}-icon`);
    const statusElement = document.getElementById(`${deviceId}-text`);
    
    if (iconElement && statusElement) {
        // Cập nhật trạng thái text
        statusElement.textContent = status === '1' ? 'Open' : 'Closed';

        // Cập nhật class của icon
        iconElement.classList.toggle('on', status === '1');
        iconElement.classList.toggle('off', status !== '1');
    }
}

// Hàm gửi HTTP request để điều khiển LED khi người dùng bấm icon
function toggleLed(deviceId) {
    let deviceStatus = '';
    let iconElement = null;
    let statusElement = null;

    if (deviceId === 'led1') {
        iconElement = document.getElementById('lightbulb-icon');
        statusElement = document.getElementById('lightbulb-text');

        // Nếu trạng thái là 'Closed', bật LED (gửi '1'), nếu là 'Open' tắt LED (gửi '0')
        deviceStatus = statusElement.textContent === 'Closed' ? '1' : '0';
        statusElement.textContent = deviceStatus === '1' ? 'Open' : 'Closed';
        iconElement.classList.toggle('on', deviceStatus === '1');
        iconElement.classList.toggle('off', deviceStatus !== '1');

        // Gửi HTTP request đến server để điều khiển LED1
        fetch(`http://${serverIP}:3003/led/1/${deviceStatus}`)
            .then(response => response.text())
            .then(data => console.log(`LED1 updated: ${data}`))
            .catch(error => console.error('Error updating LED1:', error));
    } else if (deviceId === 'led2') {
        iconElement = document.getElementById('fan-icon');
        statusElement = document.getElementById('fan-text');

        // Nếu trạng thái là 'Closed', bật LED2 (gửi '1'), nếu là 'Open' tắt LED2 (gửi '0')
        deviceStatus = statusElement.textContent === 'Closed' ? '1' : '0';
        statusElement.textContent = deviceStatus === '1' ? 'Open' : 'Closed';
        iconElement.classList.toggle('on', deviceStatus === '1');
        iconElement.classList.toggle('off', deviceStatus !== '1');
        iconElement.classList.toggle('rotate', deviceStatus === '1');

        // Gửi HTTP request đến server để điều khiển LED2
        fetch(`http://${serverIP}:3003/led/2/${deviceStatus}`)
            .then(response => response.text())
            .then(data => console.log(`LED2 updated: ${data}`))
            .catch(error => console.error('Error updating LED2:', error));
    }
}

// Gán sự kiện click cho các icon khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    // Gán sự kiện cho đèn
    document.getElementById('lightbulb-icon').addEventListener('click', () => toggleLed('led1'));
    // Gán sự kiện cho quạt
    document.getElementById('fan-icon').addEventListener('click', () => toggleLed('led2'));

    // Lấy IP ban đầu khi tải trang
    getServerIP();
});

// Tự động kiểm tra giá trị temp và cập nhật trạng thái mỗi 10 giây
setInterval(updateLedBasedOnTemp, 10000);

// Cập nhật IP của server mỗi phút
setInterval(getServerIP, 1000);
