
document.addEventListener("DOMContentLoaded", function () {

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


    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("closeBtn");
    const confirmBtn = document.querySelector(".confirm-btn");
    const editSalaryInput = document.getElementById("salaryInput");
    const editTimeInput = document.getElementById("timeInput");

    let selectedPayrollId = null;
    let allPayrolls = [];

    // Load dữ liệu payroll từ backend Flask
    async function loadPayrolls() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/payrolls", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            const payrolls = await res.json();
            allPayrolls = payrolls;
            renderPayroll(payrolls);
        } catch (error) {
            console.error("Lỗi tải dữ liệu payroll:", error);
        }
    }

    // Hiển thị bảng Payroll
    async function renderPayroll(payrolls) {
        const tableBody = document.querySelector(".payroll-table tbody");
        tableBody.innerHTML = "";

        payrolls.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${item.payroll_id}</td>
                <td>${item.employee_id}</td>
                <td>${item.employee_name}</td>
                <td>${item.department}</td>
                <td>${item.job_title}</td>
                <td>${item.salary}</td>
                <td>${item.time}</td>
            `;
            tableBody.appendChild(tr);
        });

    }

    // Gọi hàm khi load trang
    loadPayrolls();


});
