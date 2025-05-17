const API_BASE = 'http://localhost:5000/api/notifications';

    const btnGenerate = document.getElementById('btnGenerate');
    const notificationList = document.getElementById('notificationList');

    // Tải danh sách thông báo từ API và hiển thị
    async function loadNotifications() {
      try {
        const res = await fetch(API_BASE + '/');
        if (!res.ok) throw new Error('Lỗi tải thông báo: ' + res.status);
        const data = await res.json();

        notificationList.innerHTML = '';
        if(data.length === 0) {
          notificationList.innerHTML = '<li>Chưa có thông báo nào.</li>';
          return;
        }

        data.forEach(notif => {
          const li = document.createElement('li');
          const msgSpan = document.createElement('span');
          msgSpan.textContent = notif.message;
          msgSpan.className = 'msg';

          const delBtn = document.createElement('button');
          delBtn.textContent = 'Xóa';
          delBtn.className = 'del-btn';
          delBtn.onclick = () => deleteNotification(notif.id);

          li.appendChild(msgSpan);
          li.appendChild(delBtn);
          notificationList.appendChild(li);
        });
      } catch (err) {
        notificationList.innerHTML = '<li>' + err.message + '</li>';
      }
    }

    // Gọi API tạo thông báo mới
    async function generateNotifications() {
      try {
        const res = await fetch(API_BASE + '/generate', { method: 'POST' });
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
      if (!confirm('Bạn có chắc muốn xóa thông báo này?')) return;
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Lỗi xóa thông báo: ' + res.status);
        const data = await res.json();
        alert(data.message);
        loadNotifications();
      } catch (err) {
        alert(err.message);
      }
    }

    btnGenerate.addEventListener('click', generateNotifications);

    // Load danh sách thông báo khi trang tải
    window.onload = loadNotifications;