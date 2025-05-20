// report.js

document.addEventListener('DOMContentLoaded', () => {
  fetch('http://127.0.0.1:5000/api/report')
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok: ' + res.status + ' ' + res.statusText);
      }
      return res.json();
    })
    .then(data => {
      console.log('API data:', data);  // Kiểm tra dữ liệu lấy được

      if (data.error) {
        console.error('API error:', data.error);
        alert('Lỗi khi lấy dữ liệu báo cáo: ' + data.error);
        return;
      }

      // Hiển thị tổng quan nhân sự
      const overview = data.employee_overview;
      document.getElementById('total-employees').textContent = `Tổng số nhân viên: ${overview.total}`;

      // Phân bố nhân sự theo phòng ban
      const deptDist = document.getElementById('department-distribution');
      deptDist.innerHTML = '';
      data.payroll_report.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.department}: ${item.payroll_count} nhân viên, Tổng lương: ${item.total_salary.toLocaleString()} VND`;
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
        avgSalaryTd.textContent = avgSalary.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0});
        const totalSalaryTd = document.createElement('td');
        totalSalaryTd.textContent = item.total_salary.toLocaleString();

        tr.appendChild(deptTd);
        tr.appendChild(avgSalaryTd);
        tr.appendChild(totalSalaryTd);
        salaryBody.appendChild(tr);
      });

      // Vẽ biểu đồ thống kê theo thời gian
      const ctx = document.getElementById('timeChart').getContext('2d');

      // Khai báo các biến labels, employeeCounts, totalSalaries trước khi dùng
      const labels = data.monthly_report.map(item => item.month);
      const employeeCounts = data.monthly_report.map(item => item.employee_count);
      const totalSalaries = data.monthly_report.map(item => item.total_salary);

      // Gỡ bỏ chart cũ nếu có
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
