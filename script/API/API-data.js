const rowsPerPage = 5;
let currentPage = 1;
let tableSensorData = []; // Đổi tên biến để tránh xung đột
let filteredData = []; // Khai báo filteredData một lần

// Hàm hiển thị dữ liệu bảng
function displayData(data) {
    const tableBody = document.getElementById("sensorTableBody");
    if (!tableBody) {
        console.error("Không tìm thấy phần tử sensorTableBody.");
        return; // Dừng lại nếu không tìm thấy phần tử bảng
    }
    tableBody.innerHTML = "";
    data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.temp}</td>
            <td>${row.humi}</td>
            <td>${row.light}</td>
            <td>${row.Thoi_gian}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// Hàm phân trang
function updatePagination(data) {
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    const totalPages = Math.ceil(data.length / rowsPerPage);
    document.getElementById("totalPages").textContent = ` / ${totalPages}`;
    document.getElementById("pageInput").value = currentPage; 

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Hàm thay đổi trang
function changePage(direction) {
    currentPage += direction;
    const dataToDisplay = filteredData.length > 0 ? filteredData : tableSensorData; 
    displayData(dataToDisplay.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage));
    updatePagination(dataToDisplay);
}

// Hàm tìm kiếm
function filterTable() {
    const searchInput = document.getElementById("searchInput").value.toLowerCase();
    filteredData = tableSensorData.filter(row =>
        row.id.toString().includes(searchInput) ||
        row.temp.toString().includes(searchInput) ||
        row.humi.toString().includes(searchInput) ||
        row.light.toString().includes(searchInput) ||
        row.Thoi_gian.toLowerCase().includes(searchInput)
    );
    
    currentPage = 1;
    displayData(filteredData.slice(0, rowsPerPage));
    updatePagination(filteredData);
}

// Hàm đi đến trang cụ thể
function goToPage() {
    const pageInput = document.getElementById("pageInput").value;
    const dataToUse = filteredData.length > 0 ? filteredData : tableSensorData;
    const totalPages = Math.ceil(dataToUse.length / rowsPerPage);

    if (pageInput >= 1 && pageInput <= totalPages) {
        currentPage = parseInt(pageInput);
        displayData(dataToUse.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage));
        updatePagination(dataToUse);
    }
}

async function fetchTableData() {
    try {
        const response = await fetch('http://localhost:3001/api/datasensor/details');
        const data = await response.json();
        tableSensorData = data; // Gán lại tableSensorData
        filteredData = []; // Đặt lại dữ liệu đã lọc
        displayData(tableSensorData.slice(0, rowsPerPage));
        updatePagination(tableSensorData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
    }
}

// Khởi tạo dữ liệu ban đầu
document.addEventListener("DOMContentLoaded", () => {
    fetchTableData();
});
