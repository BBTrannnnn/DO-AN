document.addEventListener("DOMContentLoaded", function () {
    const routes = {
        'account': 'admin.html',
        'employee': 'employee.html',
        'payroll': 'payroll.html',
        'attendance': 'attendance.html',
        'department': 'department_jobtitle.html',
        'report': 'report.html',
    };

    Object.keys(routes).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                window.location.href = routes[id];
            });
        }
    });

    loadDepartmentJobTitleData(); // <-- Gọi hàm khi DOM load xong
});

const departmentMap = {
    "PC01": "IT",
    "PC02": "HR",
    "PC03": "Finance"
};

const jobTitleMap = {
    "JT01": "Developer",
    "JT02": "Designer",
    "JT03": "Manager"
};

$(document).ready(function () {
    $('#department-label').click(() => {
        $('#department-modal').css('display', 'flex');
    });

    $('#job-title-label').click(() => {
        $('#job-title-modal').css('display', 'flex');
    });

    $('#department-select').change(function () {
        const selected = $(this).val();
        $('#department-name').text(departmentMap[selected] || '');
    });

    $('#jobtitle-select').change(function () {
        const selected = $(this).val();
        $('#job-title-name').text(jobTitleMap[selected] || '');
    });

    $('#close-department, #ok-department').click(() => {
        $('#department-modal').fadeOut();
    });

    $('#close-jobtitle, #ok-jobtitle').click(() => {
        $('#job-title-modal').fadeOut();
    });

    $('.modal-overlay').click(function (e) {
        if (e.target === this) {
            $(this).fadeOut();
        }
    });

    $('#department-select').trigger('change');
    $('#jobtitle-select').trigger('change');
});

$('#reset-btn').click(function () {
    $('#department-select').val('');
    $('#jobtitle-select').val('');
    $('#department-name').text('');
    $('#job-title-name').text('');
});

// 🔄 Hàm lấy dữ liệu từ API và hiển thị lên bảng
function loadDepartmentJobTitleData() {
    fetch('http://127.0.0.1:5000/api/department-job-title') // KHỚP với Flask app.py
        .then(response => {
            if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu');
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('department-job-title-body');
            tbody.innerHTML = ''; // Xóa dữ liệu cũ

            data.forEach(item => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${item.id_department}</td>
                    <td>${item.id_job_title}</td>
                    <td>${item.id_employee}</td>
                    <td>${item.name}</td>
                    <td>${item.department}</td>
                    <td>${item.job_title}</td>
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(error => {
            console.error("Không thể tải dữ liệu department-job-title:", error);
        });
}
