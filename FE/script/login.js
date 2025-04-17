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

    console.log(data); 

    if (response.ok) {
        alert(data.message); 
        window.location.href = "admin.html"; 
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