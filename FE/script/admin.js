
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
    try {
        const [resMySQL, resSQLServer] = await Promise.all([
            fetch("http://127.0.0.1:5000/api/get_users/mysql", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
            fetch("http://127.0.0.1:5000/api/get_users/sqlserver", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }),
        ]);

        if (!resMySQL.ok || !resSQLServer.ok) {
            throw new Error("Lấy danh sách tài khoản thất bại");
        }

        const usersMySQL = await resMySQL.json();
        const usersSQLServer = await resSQLServer.json();

        // Tạo Set các username của SQL Server để check nhanh
        const sqlServerUsernames = new Set(usersSQLServer.map(u => u.username));

        // Lọc lấy những user MySQL có username cũng tồn tại trong SQL Server
        const commonUsers = usersMySQL.filter(u => sqlServerUsernames.has(u.username));

        renderAccounts(commonUsers);
    } catch (error) {
        showNotification(error.message || "Lỗi khi tải tài khoản");
    }
}



    async function loadHistory() {
        try {
            const res = await fetch("http://127.0.0.1:5000/api/get_history");
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

    // làm gọn password
    function shortenText(text, maxLength) {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    }

    async function renderAccounts(users) {
        const tableBody = document.querySelector(".account-table tbody");
        tableBody.innerHTML = "";

        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${shortenText(user.password, 25)}</td>
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

                document.getElementById("passwordInput").value = user.password;
                document.getElementById("departmentSelect").value = user.role;

                document.getElementById("userInput").value = user.username
                document.getElementById("userInput").disabled = true; // Khóa ô input
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
    const token = localStorage.getItem("token");  // Kiểm tra token đã được lưu trong localStorage chưa

    if (!token) {
        showNotification("Bạn chưa đăng nhập!");
        return;
    }
    const decodedToken = jwt_decode(token);
    const userRole = decodedToken.role;
    const allowedRoles = ["admin"];

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

    if (!username.includes("@")) {
        showNotification("Tài khoản phải chứa ký tự @");
        return;
    }

    if (password.length < 6) {
        showNotification("Mật khẩu phải có ít nhất 6 ký tự");
        return;
    }

    try {
        // Gọi đồng thời 2 API thêm user cho mysql và sqlserver
        const [resMySQL, resSQLServer] = await Promise.all([
            fetch("http://127.0.0.1:5000/api/register/mysql", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, role })
            }),
            fetch("http://127.0.0.1:5000/api/register/sqlserver", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, role })
            }),
        ]);

        if (resMySQL.ok && resSQLServer.ok) {
            showNotification("Thêm tài khoản thành công.");

            const currentTime = new Date().toISOString();
            await fetch("http://127.0.0.1:5000/api/log_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "Add",
                    username: decodedToken.username || "admin",
                    target_user: username,
                    timestamp: currentTime
                })
            });
            loadAccounts();
        } else {
            // Lấy lỗi nếu có
            showNotification(`Thêm tài khoản thất bại!!!`);
        }
    } catch (error) {
        showNotification("Lỗi khi thêm tài khoản: " + error.message);
    }
}


    // Cập nhật tài khoản
    async function updateAccount() {
    const newUsername = document.getElementById("userInput").value;
    const password = document.getElementById("passwordInput").value;
    const role = document.getElementById("departmentSelect").value;

    const token = localStorage.getItem("token");
    if (!token) {
        showNotification("Bạn chưa đăng nhập!");
        return;
    }

    const decodedToken = jwt_decode(token);
    const userRole = decodedToken.role;
    const allowedRoles = ["admin"];

    let rolesInToken = [];
    if (Array.isArray(userRole)) {
        rolesInToken = userRole.map(r => r.toLowerCase());
    } else if (typeof userRole === "string") {
        rolesInToken = [userRole.toLowerCase()];
    }

    const hasRole = rolesInToken.some(r => allowedRoles.includes(r));
    if (!hasRole) {
        showNotification("Bạn không có quyền sử dụng chức năng này!");
        return;
    }

    const admin = decodedToken.username;

    if (!selectedUser) {
        showNotification("Chưa chọn tài khoản để cập nhật.");
        return;
    }

    try {
        // Gửi đồng thời 2 request cập nhật tài khoản MySQL và SQL Server
        const [resMySQL, resSQLServer] = await Promise.all([
            fetch("http://127.0.0.1:5000/api/update/mysql", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_username: selectedUser,
                    new_username: newUsername,
                    password: password,
                    role: role
                })
            }),
            fetch("http://127.0.0.1:5000/api/update/sqlserver", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    old_username: selectedUser,
                    new_username: newUsername,
                    password: password,
                    role: role
                })
            })
        ]);

        if (resMySQL.ok && resSQLServer.ok) {
            showNotification("Cập nhật tài khoản thành công.");

            const currentTime = new Date().toISOString();

            await fetch("http://127.0.0.1:5000/api/log_history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "Update",
                    username: admin,
                    target_user: newUsername,
                    timestamp: currentTime
                })
            });

            loadAccounts();
        } else {
            showNotification("Cập nhật tài khoản thất bại ở một hoặc cả hai cơ sở dữ liệu.");
        }
    } catch (error) {
        showNotification("Lỗi khi cập nhật tài khoản: " + error.message);
    }
}


    // Xóa tài khoản
    async function deleteAccount() {
    deleteAccountModal.style.display = "none";

    const token = localStorage.getItem("token");
    if (!token) {
        showNotification("Bạn chưa đăng nhập!");
        return;
    }

    const decodedToken = jwt_decode(token);
    const userRole = decodedToken.role;
    const allowedRoles = ["admin"];

    let rolesInToken = [];
    if (Array.isArray(userRole)) {
        rolesInToken = userRole.map(r => r.toLowerCase());
    } else if (typeof userRole === "string") {
        rolesInToken = [userRole.toLowerCase()];
    }

    const hasRole = rolesInToken.some(r => allowedRoles.includes(r));
    if (!hasRole) {
        showNotification("Bạn không có quyền sử dụng chức năng này!");
        return;
    }

    const admin = decodedToken.username;

    if (!selectedUser) {
        showNotification("Chưa chọn tài khoản để xóa.");
        return;
    }

    try {
        // Gửi đồng thời 2 request xóa tài khoản MySQL và SQL Server
        const [resMySQL, resSQLServer] = await Promise.all([
            fetch("http://127.0.0.1:5000/api/delete/mysql", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username: selectedUser })
            }),
            fetch("http://127.0.0.1:5000/api/delete/sqlserver", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ username: selectedUser })
            }),
        ]);

        if (resMySQL.ok && resSQLServer.ok) {
            showNotification("Xóa tài khoản thành công.");

            const currentTime = new Date().toISOString();

            await fetch("http://127.0.0.1:5000/api/log_history", {
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
            showNotification("Xóa tài khoản thất bại ở một hoặc cả hai cơ sở dữ liệu.");
        }
    } catch (error) {
        showNotification("Lỗi khi xóa tài khoản: " + error.message);
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
        document.getElementById("userInput").disabled = false;
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
    searchInput.addEventListener("input", () => {
        const keyword = searchInput.value.toLowerCase();

        const filtered = allUsers.filter(user =>
            user.username.toLowerCase().includes(keyword) ||

            user.role.toLowerCase().includes(keyword)
        );

        renderAccounts(filtered);  // Cập nhật lại bảng tài khoản
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

     // Sự kiện nút Đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        // Hiển thị thông báo hoặc chuyển hướng
        alert("Bạn đã đăng xuất!");
        window.location.href = "login.html"; // hoặc trang login bạn sử dụng
    });

    // Tải dữ liệu ban đầu
    loadAccounts();
});





