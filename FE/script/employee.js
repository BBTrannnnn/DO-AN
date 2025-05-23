document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors for DOM elements ---
    const addEmployeeBtn = document.querySelector('.add-employee-button');
    const employeeModal = document.getElementById('employeeModal');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');
    const saveBtn = document.querySelector('.ok-btn'); // Nút OK trong modal
    const employeeTableBody = document.querySelector('.employee-table tbody'); // Bảng hiển thị nhân viên
    const departmentSelect = document.getElementById("departmentSelect");
    const jobTitleSelect = document.getElementById("jobTitleSelect");
    const searchInput = document.getElementById("searchInput");
    const notificationModal = document.getElementById('notificationModal');
    const notificationMessage = notificationModal.querySelector('p');
    

    // --- Data variables ---
    let allEmployees = [];
    let selectedEmployee = null; // Lưu ID nhân viên đang được chỉnh sửa hoặc xóa
    const jobTitlesByDepartment = {
        IT: ["Software Engineer", "Backend Developer", "Frontend Developer", "QA Tester", "DevOps Engineer"],
        HR: ["HR Assistant", "HR Manager", "Recruiter", "Payroll Specialist"],
        Sales: ["Sales Executive", "Sales Representative", "Account Manager", "Business Development Executive"],
        Marketing: ["Marketing Specialist", "Content Creator", "SEO Specialist", "Social Media Manager"],
        Finance: ["Accountant", "Financial Analyst", "Auditor", "Bookkeeper"],
        Administration: ["Office Administrator", "Receptionist", "Administrative Assistant", "Data Entry Clerk"]
    };

    // --- Functions to interact with the backend ---

    async function loadEmployees() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/employees/");
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const employees = await res.json();
            allEmployees = employees;
            renderEmployeeTable(employees);
        } catch (error) {
            console.error("Failed to load employees:", error);
            showNotification("Failed to load employees.");
        }
    }

    function isAtLeast18YearsOld(dob, workingDate) {
    const dobDate = new Date(dob);
    const workDate = new Date(workingDate);

    const age = workDate.getFullYear() - dobDate.getFullYear();
    const monthDiff = workDate.getMonth() - dobDate.getMonth();
    const dayDiff = workDate.getDate() - dobDate.getDate();

    if (age > 18) return true;
    if (age === 18) {
        if (monthDiff > 0) return true;
        if (monthDiff === 0 && dayDiff >= 0) return true;
    }
    return false;
    }

    function capitalizeWords(str) {
    return str
        .toLowerCase()
        .trim()
        .split(" ")
        .filter(word => word.length > 0)
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");
    }



    async function addEmployee() {
        const idInput = document.getElementById("idInput");
        const nameInput = document.getElementById("nameInput");
        const genderInput = document.getElementById("genderInput");
        const jobTitleSelectModal = document.getElementById("jobTitleSelect");
        const departmentSelectModal = document.getElementById("departmentSelect");
        const emailInput = document.getElementById("emailInput");
        const workingStatusInput = document.getElementById("workingStatusInput");
        const dobInput = document.getElementById("dobInput");


        // Kiểm tra các trường bắt buộc
    if (!isAtLeast18YearsOld(dobInput.value.trim(), workingStatusInput.value.trim())) {
        showNotification("Nhân viên phải đủ 18 tuổi trở lên!.");
        return;
    }

    if (!idInput.value.trim()) {
        showNotification("Vui lòng nhập mã nhân viên.");
        return;
    }
    if (!nameInput.value.trim()) {
        showNotification("Vui lòng nhập tên nhân viên.");
        return;
    }
    if (!genderInput.value) {
        showNotification("Vui lòng chọn giới tính.");
        return;
    }
    if (!jobTitleSelectModal.value) {
        showNotification("Vui lòng chọn chức vụ.");
        return;
    }
    if (!departmentSelectModal.value) {
        showNotification("Vui lòng chọn phòng ban.");
        return;
    }
    if (!emailInput.value.trim()) {
        showNotification("Vui lòng nhập email.");
        return;
    }
    if (!workingStatusInput.value) {
        showNotification("Vui lòng chọn tình trạng làm việc.");
        return;
    }
    if (!dobInput.value) {
        showNotification("Vui lòng nhập ngày sinh.");
        return;
    }

    const token = localStorage.getItem("token");  // Lấy token từ localStorage

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
            return;
        }
        const decodedToken = jwt_decode(token);
        const userRole = decodedToken.role;
        const allowedRoles = ["admin", "hr management"];

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


        const newEmployee = {
            id: idInput.value.trim(),
            name: capitalizeWords(nameInput.value),
            gender: genderInput.value,
            job_title: jobTitleSelectModal.value,
            department: departmentSelectModal.value,
            email: emailInput.value,
            working_status: workingStatusInput.value,
            dob: dobInput.value

        };

        try {
            const res = await fetch("http://127.0.0.1:5000/api/employees/", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
                body: JSON.stringify(newEmployee)
            });
            const data = await res.json();
            if (res.ok) {
                loadEmployees();
                hideModal();
                showNotification("Nhân viên đã được thêm thành công.");
            } else {
                showNotification(data.message || "Có lỗi xảy ra khi thêm nhân viên.");
            }
        } catch (error) {
            console.error("Error adding employee:", error);
            showNotification("Có lỗi xảy ra khi thêm nhân viên.");
        }
    }

    async function updateEmployee() {
        const nameInput = document.getElementById("nameInput");
        const jobTitleSelectModal = document.getElementById("jobTitleSelect");
        const departmentSelectModal = document.getElementById("departmentSelect");
        const emailInput = document.getElementById("emailInput");
        const workingStatusInput = document.getElementById("workingStatusInput");
        const dobInput = document.getElementById("dobInput");

        if (!isAtLeast18YearsOld(dobInput.value.trim(), workingStatusInput.value.trim())) {
        showNotification("Nhân viên phải đủ 18 tuổi trở lên!.");
        return;
    }

    if (!idInput.value.trim()) {
        showNotification("Vui lòng nhập mã nhân viên.");
        return;
    }
    if (!nameInput.value.trim()) {
        showNotification("Vui lòng nhập tên nhân viên.");
        return;
    }
    if (!genderInput.value) {
        showNotification("Vui lòng chọn giới tính.");
        return;
    }
    if (!jobTitleSelectModal.value) {
        showNotification("Vui lòng chọn chức vụ.");
        return;
    }
    if (!departmentSelectModal.value) {
        showNotification("Vui lòng chọn phòng ban.");
        return;
    }
    if (!emailInput.value.trim()) {
        showNotification("Vui lòng nhập email.");
        return;
    }
    if (!workingStatusInput.value) {
        showNotification("Vui lòng chọn tình trạng làm việc.");
        return;
    }
    if (!dobInput.value) {
        showNotification("Vui lòng nhập ngày sinh.");
        return;
    }


    const token = localStorage.getItem("token");  // Lấy token từ localStorage

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
            return;
        }
        const decodedToken = jwt_decode(token);
        const userRole = decodedToken.role;
        const allowedRoles = ["admin", "hr management"];

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

        const updatedEmployee = {
            name: capitalizeWords(nameInput.value),
            gender: genderInput.value,
            job_title: jobTitleSelectModal.value,
            department: departmentSelectModal.value,
            email: emailInput.value,
            working_status: workingStatusInput.value,
            dob: dobInput.value
        };

        try {
            const res = await fetch(`http://127.0.0.1:5000/api/employees/${selectedEmployee}`, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
                body: JSON.stringify(updatedEmployee)
            });
            const data = await res.json();
            if (res.ok) {
                loadEmployees();
                hideModal();
                showNotification("Cập nhật thông tin nhân viên thành công.");
            } else {
                showNotification(data.message || "Cập nhật thông tin nhân viên thất bại!");
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            showNotification("Có lỗi xảy ra khi cập nhật nhân viên.");
        }
    }

    async function deleteEmployee() {
        const token = localStorage.getItem("token");  // Lấy token từ localStorage

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
            return;
        }
        const decodedToken = jwt_decode(token);
        const userRole = decodedToken.role;
        const allowedRoles = ["admin", "hr management"];

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
            const res = await fetch(`http://127.0.0.1:5000/api/employees/${selectedEmployee}`, {
                 method: "DELETE",
                headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            });
            const data = await res.json();
            if (res.ok) {
                loadEmployees();
                hideModal();
                showNotification("Xóa nhân viên thành công.");
            } else {
                showNotification(data.message || "Xóa nhân viên thất bại!!!");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            showNotification("Có lỗi xảy ra khi xóa nhân viên.");
        }
    }

    async function fetchEmployeeDetails(id) {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/employees/${id}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const employee = await res.json();
            populateModal(employee);
            openModal();
        } catch (error) {
            console.error("Error fetching employee details:", error);
            showNotification("Không thể tải thông tin nhân viên.");
        }
    }

    // --- Functions to render data on the UI ---

    function renderEmployeeTable(employees) {
        employeeTableBody.innerHTML = '';
        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.job_title}</td>
                <td>${employee.email}</td>
                <td>${employee.working_status}</td>
                <td>
                    <button class="edit-btn" data-id="${employee.id}" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                        <img src="assets/img/pencil-write.png" alt="Edit" style="width: 12px; height: 12px; transform: scale(1.8); display: block; margin: 3.5px; vertical-align: middle;">
                    </button>
                     <button class="delete-btn" data-id="${employee.id}"  style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                        <img src="assets/img/bin.png" alt="Edit" style="width: 8px; height: 8px; transform: scale(1.8); display: block; margin: 4px; vertical-align: middle;">
                    </button>
                </td>
            `;

            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');

            editBtn.addEventListener('click', () => {
                selectedEmployee = employee.id;
                fetchEmployeeDetails(employee.id);
            });

            deleteBtn.addEventListener('click', () => {
                selectedEmployee = employee.id;
                showConfirmationModal("Bạn có chắc chắn muốn xóa nhân viên này?", deleteEmployee);
            });

            employeeTableBody.appendChild(row);
        });
    }

    function populateModal(employee) {
        document.getElementById("idInput").value = employee.id || '';
        document.getElementById("nameInput").value = employee.name || '';
        document.getElementById("genderInput").value = employee.gender || '';
        document.getElementById("emailInput").value = employee.email || '';
        document.getElementById("workingStatusInput").value = employee.working_status || '';
        document.getElementById("dobInput").value = employee.dob || '';
        idInput.disabled = selectedEmployee !== null;

        // Chọn department và sau đó chọn job title nếu có
        departmentSelect.value = employee.department || '---';
        updateJobTitles();
        requestAnimationFrame(() => {
            jobTitleSelect.value = employee.job_title || '---';
        });
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
        const confirmationModal = document.getElementById('deleteAccountModal');
        const confirmButton = confirmationModal.querySelector('.confirm-btn');
        const cancelButton = confirmationModal.querySelector('.exit-btn');
        const confirmationMessage = confirmationModal.querySelector('p');
        const overlay = document.getElementById('overlay');

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
        deleteConfirmationModal.style.display = "none";
        overlay.style.display = "none";
        selectedEmployeeId = null; // Reset selected employee after confirmation
    }

    function openModal() {
        employeeModal.style.display = 'block';
        overlay.style.display = 'block';
    }

    function openModalForNew() {
    selectedEmployee = null;
    clearModalForm();

    // Bật lại trường ID khi thêm mới
    document.getElementById("idInput").disabled = false;

    openModal();
}

    function hideModal() {
        employeeModal.style.display = 'none';
        overlay.style.display = 'none';
        clearModalForm();
        selectedEmployee = null;
    }

    function clearModalForm() {
    const idInput = document.getElementById("idInput");
    idInput.value = '';
    idInput.disabled = false;

    document.getElementById("nameInput").value = '';
    document.getElementById("emailInput").value = '';
    document.getElementById("workingStatusInput").value = '';
    document.getElementById("dobInput").value = '';
    departmentSelect.value = '';
    jobTitleSelect.innerHTML = '<option disabled selected>---</option>';
}

    function updateJobTitles() {
        const selectedDept = departmentSelect.value;
        const titles = jobTitlesByDepartment[selectedDept] || [];
        jobTitleSelect.innerHTML = '<option disabled selected>---</option>';
        titles.forEach(title => {
            const option = document.createElement("option");
            option.textContent = title;
            jobTitleSelect.appendChild(option);
        });
    }

    // --- Event Listeners ---
    const notificationExitBtn = document.querySelector('#notificationModal .exit-btn');
    notificationExitBtn.addEventListener('click', () => {
        notificationModal.style.display = 'none';
        overlay.style.display = 'none';
    });
    addEmployeeBtn.addEventListener('click', openModalForNew);
    closeBtn.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);
    saveBtn.addEventListener('click', () => {
        if (selectedEmployee) {
            updateEmployee();

        } else {
            addEmployee();
        }
    });
    departmentSelect.addEventListener("change", updateJobTitles);
    searchInput.addEventListener("input", function () {
        const searchText = searchInput.value.toLowerCase();
        const filteredEmployees = allEmployees.filter(employee =>
            employee.name.toLowerCase().includes(searchText) ||
            employee.job_title.toLowerCase().includes(searchText) ||
            employee.department.toLowerCase().includes(searchText)
        );
        renderEmployeeTable(filteredEmployees);
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

    
    addEmployeeBtn.addEventListener('click', () => {
        employeeModal.style.display = 'block';
        overlay.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        employeeModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        employeeModal.style.display = 'none';
        overlay.style.display = 'none';
    });



    // --- Initial Data Load ---
    loadEmployees();
});
