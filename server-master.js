const { exec } = require('child_process');

// Hàm để khởi động các server Node.js
function startServer(serverScript, port) {
    const process = exec(`node ${serverScript}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi khi chạy Node.js server ${serverScript}:`, error);
            return;
        }
        if (stderr) {
            console.error(`Lỗi từ Node.js server ${serverScript}:`, stderr);
            return;
        }
        console.log(`Node.js server ${serverScript} đang chạy tại http://localhost:${port}`);
    });

    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
        console.error(data.toString());
    });
}

// Hàm để khởi động server Python
function startPythonServer(pythonScript) {
    const process = exec(`python ${pythonScript}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Lỗi khi chạy Python server ${pythonScript}:`, error);
            return;
        }
        if (stderr) {
            console.error(`Lỗi từ Python server ${pythonScript}:`, stderr);
            return;
        }
        console.log(`Python server ${pythonScript} đang chạy!`);
    });

    process.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    process.stderr.on('data', (data) => {
        console.error(data.toString());
    });
}

// Cập nhật đường dẫn đầy đủ đến các tệp server
startServer('C:/Users/Name_user/Desktop/project/script/API/server-table-history.js', 3002); 
startServer('C:/Users/Name_user/Desktop/project/script/API/server-table-data.js', 3001); 
startServer('C:/Users/Name_user/Desktop/project/script/API/server-MYSQL.js', 3000);
// startServer('C:/Users/Name_user/Desktop/project/script/server-led.js', 3003); 
startServer('C:/Users/Name_user/Desktop/project/test/server.js', 3003)
startServer('C:/Users/Name_user/Desktop/project/tabs/server_light', 3004)
// Thêm dòng khởi động server Python
startPythonServer('C:/Users/Name_user/Desktop/project/getdata.py');
