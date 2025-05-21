document.addEventListener("DOMContentLoaded", function () {
    // ==================== DOM ELEMENTS ====================
    const routes = {
        'account': 'admin.html',
        'employee': 'employee.html',
        'payroll': 'payroll.html',
        'attendance': 'attendance.html',
        'department': 'department_jobtitle.html',
        'report': 'report.html',
        'notification': 'notification.html',
    };

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

    // ==================== EVENT LISTENERS ====================
    // Navigation
    Object.keys(routes).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', () => {
                window.location.href = routes[id];
            });
        }
    });

    // Department/Job Title Modals
    $('#department-label').click(() => {
        $('#department-modal').css('display', 'flex');
    });

    $('#job-title-label').click(() => {
        $('#job-title-modal').css('display', 'flex');
    });

    // Dropdown changes
    $('#department-select').change(function () {
        const selected = $(this).val();
        $('#department-name').text(departmentMap[selected] || '');
    });

    $('#jobtitle-select').change(function () {
        const selected = $(this).val();
        $('#job-title-name').text(jobTitleMap[selected] || '');
    });

    // Modal close buttons
    $('#close-department, #ok-department').click(() => {
        $('#department-modal').fadeOut();
    });

    $('#close-jobtitle, #ok-jobtitle').click(() => {
        $('#job-title-modal').fadeOut();
    });

    // Overlay click
    $('.modal-overlay').click(function (e) {
        if (e.target === this) {
            $(this).fadeOut();
        }
    });

    // Reset button
    $('#reset-btn').click(function () {
        $('#department-select').val('');
        $('#jobtitle-select').val('');
        $('#department-name').text('');
        $('#job-title-name').text('');
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener("input", handleSearch);
    }

    // Trigger initial changes
    $('#department-select').trigger('change');
    $('#jobtitle-select').trigger('change');

    // ==================== INITIAL LOAD ====================
    loadDepartmentJobTitleData();

    // ==================== FUNCTIONS ====================
    function handleSearch() {
        const keyword = this.value.trim().toLowerCase();
        
        if (!window.departmentJobTitleData) return;

        const filteredData = window.departmentJobTitleData.filter(item => {
            return (
                String(item.id_department).toLowerCase().includes(keyword) ||
                String(item.id_job_title).toLowerCase().includes(keyword) ||
                String(item.id_employee).toLowerCase().includes(keyword) ||
                String(item.name).toLowerCase().includes(keyword) ||
                String(item.department).toLowerCase().includes(keyword) ||
                String(item.job_title).toLowerCase().includes(keyword)
            );
        });

        renderDepartmentJobTitleTable(filteredData);
    }

    function loadDepartmentJobTitleData() {
        fetch('http://127.0.0.1:5000/api/department-job-title')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load data');
                return response.json();
            })
            .then(data => {
                window.departmentJobTitleData = data; // Store data globally
                renderDepartmentJobTitleTable(data);
            })
            .catch(error => {
                console.error("Error loading data:", error);
                alert("Error loading data. Please check console for details.");
            });
    }

    function renderDepartmentJobTitleTable(data) {
        const tbody = document.getElementById('department-job-title-body');
        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
            return;
        }

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
    }
});
