document.addEventListener("DOMContentLoaded", function () {
    const routes = {
        'account': 'admin.html',
        'employee': 'employee.html',
        'payroll': 'payroll.html',
        'attendance': 'attendance.html',
        'department': 'department_jobtitle.html',
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

// Elements
const showBtn = document.querySelector('.add-attendance');
const attendanceModal = document.getElementById('attendanceModal');
const notificationModal = document.getElementById('notificationModal');
const overlay = document.getElementById('overlay');

const closeBtn = document.querySelector('.close-btn');
const okBtn = document.querySelector('.ok-btn');
const exitBtn = document.querySelector('.exit-btn');

// Functions
function showModal(modal) {
    modal.style.display = 'flex';
    overlay.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
    overlay.style.display = 'none';
}

// Event Listeners
showBtn.addEventListener('click', () => showModal(attendanceModal));

closeBtn.addEventListener('click', () => closeModal(attendanceModal));
overlay.addEventListener('click', () => {
    closeModal(attendanceModal);
    closeModal(notificationModal);
});

okBtn.addEventListener('click', () => {
    closeModal(attendanceModal);
    showModal(notificationModal);
});

exitBtn.addEventListener('click', () => closeModal(notificationModal));
