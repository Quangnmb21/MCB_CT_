// Hàm kiểm tra giá trị temp từ MySQL và tự động cập nhật LED/icon
function updateLedBasedOnTemp() {
    fetch('http://192.168.1.4:3003/temp') // Lấy nhiệt độ từ server
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

// Hàm cập nhật trạng thái icon và LED mà không ảnh hưởng đến logic điều khiển
function updateIconStatus(deviceId, status) {
    let iconElement = null;
    let statusElement = null;

    if (deviceId === 'led1') {
        iconElement = document.getElementById('lightbulb-icon');
        statusElement = document.getElementById('lightbulb-text');
        // Đồng bộ trạng thái LED và icon: nếu bật LED thì icon cũng bật
        statusElement.textContent = status === '1' ? 'Open' : 'Closed';
        iconElement.classList.toggle('on', status === '1');
        iconElement.classList.toggle('off', status !== '1');
    } else if (deviceId === 'led2') {
        iconElement = document.getElementById('fan-icon');
        statusElement = document.getElementById('fan-text');
        // Đồng bộ trạng thái LED2 và icon fan
        statusElement.textContent = status === '1' ? 'Open' : 'Closed';
        iconElement.classList.toggle('on', status === '1');
        iconElement.classList.toggle('off', status !== '1');
        iconElement.classList.toggle('rotate', status === '1');
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
        fetch(`http://192.168.1.4:3003/led/1/${deviceStatus}`)
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
        fetch(`http://192.168.1.4:3003/led/2/${deviceStatus}`)
            .then(response => response.text())
            .then(data => console.log(`LED2 updated: ${data}`))
            .catch(error => console.error('Error updating LED2:', error));
    }
}

// Tự động kiểm tra giá trị temp và cập nhật trạng thái mỗi 10 giây
setInterval(updateLedBasedOnTemp, 10000);

// Hàm publish status qua MQTT vẫn giữ nguyên
function publishStatus(topic, message) {
    const mqttClient = mqtt.connect('ws://192.168.1.4');  // Cập nhật đúng broker URL nếu cần
    mqttClient.on('connect', function () {
        mqttClient.publish(topic, message, (err) => {
            if (err) {
                console.error('Failed to publish message:', err);
            } else {
                console.log(`Message published to ${topic}: ${message}`);
            }
        });
    });

    mqttClient.on('error', (err) => {
        console.error('MQTT connection error:', err);
    });
}
