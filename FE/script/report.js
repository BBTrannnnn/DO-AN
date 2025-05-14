// Dữ liệu mẫu cho biểu đồ
    const ctx = document.getElementById('timeChart').getContext('2d');
    const timeChart = new Chart(ctx, {
        type: 'bar', // Loại biểu đồ: cột
        data: {
            labels: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6'], // Các tháng
            datasets: [{
                label: 'Số nhân sự',
                data: [120, 130, 140, 145, 150, 160], // Dữ liệu số nhân sự qua các tháng
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // Màu nền cột
                borderColor: 'rgba(54, 162, 235, 1)', // Màu viền cột
                borderWidth: 1
            },
            {
                label: 'Tổng quỹ lương (triệu VND)',
                data: [3000, 3200, 3400, 3500, 3600, 3800], // Dữ liệu tổng quỹ lương qua các tháng
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // Màu nền cột
                borderColor: 'rgba(255, 99, 132, 1)', // Màu viền cột
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });


    const routes = {
        'account': 'admin.html',
        'employee': 'employee.html',
        'payroll': 'payroll.html',
        'attendance': 'attendance.html',
        'department': 'department_jobtitle.html',
        'report': 'report.html',
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