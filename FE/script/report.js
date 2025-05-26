document.addEventListener('DOMContentLoaded', () => {
  fetch('http://127.0.0.1:5000/api/report')
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok: ' + res.status + ' ' + res.statusText);
      }
      return res.json();
    })
    .then(data => {
      console.log('API data:', data);

      if (data.error) {
        console.error('API error:', data.error);
        alert('Lỗi khi lấy dữ liệu báo cáo: ' + data.error);
        return;
      }

      // Sự kiện nút Đăng xuất
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        // Hiển thị thông báo hoặc chuyển hướng
        alert("Bạn đã đăng xuất!");
        window.location.href = "login.html"; // hoặc trang login bạn sử dụng
    });

      // Hiển thị tổng quan nhân sự
      const overview = data.employee_overview;
      document.getElementById('total-employees').textContent = `Tổng số nhân viên: ${overview.total}`;

      // Phân bố nhân sự theo phòng ban
      const deptDist = document.getElementById('department-distribution');
      deptDist.innerHTML = '';
      data.department_distribution.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.department}: ${item.employee_count} nhân viên`;
        deptDist.appendChild(li);
      });

      // Bảng lương theo phòng ban
      const salaryBody = document.getElementById('salary-body');
      salaryBody.innerHTML = '';
      data.payroll_report.forEach(item => {
        const tr = document.createElement('tr');

        const deptTd = document.createElement('td');
        deptTd.textContent = item.department;

        const avgSalaryTd = document.createElement('td');
        const avgSalary = item.payroll_count > 0 ? item.total_salary / item.payroll_count : 0;
        avgSalaryTd.textContent = avgSalary.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        const totalSalaryTd = document.createElement('td');
        totalSalaryTd.textContent = item.total_salary.toLocaleString();

        tr.appendChild(deptTd);
        tr.appendChild(avgSalaryTd);
        tr.appendChild(totalSalaryTd);

        salaryBody.appendChild(tr);
      });

      // Vẽ biểu đồ thống kê theo thời gian
      const ctx = document.getElementById('timeChart').getContext('2d');

      const labels = data.monthly_report.map(item => item.month);
      const employeeCounts = data.monthly_report.map(item => item.employee_count);
      const totalSalaries = data.monthly_report.map(item => item.total_salary);

      window.timeChart?.destroy?.();

      window.timeChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Số nhân viên',
              data: employeeCounts,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              yAxisID: 'yEmployees',
            },
            {
              label: 'Tổng lương',
              data: totalSalaries,
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              yAxisID: 'ySalary',
            }
          ]
        },
        options: {
          scales: {
            yEmployees: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              title: {
                display: true,
                text: 'Số nhân viên'
              }
            },
            ySalary: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              grid: {
                drawOnChartArea: false,
              },
              title: {
                display: true,
                text: 'Tổng lương (VND)'
              }
            }
          }
        }
      });

    })
    .catch(err => {
      console.error('Fetch error:', err);
      alert('Không thể kết nối tới API báo cáo! ' + err.message);
    });



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
});
