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
        "1": "IT",
        "2": "HR",
        "3": "Sales",
        "4": "Marketing",
        "5": "Finance",
        "6": "Administration"
    };

    const jobTitleMap = {
    '1.1':'Software Engineer',
    '1.2' :'Backend Developer',
    '1.3':'Frontend Developer',
    '1.4':'QA Tester' ,
    '1.5':'DevOps Engineer',
    '2.1':'HR Assistant',
    '2.2':'HR Manager',
    '2.3':'Recruiter' ,
    '2.4':'Payroll Specialist',
    '3.1':'Sales Executive',
    '3.2':'Sales Representative',
    '3.3':'Account Manager' ,
    '3.4':'Business Development Executive',
    '4.1':'Marketing Specialist',
    '4.2':'Content Creator',
    '4.3':'SEO Specialist',
    '4.4':'Social Media Manager',
    '5.1':'Accountant',
    '5.2':'Financial Analyst',
    '5.3':'Auditor',
    '5.4':'Bookkeeper',
    '6.1':'Office Administrator',
    '6.2':'Receptionist',
    '6.3':'Administrative Assistant',
    '6.4':'Data Entry Clerk',
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
    // =============== FILTER FUNCTIONALITY ===============
const deptSelect = document.getElementById('department-select');
const jobSelect = document.getElementById('jobtitle-select');
const deptName = document.getElementById('department-name');
const jobName = document.getElementById('job-title-name');
const resetBtn = document.getElementById('reset-btn');

// Sự kiện nút Đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        // Hiển thị thông báo hoặc chuyển hướng
        alert("Bạn đã đăng xuất!");
        window.location.href = "login.html"; // hoặc trang login bạn sử dụng
    });

if (deptSelect && jobSelect) {
    deptSelect.addEventListener('change', function () {
        const selectedDept = this.value;
        deptName.textContent = departmentMap[selectedDept] || '';

        // Cập nhật job titles theo department
        jobSelect.innerHTML = '<option value="">----</option>';
        for (const key in jobTitleMap) {
            if (selectedDept === '' || key.startsWith(selectedDept + '.')) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = jobTitleMap[key];
                jobSelect.appendChild(option);
            }
        }

        // Trigger lọc sau khi cập nhật job title
        filterTable();
    });

    jobSelect.addEventListener('change', function () {
        jobName.textContent = jobTitleMap[this.value] || '';
        filterTable();
    });

    resetBtn.addEventListener('click', function () {
        deptSelect.value = '';
        deptName.textContent = '';
        jobName.textContent = '';

        // Reset job title dropdown
        jobSelect.innerHTML = '<option value="">----</option>';
        for (const key in jobTitleMap) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = jobTitleMap[key];
            jobSelect.appendChild(option);
        }

        renderDepartmentJobTitleTable(window.departmentJobTitleData);
    });
}

// ==================== FILTER FUNCTION ====================
function filterTable() {
    const selectedDept = deptSelect.value;
    const selectedJob = jobSelect.value;

    const filtered = window.departmentJobTitleData.filter(item => {
        const matchDept = !selectedDept || item.id_department === selectedDept;
        const matchJob = !selectedJob || item.id_job_title === selectedJob;
        return matchDept && matchJob;
    });



    renderDepartmentJobTitleTable(filtered);
}
});
