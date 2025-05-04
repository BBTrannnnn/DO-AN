let selectedMonth = null;
let currentYear = 2024;

function toggleModal() {
    const modal = document.getElementById('monthYearModal');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
}

document.querySelector('.filter-button').addEventListener('click', toggleModal);

function prevYear() {
    currentYear--;
    document.getElementById('modalYear').innerText = currentYear;
}

function nextYear() {
    currentYear++;
    document.getElementById('modalYear').innerText = currentYear;
}

function selectMonth(btn) {
    document.querySelectorAll('.modal-months button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMonth = btn.innerText;
}

function applyMonth() {
    alert(`Đã chọn: ${selectedMonth} ${currentYear}`);
    toggleModal(); // Đóng modal sau khi chọn tháng
}
document.addEventListener("DOMContentLoaded", function () {
const routes = {
    'account': 'admin.html',
    'employee': 'employee.html',
    'payroll': 'payroll.html',
    'attendance': 'attendance.html',
};

// Duyệt qua từng phần tử trong menu và thêm sự kiện click
Object.keys(routes).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.style.cursor = 'pointer'; // Hiện thị dấu tay khi rê chuột
        el.addEventListener('click', () => {
            window.location.href = routes[id]; // Chuyển trang khi click vào menu
        });
    }
});
    
    });
