// --- CAPTCHA setup ---
const captchaCanvas = document.getElementById('captchaCanvas');
const refreshBtn = document.getElementById('refreshCaptcha');
const ctx = captchaCanvas.getContext('2d');

let generatedCaptcha = '';

function generateCaptcha(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < length; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
}

function drawCaptcha(text) {
    ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, captchaCanvas.width, captchaCanvas.height);

    ctx.font = '28px Arial';
    ctx.fillStyle = '#333';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(text, captchaCanvas.width / 2, captchaCanvas.height / 2);

    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = '#ccc';
        ctx.beginPath();
        ctx.moveTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
        ctx.lineTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
        ctx.stroke();
    }
}

function refreshCaptcha() {
    generatedCaptcha = generateCaptcha();
    drawCaptcha(generatedCaptcha);
}

refreshBtn.addEventListener('click', refreshCaptcha);
captchaCanvas.addEventListener('click', refreshCaptcha);

refreshCaptcha(); // tạo captcha đầu tiên

// --- Xử lý submit form ---
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const enteredCaptcha = document.getElementById("captchaInput").value.trim();

    // Kiểm tra captcha trước khi gửi API
    if (enteredCaptcha.toLowerCase() !== generatedCaptcha.toLowerCase()) {
        alert("Mã xác nhận không đúng. Vui lòng thử lại.");
        refreshCaptcha();
        return;
    }

    // Gửi API login
    const response = await fetch("http://localhost:5000/api/login/mysql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    console.log(data.role);

    if (response.ok) {
        alert(data.message);

        const token = data.token;  // Lấy token từ phản hồi
        localStorage.setItem("token", token);

        // Kiểm tra role và điều hướng
        if (data.role === 'Admin') {
            localStorage.setItem("admin", username);
            window.location.href = "admin.html";  // Điều hướng đến trang admin
        } else if (data.role.toLowerCase() === 'employee') {
            window.location.href = "employee.html";  // Điều hướng đến trang nhân viên
        } else if (data.role.toLowerCase() === 'hr management') {
            window.location.href = "employee.html";  // Điều hướng đến trang HR Management
        } else if (data.role.toLowerCase() === 'payroll management') {
            window.location.href = "payroll.html";  // Điều hướng đến trang Payroll Management
        } else {
            alert("Role không hợp lệ");
        }
    } else {
        alert(data.message);
    }

    console.log(data.role);
});

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeIcon.src = "assets/img/icons8-hide-password-24.png";
    } else {
        passwordInput.type = "password";
        eyeIcon.src = "assets/img/icons8-hide-password-24.png";
    }
}
