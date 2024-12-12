import os
import subprocess
import time
import mysql.connector
import shutil

def create_mysql_instance(port, data_dir, username, password):
    try:
        # Tạo thư mục dữ liệu nếu chưa tồn tại
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        print(f"Data directory created at: {data_dir}")
        
        # Đường dẫn đầy đủ đến mysqld.exe
        mysqld_path = r"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"

        # Khởi tạo MySQL instance mới với cổng và thư mục dữ liệu đã chỉ định
        cmd = f'"{mysqld_path}" --initialize-insecure --user=mysql --datadir={data_dir} --port={port}'
        result = subprocess.run(cmd, check=False, shell=True, capture_output=True, text=True)
        
        # In ra lỗi chi tiết nếu có
        if result.returncode != 0:
            print(f"Error initializing MySQL instance: {result.stderr}")
            return False
        
        print(f"MySQL instance initialized successfully.")
        
        # Khởi động MySQL instance trên cổng chỉ định
        cmd = f'"{mysqld_path}" --datadir={data_dir} --port={port} --socket={data_dir}/mysql.sock'
        result = subprocess.run(cmd, check=False, shell=True, capture_output=True, text=True)
        
        # In ra lỗi chi tiết nếu có
        if result.returncode != 0:
            print(f"Error starting MySQL instance: {result.stderr}")
            return False
        
        print(f"MySQL instance started on port {port}.")
        
        # Chờ cho MySQL instance khởi động hoàn toàn
        time.sleep(10)

        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        return False

def setup_user_and_database(username, password, port):
    try:
        # Kết nối tới MySQL instance mới trên cổng `port` bằng tài khoản root (hoặc một tài khoản có quyền đủ để tạo user)
        db = mysql.connector.connect(
            user='root',  # Tài khoản root mặc định
            password='',  # Mật khẩu trống khi khởi tạo MySQL instance
            host='127.0.0.1',
            port=port  # Cổng MySQL (3306 hoặc cổng khác)
        )
        cursor = db.cursor()

        # Tạo user mới và cấp quyền
        cursor.execute(f"CREATE USER IF NOT EXISTS '{username}'@'localhost' IDENTIFIED BY '{password}';")
        cursor.execute(f"GRANT ALL PRIVILEGES ON *.* TO '{username}'@'localhost' WITH GRANT OPTION;")
        cursor.execute("FLUSH PRIVILEGES;")
        print(f"User '{username}' setup successfully.")

        # Tạo database 'test' và các bảng
        cursor.execute("CREATE DATABASE IF NOT EXISTS test;")
        cursor.execute("USE test;")

        # Tạo bảng `device`
        cursor.execute(""" 
        CREATE TABLE IF NOT EXISTS device (
            id INT AUTO_INCREMENT PRIMARY KEY,
            device CHAR(25),
            action CHAR(25),
            Thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
        );
        """)
        print("Table 'device' created successfully.")

        # Tạo bảng `datasensor`
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

def create_workbench_connection(username, password, port):
    # Đường dẫn tới file cấu hình MySQL Workbench
    config_path = os.path.expanduser(r'~\AppData\Roaming\MySQL\Workbench\connections.xml')

    # Kiểm tra nếu file cấu hình đã tồn tại
    if not os.path.exists(config_path):
        print(f"Error: MySQL Workbench connections file not found at {config_path}")
        print("Please ensure MySQL Workbench is installed and run it at least once.")
        return

    # Nội dung kết nối mới
    new_connection = f"""
    <value type="object" struct-checksum="1" key="new_connection">
        <value type="string" key="id">python-setup-{port}</value>
        <value type="string" key="name">Python Setup {port}</value>
        <value type="string" key="driver">MySQL (TCP/IP)</value>
        <value type="string" key="host">127.0.0.1</value>
        <value type="int" key="port">{port}</value>
        <value type="string" key="user">{username}</value>
        <value type="string" key="password">{password}</value>
    </value>
    """

    # Đọc nội dung file cấu hình
    with open(config_path, 'r') as file:
        content = file.read()

    # Kiểm tra nếu kết nối đã tồn tại
    if f"Python Setup {port}" in content:
        print(f"Connection 'Python Setup {port}' already exists in MySQL Workbench.")
        return

    # Chèn nội dung kết nối mới
    updated_content = content.replace(
        '</data>',
        f"{new_connection}\n</data>"
    )

    # Ghi lại file cấu hình
    with open(config_path, 'w') as file:
        file.write(updated_content)

    print(f"Connection 'Python Setup {port}' added to MySQL Workbench.")

if __name__ == "__main__":
    # Yêu cầu người dùng nhập tên tài khoản và mật khẩu
    username = input("Enter the username for the new MySQL account: ")
    password = input("Enter the password for the new MySQL account: ")

    # Cổng mới (3306 hoặc cổng khác nếu muốn tránh xung đột)
    port = 3306  # Bạn có thể thay đổi cổng nếu muốn tránh xung đột
    data_dir = os.path.join(os.getcwd(), "mysql3306_data")

    # Bước 1: Tạo MySQL instance mới trên cổng 3306
    if create_mysql_instance(port, data_dir, username, password):
        # Bước 2: Thiết lập user và database
        setup_user_and_database(username, password, port)
        # Bước 3: Thêm kết nối vào MySQL Workbench
        create_workbench_connection(username, password, port)
