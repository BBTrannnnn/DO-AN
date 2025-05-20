
document.addEventListener("DOMContentLoaded", function () {
const API_BASE = 'http://localhost:5000/api/notifications';

    const btnGenerate = document.getElementById('btnGenerate');
    const notificationList = document.getElementById('notificationList');
    const exitBtns = document.querySelectorAll(".exit-btn");

    // Tải danh sách thông báo từ API và hiển thị
    async function loadNotifications() {
  try {
    const res = await fetch(API_BASE + '/');
    if (!res.ok) throw new Error('Lỗi tải thông báo: ' + res.status);
    const data = await res.json();

    notificationList.innerHTML = '';
    if (data.length === 0) {
      notificationList.innerHTML = '<li>Chưa có thông báo nào.</li>';
      return;
    }

    data.forEach(notif => {
      const li = document.createElement('li');
      li.className = 'notification-item';

      const contentHTML = `
        <div><strong>Thời gian:</strong> ${notif.created_at}</div>
        <div><strong>Mã nhân viên:</strong> ${notif.employee_id}</div>
        <div><strong>Tên nhân viên:</strong> ${notif.employee_name}</div>
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
       const token = localStorage.getItem("token");  // Kiểm tra token đã được lưu trong localStorage chưa

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
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
        } else {
            rolesInToken = [];
        }

        const hasRole = rolesInToken.some(r => allowedRoles.includes(r));
        if (!hasRole) {
            showNotification("Bạn không có quyền sử dụng chức năng này!");
            return;
        }
      try {
        const res = await fetch(API_BASE + '/generate',  { method: 'POST' , 
          headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            });
        if (!res.ok) throw new Error('Lỗi tạo thông báo: ' + res.status);
        const data = await res.json();
        alert(data.message);
        loadNotifications();
      } catch (err) {
        alert(err.message);
      }
    }

    // Xóa thông báo theo id
    async function deleteNotification(id) {

      const token = localStorage.getItem("token");  // Kiểm tra token đã được lưu trong localStorage chưa

        if (!token) {
            showNotification("Bạn chưa đăng nhập!");  // Thông báo nếu không có token
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
        } else {
            rolesInToken = [];
        }

        const hasRole = rolesInToken.some(r => allowedRoles.includes(r));
        if (!hasRole) {
            showNotification("Bạn không có quyền sử dụng chức năng này!");
            return;
        }

      if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' , 
          headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Gửi token trong header
            },
            });
        if (!res.ok) throw new Error('Lỗi xóa thông báo: ' + res.status);
        const data = await res.json();
        alert(data.message);
        loadNotifications();
      } catch (err) {
        alert(err.message);
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