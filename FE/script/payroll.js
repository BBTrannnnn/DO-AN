
document.addEventListener("DOMContentLoaded", function () {
    const addPayrollBtn = document.querySelector(".add-payroll-button");
    const payrollModal = document.getElementById("payrollModal");
    const deletePayrollModal = document.getElementById("deletePayrollModal");
    const notificationModal = document.getElementById("notificationModal");
    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("closeBtn");
    const searchInput = document.getElementById("searchInput");
    const exitBtns = document.querySelectorAll(".exit-btn");
    const confirmBtn = document.querySelector(".confirm-btn");
    const okBtn = document.querySelector(".ok-btn");

    let selectedMonth = null;
    let currentYear = 2024;


    let selectedPayroll = null;
    let allPayrolls = [];

    // Load dữ liệu payroll từ backend Flask
    async function loadPayrolls() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/payrolls/", {
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

        payrolls.forEach((payroll) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${payroll.payroll_id}</td>
                <td>${payroll.employee_id}</td>
                <td>${payroll.employee_name}</td>
                <td>${payroll.department}</td>
                <td>${payroll.job_title}</td>
                <td>${payroll.salary}</td>
                <td>${payroll.time}</td>
                <td>
                    <button class="edit-btn" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                        <img src="assets/img/pencil-write.png" alt="Edit" style="width: 12px; height: 12px; transform: scale(1.8); display: block; margin: 3.5px; vertical-align: middle;">
                    </button>
                    <button class="delete-btn" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                        <img src="assets/img/bin.png" alt="Delete" style="width: 8px; height: 8px; transform: scale(1.8); display: block; margin: 4px; vertical-align: middle;">
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll(".edit-btn").forEach((btn, index) => {
            btn.addEventListener("click", function () {
                const payroll = payrolls[index];
                selectedPayroll = payroll.payroll_id; // Lưu ID của payroll được chọn

                // Chỉ sửa lương và thời gian
                document.getElementById("salaryInput").value = payroll.salary;
                document.getElementById("timeInput").value = payroll.time;

                payrollModal.style.display = "block";
                overlay.style.display = "block";
            });
        });

        document.querySelectorAll(".delete-btn").forEach((btn, index) => {
            btn.addEventListener("click", function () {
                selectedPayroll = payrolls[index].payroll_id; // Lưu ID của payroll được chọn
                deletePayrollModal.style.display = "block";
                overlay.style.display = "block";
            });
        });
    }
    // Tìm kiếm payrolls
    searchInput.addEventListener("input", async (e) => {
        const keyword = searchInput.value.toLowerCase();

        const filtered = allPayrolls.filter(payroll =>
            payroll.employee_id.toLowerCase().includes(keyword) ||
            payroll.employee_name.toLowerCase().includes(keyword)
        );

        renderPayroll(filtered);
    });


    // nút xem history
    showHistoryBtn.addEventListener("click", () => {
        loadHistory();
        historyModal.style.display = "block";
        historyOverlay.style.display = "block";
    });

    historyCloseBtn.addEventListener("click", closeHistoryModal);
    historyOverlay.addEventListener("click", closeHistoryModal);

    function closeHistoryModal() {
        historyModal.style.display = "none";
        historyOverlay.style.display = "none";
    }

    // async function loadHistory() {
    //     try {
    //         const res = await fetch("http://localhost:5000/api/get_history");
    //         const data = await res.json();
    //         const tbody = document.querySelector("#historyTable tbody");
    //         tbody.innerHTML = "";

    //         data.forEach((item, index) => {
    //             const tr = document.createElement("tr");
    //             const formattedTime = new Date(item.timestamp).toLocaleString("vi-VN", {
    //                 timeZone: "Asia/Ho_Chi_Minh",
    //                 year: "numeric",
    //                 month: "2-digit",
    //                 day: "2-digit",
    //                 hour: "2-digit",
    //                 minute: "2-digit",
    //                 second: "2-digit"
    //             });
    //             tr.innerHTML = `
    //                 <td>${index + 1}</td>
    //                 <td>${item.username}</td>
    //                 <td>${item.action}</td>
    //                 <td>${item.target_user || "-"}</td>
    //                 <td>${formattedTime}</td>
    //             `;
    //             tbody.appendChild(tr);
    //         });
    //     } catch (err) {
    //         console.error("Lỗi tải lịch sử:", err);
    //     }
    // }


    async function updatePayroll() {
        const salary = document.getElementById("salaryInput").value;
        const time = document.getElementById("timeInput").value; // format: "mm/yyyy"

        const res = await fetch("http://127.0.0.1:5000/api/payrolls/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                payroll_id: selectedPayroll,
                salary: salary,
                time: time
            })
        });

        const data = await res.json();

        if (res.ok) {
            showNotification("Cập nhật lương thành công.");
            loadPayrolls(); // Cập nhật lại bảng
        } else {
            showNotification("Cập nhật lương thất bại!!!!");
        }
    }

    async function deletePayroll() {
        deletePayrollModal.style.display = "none";
        const res = await fetch("http://127.0.0.1:5000/api/payrolls/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payroll_id: selectedPayroll })
        });

        if (res.ok) {
            showNotification("Xóa tài lương thành công.");
            loadPayrolls();
        } else {
            showNotification("Xóa tài lương thất bại.");
        }
    }

    confirmBtn.addEventListener("click", deletePayroll);

    addPayrollBtn.addEventListener("click", function () {
        payrollModal.style.display = "block";
        overlay.style.display = "block";
    });

    closeBtn.addEventListener("click", function () {
        payrollModal.style.display = "none";
        overlay.style.display = "none";
    });

    okBtn.addEventListener("click", function () {

        if (selectedPayroll) {
            updatePayroll(); // Cập nhật tài khoản
        } else {
            // Thêm tài khoản mới
        }
    });


    exitBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            if (this.closest('#notificationModal')) {
                notificationModal.style.display = "none";
            }
            if (this.closest('#deletePayrollModal')) {
                deletePayrollModal.style.display = "none";
            }
            overlay.style.display = "none";
        });
    });

    overlay.addEventListener("click", function () {
        payrollModal.style.display = "none";
        deletePayrollModal.style.display = "none";
        notificationModal.style.display = "none";
        overlay.style.display = "none";
    });

    function showNotification(message) {
        notificationModal.querySelector("p").textContent = message;
        notificationModal.style.display = "block";
        overlay.style.display = "block";
        payrollModal.style.display = "none";
    }
    function toggleModal() {
        const modal = document.getElementById('monthYearModal');
        modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
    }

    document.querySelector('.filter-item').addEventListener('click', toggleModal);

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

    // Gọi hàm khi load trang
    loadPayrolls();


});
