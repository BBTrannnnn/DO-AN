document.addEventListener("DOMContentLoaded", function () {
    const editBtns = document.querySelectorAll(".edit-btn");
    const deleteBtns = document.querySelectorAll(".delete-btn");
    const accountModal = document.getElementById("accountModal");
    const deleteAccountModal = document.getElementById("deleteAccountModal");
    const notificationModal = document.getElementById("notificationModal");
    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("closeBtn");
    const okBtn = document.querySelector(".ok-btn");
    const exitBtns = document.querySelectorAll(".exit-btn");
    const confirmBtn = document.querySelector(".confirm-btn");
    const addAccountBtn = document.querySelector(".add-account");
    const searchInput = document.getElementById("searchInput"); 
    const admin = localStorage.getItem("admin"); // Lấy tên admin từ localStorage
    const showHistoryBtn = document.getElementById("showHistoryBtn");
    const historyModal = document.getElementById("historyModal");
    const historyOverlay = document.getElementById("historyOverlay");
    const historyCloseBtn = document.getElementById("historyCloseBtn");
    

    

    let selectedUser = null;
    let allUsers = [];

    // Load danh sách account từ Flask
    async function loadAccounts() {
        const res = await fetch("http://localhost:5000/api/get_users", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
         
        });
        const users = await res.json();

        allUsers = users;
        renderAccounts(users);
    }


    async function loadHistory() {
        try {
            const res = await fetch("http://localhost:5000/api/get_history");
            const data = await res.json();
            const tbody = document.querySelector("#historyTable tbody");
            tbody.innerHTML = "";

            data.forEach((item, index) => {
                const tr = document.createElement("tr");
                const formattedTime = new Date(item.timestamp).toLocaleString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",  // Chỉ định múi giờ cho Việt Nam
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                });
                tr.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.username}</td>
                    <td>${item.action}</td>
                    <td>${item.target_user || "-"}</td>
                    <td>${formattedTime}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error("Lỗi tải lịch sử:", err);
        }
    }

    async function renderAccounts(users) {
        const tableBody = document.querySelector(".account-table tbody");
        tableBody.innerHTML = "";
        
        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.password}</td>
                <td>${user.role}</td>
                <td>
                    <button class="edit-btn" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                        <img src="assets/img/pencil-write.png" alt="Edit" style="width: 12px; height: 12px; transform: scale(1.8); display: block; margin: 3.5px; vertical-align: middle;">
                    </button>
                     <button class="delete-btn" style="width: 24px; height: 24px; padding: 4px; overflow: hidden;">
                        <img src="assets/img/bin.png" alt="Edit" style="width: 8px; height: 8px; transform: scale(1.8); display: block; margin: 4px; vertical-align: middle;">
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll(".edit-btn").forEach((btn, index) => {
            btn.addEventListener("click", function () {
                const user = users[index];
                selectedUser = user.username;
                document.getElementById("userInput").value = user.username;
                document.getElementById("passwordInput").value = user.password;
                document.getElementById("departmentSelect").value = user.role;
                accountModal.style.display = "block";
                overlay.style.display = "block";
            });
        });
    
        document.querySelectorAll(".delete-btn").forEach((btn, index) => {
            btn.addEventListener("click", function () {
                selectedUser = users[index].username;
                deleteAccountModal.style.display = "block";
                overlay.style.display = "block";
            });
        });
    }

    // Thêm tài khoản
    async function addAccount() {
        const username = document.getElementById("userInput").value.trim();  
        const password = document.getElementById("passwordInput").value;
        const role = document.getElementById("departmentSelect").value || "Employee";  // Mặc định là "Employee"


            // Kiểm tra username là Gmail
        if (!username.endsWith("@gmail.com")) {
            showNotification("Tài khoản phải sử dụng @gmail.com");
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            showNotification("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        const res = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role })  
        });

        if (res.ok) {
            showNotification("Thêm tài khoản thành công.");
            const currentTime = new Date().toISOString(); // ví dụ: "2025-05-04T08:45:12.345Z"
            await fetch("http://localhost:5000/api/log_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "Add",
                    username: admin,
                    target_user: username,
                    timestamp: currentTime
                })
            });
            loadAccounts(); 
        } else {
            showNotification("Thêm tài khoản không thành công!!!");
        }
    }

    // Cập nhật tài khoản
    async function updateAccount() {
        const password = document.getElementById("passwordInput").value;
        const role = document.getElementById("departmentSelect").value;

        const res = await fetch("http://localhost:5000/api/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: selectedUser, password, role })
        });

        if (res.ok) {
            showNotification("Cập nhật tài khoản thành công.");
            const currentTime = new Date().toISOString(); // ví dụ: "2025-05-04T08:45:12.345Z"
            await fetch("http://localhost:5000/api/log_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "Update",
                    username: admin,
                    target_user: selectedUser,
                    timestamp: currentTime
                })
            });
            
            loadAccounts();
        } else {
            showNotification("Cập nhật tài khoản thất bại!!!!");
        }
    }

    // Xóa tài khoản
    async function deleteAccount() {
        deleteAccountModal.style.display = "none";
        const res = await fetch("http://localhost:5000/api/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: selectedUser })
        });

        if (res.ok) {
            showNotification("Xóa tài khoản thành công.");
            const currentTime = new Date().toISOString(); // ví dụ: "2025-05-04T08:45:12.345Z"
            await fetch("http://localhost:5000/api/log_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "Delete",
                    username: admin,
                    target_user: selectedUser,
                    timestamp: currentTime
                })
            });
            loadAccounts();
        } else {
            showNotification("Xóa tài khoản thất bại.");
        }
    }

    function showNotification(message) {
        notificationModal.querySelector("p").textContent = message;
        notificationModal.style.display = "block";
        overlay.style.display = "block";
        accountModal.style.display = "none";
    }
    
    // Sự kiện nút Add Account
    addAccountBtn.addEventListener("click", function () {
        selectedUser = null;
        document.getElementById("userInput").value = "";
        document.getElementById("passwordInput").value = "";
        document.getElementById("departmentSelect").value = "Employee"; // Mặc định là "employee"
        accountModal.style.display = "block";
        overlay.style.display = "block";
    });

    // Sự kiện nút OK trong form
    okBtn.addEventListener("click", function () {
        const username = document.getElementById("userInput").value;
        const password = document.getElementById("passwordInput").value;
        const role = document.getElementById("departmentSelect").value || "employee"; // Mặc định là "employee"
    
        if (selectedUser) {
            updateAccount(); // Cập nhật tài khoản
        } else {
            addAccount(username, password, role); // Thêm tài khoản mới
        }
    });

    closeBtn.addEventListener("click", () => {
        accountModal.style.display = "none";
        overlay.style.display = "none";
    });

    confirmBtn.addEventListener("click", deleteAccount);

    exitBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            if (this.closest('#notificationModal')) {
                notificationModal.style.display = "none";
            }
            if (this.closest('#deleteAccountModal')) {
                deleteAccountModal.style.display = "none";
            }
            overlay.style.display = "none";
        });
    });
    
    overlay.addEventListener("click", function () {
        accountModal.style.display = "none";
        deleteAccountModal.style.display = "none";
        notificationModal.style.display = "none";
        overlay.style.display = "none";
    });

    // Tìm kiếm tài khoản
    searchInput.addEventListener("input", function () {
        const keyword = searchInput.value.toLowerCase();
        const filtered = allUsers.filter(user =>
            user.username.toLowerCase().includes(keyword) ||
            user.password.toLowerCase().includes(keyword) ||
            user.role.toLowerCase().includes(keyword)
        );
        renderAccounts(filtered);
    });

    // Mở modal
    showHistoryBtn.addEventListener("click", () => {
        loadHistory();
        historyModal.style.display = "block";
        historyOverlay.style.display = "block";
    });

    // Đóng modal
    historyCloseBtn.addEventListener("click", closeHistoryModal);
    historyOverlay.addEventListener("click", closeHistoryModal);

    function closeHistoryModal() {
        historyModal.style.display = "none";
        historyOverlay.style.display = "none";
    }

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
    
    
    // Tải dữ liệu ban đầu
    loadAccounts();
});





