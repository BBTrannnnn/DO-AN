
document.addEventListener("DOMContentLoaded", function () {
    const API_BASE = 'http://localhost:5000/api/notifications';

    const btnGenerate = document.getElementById('btnGenerate');
    const notificationList = document.getElementById('notificationList');
    const exitBtns = document.querySelectorAll(".exit-btn");

    // Sự kiện nút Đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        // Hiển thị thông báo hoặc chuyển hướng
        alert("Bạn đã đăng xuất!");
        window.location.href = "login.html"; // hoặc trang login bạn sử dụng
    });

    // ALTER TABLE notifications 
    // MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT; chạy này trong navicat


    // Tải danh sách thông báo từ API và hiển thị
    async function loadNotifications() {
        try {
            const [resMySQL, resSQLServer] = await Promise.all([
                fetch(API_BASE + '/mysql', {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }),
                fetch(API_BASE + '/sqlserver', {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }),
            ]);

            if (!resMySQL.ok || !resSQLServer.ok) {
                throw new Error("Lỗi tải dữ liệu thông báo từ hệ thống");
            }

            const notifsMySQL = await resMySQL.json();
            const notifsSQLServer = await resSQLServer.json();

            // Lọc các thông báo có employee_id trùng giữa 2 hệ
            const sqlServerIDs = new Set(notifsSQLServer.map(n => n.employee_id));
            const commonNotifs = notifsMySQL.filter(n => sqlServerIDs.has(n.employee_id));

            notificationList.innerHTML = '';
            if (commonNotifs.length === 0) {
                notificationList.innerHTML = '<li>Chưa có thông báo hợp lệ.</li>';
                return;
            }

            commonNotifs.forEach(notif => {
                const li = document.createElement('li');
                li.className = 'notification-item';

                const contentHTML = `
                <div><strong>Thời gian:</strong> ${notif.created_at}</div>
                <div><strong>Mã nhân viên:</strong> ${notif.employee_id}</div>
                <div><strong>Nội dung:</strong> ${notif.message}</div>
            `;
                li.innerHTML = contentHTML;

                const delBtn = document.createElement('button');
                delBtn.textContent = 'Xóa';
                delBtn.className = 'del-btn';
                delBtn.onclick = () => deleteNotification(notif.id);

                li.appendChild(delBtn);
                notificationList.appendChild(li);
            });

        } catch (err) {
            notificationList.innerHTML = '<li>' + err.message + '</li>';
        }
    }


    // Gọi API tạo thông báo mới
    async function generateNotifications() {
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

        try {
            const [resMySQL, resSQLServer] = await Promise.all([
                fetch(API_BASE + '/generate/mysql', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                }),
                fetch(API_BASE + '/generate/sqlserver', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                })
            ]);

            if (!resMySQL.ok || !resSQLServer.ok) {
                throw new Error('Tạo thông báo thất bại!');
            }



            alert("Tạo thông báo thành công!\n");
            loadNotifications();
        } catch (err) {
            alert("Lỗi khi tạo thông báo: " + err.message);
        }
    }

    // Xóa thông báo theo id
    async function deleteNotification(id) {
        const token = localStorage.getItem("token");

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");
            return;
        }

        const decodedToken = jwt_decode(token);
        const userRole = decodedToken.role;
        const allowedRoles = ["admin"];

        // Chuẩn hóa role thành mảng, không phân biệt hoa thường
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

        if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;

        try {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            const [resMySQL, resSQLServer] = await Promise.all([
                fetch(`${API_BASE}/${id}/mysql`, { method: 'DELETE', headers }),
                fetch(`${API_BASE}/${id}/sqlserver`, { method: 'DELETE', headers })
            ]);

            if (!resMySQL.ok && !resSQLServer.ok) {
                throw new Error("Không thể xóa thông báo ở cả hai nguồn.");
            }

            const resultMySQL = await resMySQL.json();
            const resultSQLServer = await resSQLServer.json();

            alert(resultMySQL.message || resultSQLServer.message || "Đã xóa thông báo.");
            loadNotifications();
        } catch (err) {
            alert(err.message || "Lỗi khi xóa thông báo.");
        }
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


    function showNotification(message) {
        notificationModal.querySelector("p").textContent = message;
        notificationModal.style.display = "block";
        overlay.style.display = "block";
        accountModal.style.display = "none";
    }

    exitBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            if (this.closest('#notificationModal')) {
                notificationModal.style.display = "none";
            }
            overlay.style.display = "none";
        });
    });

    btnGenerate.addEventListener('click', generateNotifications);

    // Load danh sách thông báo khi trang tải
    window.onload = loadNotifications;
});