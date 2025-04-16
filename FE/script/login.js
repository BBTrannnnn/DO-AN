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

function goToRegisterPage() {
    window.location.href = "signup.html";  // Đường dẫn đến trang đăng ký
}
