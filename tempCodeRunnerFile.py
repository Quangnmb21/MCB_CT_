import os
import subprocess
import time
import mysql.connector

def create_mysql_instance():
    try:
        # Đường dẫn đến thư mục MySQL bin
        mysql_bin_path = r"C:\Program Files\MySQL\MySQL Server 8.0\bin"
        data_dir = os.path.join(os.getcwd(), "mysql80_data")
        
        # Tạo thư mục dữ liệu cho instance mới nếu chưa tồn tại
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            print(f"Data directory created at: {data_dir}")
        
        # Khởi tạo thư mục dữ liệu cho instance mới
        subprocess.run([
            os.path.join(mysql_bin_path, "mysqld"),
            f"--datadir={data_dir}",
            "--initialize-insecure"
        ], check=True)
        print("MySQL instance initialized successfully.")
        
        # Khởi động instance mới trên cổng 3307
        subprocess.Popen([
            os.path.join(mysql_bin_path, "mysqld"),
            f"--datadir={data_dir}",
            "--port=3307",
            "--console"
        ])
        print("MySQL instance started on port 3307.")
        
        # Đợi một chút để instance khởi động
        time.sleep(10)
        
    except subprocess.CalledProcessError as e:
        print(f"Error during instance creation: {e}")

def setup_user_and_database():
    try:
        # Kết nối tới instance mới trên cổng 3307
        db = mysql.connector.connect(
            user='root1',
            password='',  # Không cần mật khẩu khi dùng `--initialize-insecure`
            host='127.0.0.1',
            port=3307  # Instance mới chạy trên cổng 3307
        )
        cursor = db.cursor()
        
        # Tạo user 'test' và cấp quyền
        cursor.execute("CREATE USER IF NOT EXISTS 'test'@'localhost' IDENTIFIED BY 'Quang';")
        cursor.execute("GRANT ALL PRIVILEGES ON *.* TO 'test'@'localhost' WITH GRANT OPTION;")
        cursor.execute("FLUSH PRIVILEGES;")
        print("User 'test' setup successfully.")
        
        # Tạo database 'test' và các bảng
        cursor.execute("CREATE DATABASE IF NOT EXISTS test;")
        cursor.execute("USE test;")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS device (
            id INT AUTO_INCREMENT PRIMARY KEY,
            device CHAR(25),
            action CHAR(25),
            Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
        );
        """)
        print("Table 'device' created successfully.")
        
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS datasensor (
            id INT AUTO_INCREMENT PRIMARY KEY,
            temp FLOAT,
            humi FLOAT,
            light INT,
            sensor INT,
            Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
        );
        """)
        print("Table 'datasensor' created successfully.")
        
        cursor.close()
        db.close()
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")

if __name__ == "__main__":
    # Bước 1: Tạo instance MySQL mới
    create_mysql_instance()
    
    # Bước 2: Thiết lập user và database
    setup_user_and_database()
