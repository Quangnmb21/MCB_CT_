const rowsPerPageHistory = 5;
let currentPageHistory = 1;
let tableHistoryData = []; // Đổi tên biến để tránh xung đột với dữ liệu khác
let filteredHistoryData = []; // Khai báo filteredData cho dữ liệu lịch sử

// Hàm hiển thị dữ liệu bảng lịch sử
function displayHistoryData(data) {
    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody) {
        console.error("Không tìm thấy phần tử historyTableBody.");
        return; // Dừng lại nếu không tìm thấy phần tử bảng
    }
    tableBody.innerHTML = ""; // Xóa dữ liệu cũ trong bảng

    data.forEach(row => {
        // Chuyển đổi thời gian Thoi_gian về định dạng chuẩn (nếu cần)
        let thoiGianFormatted = new Date(row.Thoi_gian);
        thoiGianFormatted = thoiGianFormatted.toISOString().slice(0, 19).replace('T', ' '); // Chuyển đổi thành dạng 'YYYY-MM-DD HH:mm:ss'

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.device}</td>
            <td>${row.action}</td>
            <td>${thoiGianFormatted}</td> <!-- Hiển thị thời gian đã định dạng -->
        `;
        tableBody.appendChild(tr);
    });
}

// Hàm phân trang lịch sử
function updateHistoryPagination(data) {
    const prevButton = document.getElementById("historyPrevPage");
    const nextButton = document.getElementById("historyNextPage");
    const totalPages = Math.ceil(data.length / rowsPerPageHistory);
    document.getElementById("historyTotalPages").textContent = ` / ${totalPages}`;
    document.getElementById("historyPageInput").value = currentPageHistory; 

    prevButton.disabled = currentPageHistory === 1;
    nextButton.disabled = currentPageHistory === totalPages;
}

// Hàm thay đổi trang lịch sử
function changeHistoryPage(direction) {
    currentPageHistory += direction;
    const dataToDisplay = filteredHistoryData.length > 0 ? filteredHistoryData : tableHistoryData;
    displayHistoryData(dataToDisplay.slice((currentPageHistory - 1) * rowsPerPageHistory, currentPageHistory * rowsPerPageHistory));
    updateHistoryPagination(dataToDisplay);
}

// Hàm tìm kiếm lịch sử
// Hàm tìm kiếm lịch sử
function filterHistoryTable() {
    const searchInput = document.getElementById("historySearchInput").value.toLowerCase();

    // Tìm kiếm dựa trên các cột id, device, action và Thoi_gian
    filteredHistoryData = tableHistoryData.filter(row => {
        const thoiGianFormatted = new Date(row.Thoi_gian).toISOString().slice(0, 19).replace('T', ' '); // Chuyển thời gian thành dạng 'YYYY-MM-DD HH:mm:ss'

        return (
            row.id.toString().includes(searchInput) ||
            row.device.toLowerCase().includes(searchInput) ||
            row.action.toLowerCase().includes(searchInput) ||
            thoiGianFormatted.toLowerCase().includes(searchInput) // Tìm kiếm trên cột thời gian đã định dạng
        );
    });

    currentPageHistory = 1;
    displayHistoryData(filteredHistoryData.slice(0, rowsPerPageHistory));
    updateHistoryPagination(filteredHistoryData);
}


// Hàm đi đến trang lịch sử cụ thể
function goToHistoryPage() {
    const pageInput = document.getElementById("historyPageInput").value;
    const dataToUse = filteredHistoryData.length > 0 ? filteredHistoryData : tableHistoryData;
    const totalPages = Math.ceil(dataToUse.length / rowsPerPageHistory);

    if (pageInput >= 1 && pageInput <= totalPages) {
        currentPageHistory = parseInt(pageInput);
        displayHistoryData(dataToUse.slice((currentPageHistory - 1) * rowsPerPageHistory, currentPageHistory * rowsPerPageHistory));
        updateHistoryPagination(dataToUse);
    }
}

// Hàm lấy dữ liệu lịch sử từ API
async function fetchHistoryData() {
    try {
        const response = await fetch('http://localhost:3002/api/history/details');
        const data = await response.json();
        console.log(data); // Log dữ liệu để kiểm tra

        tableHistoryData = data; // Gán lại tableHistoryData
        filteredHistoryData = []; // Đặt lại dữ liệu đã lọc
        displayHistoryData(tableHistoryData.slice(0, rowsPerPageHistory));
        updateHistoryPagination(tableHistoryData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu lịch sử:', error);
    }
}

// Khởi tạo dữ liệu lịch sử ban đầu
document.addEventListener("DOMContentLoaded", () => {
    fetchHistoryData();
});
