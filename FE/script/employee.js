document.addEventListener('DOMContentLoaded', () => {
    const addEmployeeBtn = document.querySelector('.add-employee-button');
    const employeeModal = document.getElementById('employeeModal');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.getElementById('closeBtn');

    addEmployeeBtn.addEventListener('click', () => {
        employeeModal.style.display = 'block';
        overlay.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        employeeModal.style.display = 'none';
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', () => {
        employeeModal.style.display = 'none';
        overlay.style.display = 'none';
    });


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
});


// chon department chi so ra nhung jobtitle tuong ung
const jobTitlesByDepartment = {
    IT: ["Software Engineer", "Backend Developer", "Frontend Developer", "QA Tester", "DevOps Engineer"],
    HR: ["HR Assistant", "HR Manager", "Recruiter", "Payroll Specialist"],
    Sales: ["Sales Executive", "Sales Representative", "Account Manager", "Business Development Executive"],
    Marketing: ["Marketing Specialist", "Content Creator", "SEO Specialist", "Social Media Manager"],
    Finance: ["Accountant", "Financial Analyst", "Auditor", "Bookkeeper"],
    Administration: ["Office Administrator", "Receptionist", "Administrative Assistant", "Data Entry Clerk"]
};

const departmentSelect = document.getElementById("departmentSelect");
const jobTitleSelect = document.getElementById("jobTitleSelect");

departmentSelect.addEventListener("change", function () {
    const selectedDept = this.value;
    const titles = jobTitlesByDepartment[selectedDept] || [];

    jobTitleSelect.innerHTML = '<option disabled selected>---</option>';

    titles.forEach(title => {
        const option = document.createElement("option");
        option.textContent = title;
        jobTitleSelect.appendChild(option);
    });

    
    
    // Tải dữ liệu ban đầu
    loadAccounts();
});