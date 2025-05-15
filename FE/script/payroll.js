
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




    let selectedPayroll = null;
    let allPayrolls = [];

    // Load dữ liệu payroll từ backend Flask
    async function loadPayrolls() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/payrolls/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"

                },
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

                document.getElementById("employeeIdInput").value = payroll.employee_id;
                document.getElementById("employeeIdInput").disabled = true; // Khóa ô input

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

    // Lấy token từ localStorage


    async function addPayroll() {
        const employee_id = document.getElementById("employeeIdInput").value.trim();
        const salary = parseFloat(document.getElementById("salaryInput").value);
        const time = document.getElementById("timeInput").value.trim(); // dạng yyyy-mm-dd

        console.log("Time value:", time);
        const timeRegex = /^\d{4}-\d{2}-\d{2}$/; // Định dạng yyyy-mm-dd
        if (!time || !timeRegex.test(time)) {
            showNotification("Vui lòng nhập thời gian hợp lệ (yyyy-mm-dd).");
            return; // Dừng lại nếu thời gian không hợp lệ
        }
        const token = localStorage.getItem("token");  // Lấy token từ localStorage

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
            return;
        }
        const decodedToken = jwt_decode(token);
        const userRole = decodedToken.role;
        const allowedRoles = ["admin", "payroll management"];

        // Chuẩn hóa role thành mảng, không phân biệt hoa thường
        let rolesInToken = [];
        if (Array.isArray(userRole)) {
            rolesInToken = userRole.map(r => r.toLowerCase());
        } else if (typeof userRole === "string") {
            rolesInToken = [userRole.toLowerCase()];
        } else {
            rolesInToken = [];
        }

        const hasRole = rolesInToken.some(r => allowedRoles.includes(r));
        if (!hasRole) {
            showNotification("Bạn không có quyền sử dụng chức năng này!");
            return;
        }
        if (!employee_id) {
            showNotification("Vui lòng nhập mã nhân viên.");
            return;
        }

        if (isNaN(salary) || salary <= 0) {
            showNotification("Số tiền lương phải là một số hợp lệ và lớn hơn 0.");
            return;
        }

        if (!time) {
            showNotification("Vui lòng nhập thời gian.");
            return;
        }

        console.log("Time Selected: ", time);

        const res = await fetch("http://127.0.0.1:5000/api/payrolls/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            body: JSON.stringify({ employee_id, salary, time })
        });

        if (res.ok) {
            showNotification("Thêm lương thành công.");
            loadPayrolls();
        } else {
            showNotification("Thêm lương không thành công!!!!! ");
        }
    }





    async function updatePayroll() {
        const salary = document.getElementById("salaryInput").value;
        const time = document.getElementById("timeInput").value;
        const token = localStorage.getItem("token");  // Lấy token từ localStorage
        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
            return;
        }
        const decodedToken = jwt_decode(token);  // Giải mã token để lấy thông tin user
        const userRole = decodedToken.role;  // Giả sử role được lưu trong token

        const allowedRoles = ["admin", "payroll management"];

        // Chuẩn hóa role trong token thành mảng, không phân biệt hoa thường
        let rolesInToken = [];
        if (Array.isArray(userRole)) {
            rolesInToken = userRole.map(r => r.toLowerCase());
        } else if (typeof userRole === "string") {
            rolesInToken = [userRole.toLowerCase()];
        } else {
            rolesInToken = [];
        }

        const hasRole = rolesInToken.some(r => allowedRoles.includes(r));

        if (!hasRole) {
            showNotification("Bạn không có quyền sử dụng chức năng này!");
            return;
        }

        const res = await fetch("http://127.0.0.1:5000/api/payrolls/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            body: JSON.stringify({
                payroll_id: selectedPayroll,
                salary: salary,
                time: time
            })
        });

        if (res.ok) {
            showNotification("Cập nhật lương thành công.");
            loadPayrolls(); // Cập nhật lại bảng
        } else {
            showNotification("Cập nhật lương thất bại!!!!");
        }
    }

    async function deletePayroll() {
        deletePayrollModal.style.display = "none";
        const token = localStorage.getItem("token");  // Lấy token từ localStorage
        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
            return;
        }
        const decodedToken = jwt_decode(token);  // Giải mã token để lấy thông tin user
        const userRole = decodedToken.role;  // Giả sử role được lưu trong token
        const allowedRoles = ["admin", "payroll management"];

        // Chuẩn hóa role trong token thành mảng, không phân biệt hoa thường
        let rolesInToken = [];
        if (Array.isArray(userRole)) {
            rolesInToken = userRole.map(r => r.toLowerCase());
        } else if (typeof userRole === "string") {
            rolesInToken = [userRole.toLowerCase()];
        } else {
            rolesInToken = [];
        }

        const hasRole = rolesInToken.some(r => allowedRoles.includes(r));

        if (!hasRole) {
            showNotification("Bạn không có quyền sử dụng chức năng này!");
            return;
        }

        const res = await fetch("http://127.0.0.1:5000/api/payrolls/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            body: JSON.stringify({ payroll_id: selectedPayroll })
        });

        if (res.ok) {
            showNotification("Xóa lương thành công.");
            selectedPayroll = null; // Reset selectedPayroll
            await loadPayrolls();
        } else {
            showNotification("Xóa lương thất bại.");
        }
        deletePayrollModal.style.display = "none";
        overlay.style.display = "none";
    }

    confirmBtn.addEventListener("click", deletePayroll);

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

    addPayrollBtn.addEventListener("click", function () {
        selectedPayroll = null;
        document.getElementById("employeeIdInput").value = "";
        document.getElementById("salaryInput").value = "";
        document.getElementById("timeInput").value = "";
        document.getElementById("employeeIdInput").disabled = false;
        payrollModal.style.display = "block";
        overlay.style.display = "block";
    });

    closeBtn.addEventListener("click", function () {
        payrollModal.style.display = "none";
        overlay.style.display = "none";
    });

    okBtn.addEventListener("click", function () {
        if (selectedPayroll) {
            updatePayroll();
        } else {
            addPayroll();
        }
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
