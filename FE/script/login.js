document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/api/login", {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    console.log(data.role); 

    if (response.ok) {
        alert(data.message); 

        // Kiểm tra role và điều hướng
        if (data.role === 'Admin') {
            localStorage.setItem("admin", username);
            window.location.href = "admin.html";  // Điều hướng đến trang admin
        } else if (data.role === 'Employee') {
            window.location.href = "employee.html";  // Điều hướng đến trang nhân viên
            
        }

        else if (data.role === 'HR Management') {
            window.location.href = "hr.html";  // Điều hướng đến trang nhân viên
        }

        else if (data.role === 'Payroll Management') {
            window.location.href = "payroll.html";  // Điều hướng đến trang nhân viên
        }
        
        else {
            alert("Role không hợp lệ");
        }
    } else {
        alert(data.message); 
    }
});


function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");  // Lấy input mật khẩu
    const eyeIcon = document.getElementById("eye-icon");  // Lấy icon

    if (passwordInput.type === "password") {
        // Nếu mật khẩu đang bị ẩn, thì hiển thị mật khẩu
        passwordInput.type = "text";  // Đổi type của input thành "text"
        eyeIcon.src = "assets/img/icons8-hide-password-24.png"; // Chuyển icon thành mắt mở (hoặc giữ icon cố định nếu cần)
    } else {
        // Nếu mật khẩu đang được hiển thị, thì ẩn mật khẩu
        passwordInput.type = "password";  // Đổi type của input thành "password"
        eyeIcon.src = "assets/img/icons8-hide-password-24.png"; // Chuyển icon thành mắt đóng
    }
}