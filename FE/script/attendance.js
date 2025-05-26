document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors for DOM elements ---
    const addAttendanceBtn = document.querySelector('.add-attendance');
    const attendanceModal = document.getElementById('attendanceModal');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.querySelector('.close-btn');
    const saveBtn = document.querySelector('.ok-btn'); // Nút OK trong modal
    const attendanceTableBody = document.querySelector('.account-table tbody'); // Bảng hiển thị điểm danh
    const notificationModal = document.getElementById('notificationModal');
    const notificationMessage = notificationModal.querySelector('p');
    const searchInput = document.getElementById('searchInput');
    
    // --- Data variables ---
    let allAttendanceRecords = [];
    let selectedAttendanceId = null; // Lưu ID điểm danh đang được chỉnh sửa hoặc xóa

    // --- Functions to interact with the backend ---

    async function loadAttendance() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/attendances/");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const attendanceData = await res.json();
            allAttendanceRecords = attendanceData;
            renderAttendanceTable(attendanceData);
            updateIds();
        } catch (error) {
            console.error("Failed to load attendance:", error);
            showNotification("Lỗi khi load attendance!");
        }
    }

    async function checkExistingAttendance(employeeId, month) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/attendances/check?employee_id=${employeeId}&month=${month}`);
            const data = await res.json();
            return data.exists; // Trả về true nếu đã tồn tại, false nếu không
        } catch (error) {
            console.error("Error checking existing attendance:", error);
            return true; // Trả về true để tránh thêm/sửa trùng lặp nếu có lỗi xảy ra
        }
    }

    function getDaysInMonth(dateStr) {
        const [year, month] = dateStr.split("-").map(Number);
        return new Date(year, month, 0).getDate(); // ngày 0 của tháng kế là ngày cuối tháng hiện tại
    }

    function isAttendanceValid(working, absence, leave, dateStr) {
        const total = working + absence + leave;
        const daysInMonth = getDaysInMonth(dateStr);
        return total <= daysInMonth;
    }
    function getMonthYear(dateStr) {
        const [year, month] = dateStr.split("-");
        return `${year}-${month}`;
    }

    async function addAttendance() {
    const idInput = document.getElementById("idInput");
    const workingDaysInput = attendanceModal.querySelector('input[placeholder="Working days"]');
    const absenceInput = attendanceModal.querySelector('input[placeholder="Absences"]');
    const leaveInput = attendanceModal.querySelector('input[placeholder="Leave days"]');
    const timeInput = attendanceModal.querySelector('input[type="date"]');
    const timeValue = timeInput.value;
    const formattedTime = timeValue ? timeValue : '';

    const working = parseInt(workingDaysInput.value) || 0;
    const absence = parseInt(absenceInput.value) || 0;
    const leave = parseInt(leaveInput.value) || 0;

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


    if (!formattedTime) {
        showNotification("Vui lòng chọn ngày tháng!");
        return;
    }

    if (!isAttendanceValid(working, absence, leave, formattedTime)) {
        showNotification("Tổng số ngày đi làm và nghỉ vượt quá số ngày trong tháng!");
        return;
    }

    // 1. Gọi API lấy toàn bộ bản ghi hoặc theo employee_id
    try {
        const res = await fetch("http://127.0.0.1:5000/api/attendances/");
        const allAttendances = await res.json();

        const selectedMonth = getMonthYear(formattedTime);
        const employeeId = idInput.value.trim();

        const exists = allAttendances.some(item => {
            return item.employee_id === employeeId &&
                getMonthYear(item.time) === selectedMonth;
        });

        if (exists) {
            showNotification("Đã tồn tại bản ghi tháng này của nhân viên!");
            return;
        }

        // 2. Nếu không tồn tại, gửi request thêm mới
        const newAttendance = {
            employee_id: employeeId,
            working_days: working,
            absence: absence,
            leave: leave,
            time: formattedTime
        };

        const resAdd = await fetch("http://127.0.0.1:5000/api/attendances/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            body: JSON.stringify(newAttendance)
        });

        const data = await resAdd.json();
        if (resAdd.ok) {
            loadAttendance();
            hideModal();
            showNotification("Thêm chấm công thành công.");
        } else {
            showNotification(data.message || "Thêm chấm công thất bại!");
        }

    } catch (error) {
        console.error("Error:", error);
        showNotification("Lỗi khi kiểm tra hoặc thêm attendance!");
    }
}

    async function updateAttendance() {
    const workingDaysInput = attendanceModal.querySelector('input[placeholder="Working days"]');
    const absenceInput = attendanceModal.querySelector('input[placeholder="Absences"]');
    const leaveInput = attendanceModal.querySelector('input[placeholder="Leave days"]');
    const timeInput = attendanceModal.querySelector('input[type="date"]');

    const timeValue = timeInput.value;
    const formattedTime = timeValue ? timeValue : '';

    const working = parseInt(workingDaysInput.value) || 0;
    const absence = parseInt(absenceInput.value) || 0;
    const leave = parseInt(leaveInput.value) || 0;


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

    if (!formattedTime) {
        showNotification("Vui lòng chọn ngày tháng!");
        return;
    }

    if (!isAttendanceValid(working, absence, leave, formattedTime)) {
        showNotification("Tổng số ngày đi làm và nghỉ vượt quá số ngày trong tháng!");
        return;
    }

    try {
        // 1. Lấy toàn bộ bản ghi để kiểm tra
        const res = await fetch("http://127.0.0.1:5000/api/attendances/");
        const allAttendances = await res.json();

        const selectedMonth = getMonthYear(formattedTime);

        // 2. Lấy employee_id của bản ghi đang sửa
        const currentAttendance = allAttendances.find(item => item.id === selectedAttendanceId);
        if (!currentAttendance) {
            showNotification("Không tìm thấy bản ghi để cập nhật!");
            return;
        }

        const employeeId = currentAttendance.employee_id;

        // 3. Kiểm tra xem có bản ghi nào khác (không phải chính nó) trùng tháng và employee_id không
        const conflict = allAttendances.some(item => {
            return item.employee_id === employeeId &&
                   item.id !== selectedAttendanceId &&
                   getMonthYear(item.time) === selectedMonth;
        });

        if (conflict) {
            showNotification("Đã tồn tại bản ghi tháng này của nhân viên!");
            return;
        }

        // 4. Gửi request PUT
        const updatedAttendance = {
            working_days: working,
            absence: absence,
            leave: leave,
            time: formattedTime
        };

        const updateRes = await fetch(`http://127.0.0.1:5000/api/attendances/${selectedAttendanceId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            body: JSON.stringify(updatedAttendance)
        });

        const data = await updateRes.json();
        if (updateRes.ok) {
            loadAttendance();
            hideModal();
            showNotification("Cập nhật chấm công thành công.");
        } else {
            showNotification(data.message || "Xóa chấm công thất bại!");
        }

    } catch (error) {
        console.error("Error updating attendance:", error);
        showNotification("Lỗi khi cập nhật attendance!");
    }
}

    async function deleteAttendance() {

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
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/attendances/${selectedAttendanceId}`, {
                method: "DELETE",
                headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            
            });
            const data = await res.json();
            if (res.ok) {
                loadAttendance();
                hideConfirmationModal();
                showNotification("Xóa chấm công thành công.");
            } else {
                showNotification(data.message || "Xóa chấm công thất bại!");
            }
        } catch (error) {
            console.error("Error deleting attendance:", error);
            showNotification("Lỗi khi xóa attendance!");
        }
    }

    async function fetchAttendanceDetails(id) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/attendances/${id}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const attendance = await res.json();
            populateModal(attendance);
            openModal();
        } catch (error) {
            console.error("Error fetching attendance details:", error);
            showNotification("Không thể tải chi tiết Attendance.");
        }
    }

    // --- Functions to render data on the UI ---
    function updateIds() {
    const rows = document.querySelectorAll('.account-table tbody tr'); // Sử dụng selector đúng với bảng của bạn
    rows.forEach((row, index) => {
        const idCell = row.querySelector('.id-cell');
        if (idCell) {
            idCell.textContent = index + 1;
        }
    });
}

    function renderAttendanceTable(attendanceRecords) {
        attendanceTableBody.innerHTML = '';
        attendanceRecords.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
                    <td class="id-cell">${record.id}</td>
                    <td>${record.employee_id}</td>
                    <td>${record.employee_name}</td>
                    <td>${record.department}</td>
                    <td>${record.job_title}</td>
                    <td>${record.working_days}</td>
                    <td>${record.absence}</td>
                    <td>${record.leave}</td>
                    <td>${record.time}</td>
                    <td>
                        <button class="edit-btn" data-id="${record.id}" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                            <img src="assets/img/pencil-write.png" alt="Edit" style="width: 12px; height: 12px; transform: scale(1.8); display: block; margin: 3.5px; vertical-align: middle;">
                        </button>
                        <button class="delete-btn" data-id="${record.id}" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                            <img src="assets/img/bin.png" alt="Delete" style="width: 8px; height: 8px; transform: scale(1.8); display: block; margin: 4px; vertical-align: middle;">
                        </button>
                    </td>
                `;

            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => {
                selectedAttendanceId = record.id;
                fetchAttendanceDetails(record.id);
            });

            deleteBtn.addEventListener('click', () => {
                selectedAttendanceId = record.id;
                showConfirmationModal("Bạn có chắc chắn muốn xóa attendance của nhân viên này không?", deleteAttendance);
            });

            attendanceTableBody.appendChild(row);
        });
    }

    function populateModal(attendance) {
        document.getElementById("idInput").value = attendance.employee_id || '';
        attendanceModal.querySelector('input[placeholder="Working days"]').value = attendance.working_days || '';
        attendanceModal.querySelector('input[placeholder="Absences"]').value = attendance.absence || '';
        attendanceModal.querySelector('input[placeholder="Leave days"]').value = attendance.leave || '';
        const timeParts = attendance.time ? attendance.time.split('/') : [];
        if (timeParts.length === 2) {
            attendanceModal.querySelector('input[type="date"]').value = `${timeParts[1]}-${timeParts[0]}-01`;
        } else {
            attendanceModal.querySelector('input[type="date"]').value = '';
        }
    }

    function showNotification(message) {
        notificationMessage.textContent = message;
        notificationModal.style.display = "block";
        overlay.style.display = "block";

        const closeBtn = notificationModal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notificationModal.style.display = "none";
                overlay.style.display = "none";
            });
        }
    }

    function showConfirmationModal(message, onConfirm) {
        const confirmationModal = document.getElementById('deleteAccountModal'); // Reuse delete modal
        const confirmButton = confirmationModal.querySelector('.confirm-btn');
        const cancelButton = confirmationModal.querySelector('.exit-btn');
        const confirmationMessage = confirmationModal.querySelector('p');

        confirmationMessage.textContent = message;
        confirmationModal.style.display = "block";
        overlay.style.display = "block";

        confirmButton.onclick = () => {
            onConfirm();
            confirmationModal.style.display = "none";
            overlay.style.display = "none";
        };

        cancelButton.onclick = () => {
            confirmationModal.style.display = "none";
            overlay.style.display = "none";
        };
    }

    function hideConfirmationModal() {
        const confirmationModal = document.getElementById('deleteAccountModal');
        confirmationModal.style.display = "none";
        overlay.style.display = "none";
        selectedAttendanceId = null; // Reset selected attendance after confirmation
    }

    function openModal() {
        attendanceModal.style.display = 'block';
        overlay.style.display = 'block';
    }

    function openModalForNew() {
        selectedAttendanceId = null;
        clearModalForm();
        openModal();
    }

    function hideModal() {
        attendanceModal.style.display = 'none';
        overlay.style.display = 'none';
        clearModalForm();
        selectedAttendanceId = null;
    }

    function clearModalForm() {
        document.getElementById("idInput").value = '';
        attendanceModal.querySelector('input[placeholder="Working days"]').value = '';
        attendanceModal.querySelector('input[placeholder="Absences"]').value = '';
        attendanceModal.querySelector('input[placeholder="Leave days"]').value = '';
        attendanceModal.querySelector('input[type="date"]').value = '';
    }

    // --- Event Listeners ---
    const notificationExitBtn = document.querySelector('#notificationModal .exit-btn');
    notificationExitBtn.addEventListener('click', () => {
        notificationModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    addAttendanceBtn.addEventListener('click', openModalForNew);
    closeBtn.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);
    saveBtn.addEventListener('click', () => {
        if (selectedAttendanceId) {
            updateAttendance();
        } else {
            addAttendance();
        }
    });
    const routes = {
        'account': 'admin.html',
        'employee': 'employee.html',
        'payroll': 'payroll.html',
        'attendance': 'attendance.html',
        'department': 'department_jobtitle.html',
        'report': 'report.html',
        'notification': 'notification.html',
    };

    searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim().toLowerCase();
    
    const filtered = allAttendanceRecords.filter(attendance => {
        const idMatch = String(attendance.employee_id).toLowerCase().includes(keyword);
        const nameMatch = attendance.employee_name?.toLowerCase().includes(keyword) || false;
        const jobTitleMatch = attendance.job_title?.toLowerCase().includes(keyword) || false;
        const departmentMatch = attendance.department?.toLowerCase().includes(keyword) || false;
        return idMatch || nameMatch || jobTitleMatch || departmentMatch ;
    });
    
    renderAttendanceTable(filtered);
});
    Object.keys(routes).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = 'pointer'; // Hiện thị dấu tay khi rê chuột
            el.addEventListener('click', () => {
                window.location.href = routes[id]; // Chuyển trang khi click vào menu
            });
        }
    });



    // nút xem history
    // showHistoryBtn.addEventListener("click", () => {
    //     loadHistory();
    //     historyModal.style.display = "block";
    //     historyOverlay.style.display = "block";
    // });

    // historyCloseBtn.addEventListener("click", closeHistoryModal);
    // historyOverlay.addEventListener("click", closeHistoryModal);

    // function closeHistoryModal() {
    //     historyModal.style.display = "none";
    //     historyOverlay.style.display = "none";
    // }

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
    //             tr.innerHTML =
    //                 `<td>${index + 1}</td>
    //             <td>${item.username}</td>
    //             <td>${item.action}</td>
    //             <td>${item.target_user || "-"}</td>
    //             <td>${formattedTime}</td>`
    //                 ;
    //             tbody.appendChild(tr);
    //         });
    //     } catch (err) {
    //         console.error("Lỗi tải lịch sử:", err);
    //     }
    // }

    // Sự kiện nút Đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        // Hiển thị thông báo hoặc chuyển hướng
        alert("Bạn đã đăng xuất!");
        window.location.href = "login.html"; // hoặc trang login bạn sử dụng
    });

    // --- Initial Data Load ---
    loadAttendance();
});
