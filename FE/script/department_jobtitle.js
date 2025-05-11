document.addEventListener("DOMContentLoaded", function () {
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
    // Open modals
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

    // Close modals
    $('#close-department, #ok-department').click(() => {
        $('#department-modal').fadeOut();
    });

    $('#close-jobtitle, #ok-jobtitle').click(() => {
        $('#job-title-modal').fadeOut();
    });

    // Close if click outside modal
    $('.modal-overlay').click(function (e) {
        if (e.target === this) {
            $(this).fadeOut();
        }
    });

    // Init names
    $('#department-select').trigger('change');
    $('#jobtitle-select').trigger('change');
});

$('#reset-btn').click(function () {
    $('#department-select').val('');
    $('#jobtitle-select').val('');
    $('#department-name').text('');
    $('#job-title-name').text('');
});