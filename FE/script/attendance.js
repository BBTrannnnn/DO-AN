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
            } catch (error) {
                console.error("Failed to load attendance:", error);
                showNotification("Lỗi khi load attendance!");
            }
        }

        async function addAttendance() {
            const idInput = document.getElementById("idInput");
            const workingDaysInput = attendanceModal.querySelector('input[placeholder="Working days"]');
            const absenceInput = attendanceModal.querySelector('input[placeholder="Absences"]');
            const leaveInput = attendanceModal.querySelector('input[placeholder="Leave days"]');
            const timeInput = attendanceModal.querySelector('input[type="date"]');

            const newAttendance = {
                employee_id: idInput.value.trim(),
                working_days: parseInt(workingDaysInput.value) || 0,
                absence: parseInt(absenceInput.value) || 0,
                leave: parseInt(leaveInput.value) || 0,
                time: timeInput.value ? timeInput.value.slice(0, 7).split('-').reverse().join('/') : ''
            };

            try {
                const res = await fetch("http://127.0.0.1:5000/api/attendances/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newAttendance)
                });
                const data = await res.json();
                if (res.ok) {
                    loadAttendance();
                    hideModal();
                    showNotification("Thêm attendance thành công!.");
                } else {
                    showNotification(data.message || "lỗi khi thêm attendance!");
                }
            } catch (error) {
                console.error("Error adding attendance:", error);
                showNotification("lỗi khi thêm attendance!");
            }
        }

        async function updateAttendance() {
            const workingDaysInput = attendanceModal.querySelector('input[placeholder="Working days"]');
            const absenceInput = attendanceModal.querySelector('input[placeholder="Absences"]');
            const leaveInput = attendanceModal.querySelector('input[placeholder="Leave days"]');
            const timeInput = attendanceModal.querySelector('input[type="date"]');

            const updatedAttendance = {
                working_days: parseInt(workingDaysInput.value) || 0,
                absence: parseInt(absenceInput.value) || 0,
                leave: parseInt(leaveInput.value) || 0,
                time: timeInput.value ? timeInput.value.slice(0, 7).split('-').reverse().join('/') : ''
            };

            try {
                const res = await fetch(`http://127.0.0.1:5000/api/attendances/${selectedAttendanceId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedAttendance)
                });
                const data = await res.json();
                if (res.ok) {
                    loadAttendance();
                    hideModal();
                    showNotification("Cập nhật attendace thành công!");
                } else {
                    showNotification(data.message || "Lỗi khi cập nhật attendance!");
                }
            } catch (error) {
                console.error("Error updating attendance:", error);
                showNotification("Lỗi khi cập nhật attendance! ");
            }
        }

        async function deleteAttendance() {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/attendances/${selectedAttendanceId}`, {
                    method: "DELETE"
                });
                const data = await res.json();
                if (res.ok) {
                    loadAttendance();
                    hideConfirmationModal();
                    showNotification("Xóa attendance thành công!");
                } else {
                    showNotification(data.message || "Lỗi khi xóa attendance!");
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

        function renderAttendanceTable(attendanceRecords) {
            attendanceTableBody.innerHTML = '';
            attendanceRecords.forEach(record => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${record.id}</td>
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
                    showConfirmationModal("Are you sure you want to delete this attendance record?", deleteAttendance);
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
        };
        Object.keys(routes).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.cursor = 'pointer'; // Hiện thị dấu tay khi rê chuột
                el.addEventListener('click', () => {
                    window.location.href = routes[id]; // Chuyển trang khi click vào menu
                });
            }
        });

        // --- Initial Data Load ---
        loadAttendance();
    });