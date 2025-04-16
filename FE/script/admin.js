document.addEventListener("DOMContentLoaded", function () {  
    const editBtns = document.querySelectorAll(".edit-btn");  
    const deleteBtns = document.querySelectorAll(".delete-btn"); // Thêm nút xóa  
    const accountModal = document.getElementById("accountModal");  
    const deleteAccountModal = document.getElementById("deleteAccountModal"); // Modal xác nhận xóa  
    const notificationModal = document.getElementById("notificationModal");  
    const overlay = document.getElementById("overlay");  
    const closeBtn = document.getElementById("closeBtn");  
    const okBtn = document.querySelector(".ok-btn");  
    const exitBtns = document.querySelectorAll(".exit-btn"); // Thay đổi để lấy tất cả các nút Exit  
    const confirmBtn = document.querySelector(".confirm-btn"); // Lấy nút xác nhận trong modal xóa  

    editBtns.forEach(button => {  
        button.addEventListener("click", function () {  
            accountModal.style.display = "block";  
            overlay.style.display = "block";  
        });  
    });  

    // Xử lý sự kiện cho nút Xóa  
    deleteBtns.forEach(button => {  
        button.addEventListener("click", function () {  
            deleteAccountModal.style.display = "block";  
            overlay.style.display = "block";  
        });  
    });  

    closeBtn.addEventListener("click", function () {  
        accountModal.style.display = "none";  
        overlay.style.display = "none";  
    });  

    overlay.addEventListener("click", function () {  
        accountModal.style.display = "none";  
        deleteAccountModal.style.display = "none"; // Đóng modal xác nhận xóa  
        notificationModal.style.display = "none";  
        overlay.style.display = "none";  
    });  

    okBtn.addEventListener("click", function () {  
        // Đóng modal thông tin và hiển thị thông báo  
        accountModal.style.display = "none";  
        notificationModal.style.display = "block";  
        overlay.style.display = "block"; // Mở overlay khi thông báo hiển thị  
    });  

    exitBtns.forEach(button => {  
        button.addEventListener("click", function () {  
            // Đóng modal thông báo  
            if (this.closest('#notificationModal')) {  
                notificationModal.style.display = "none";  
            }  
            if (this.closest('#deleteAccountModal')) {  
                deleteAccountModal.style.display = "none";  
            }  
            overlay.style.display = "none";  
        });  
    });  

    // Hàm xác nhận xóa tài khoản  
    confirmBtn.addEventListener("click", function () {  
        deleteAccount(); // Gọi hàm deleteAccount khi nhấn nút xác nhận  
    });  

    function deleteAccount() {  
        deleteAccountModal.style.display = 'none'; // Đóng modal xác nhận xóa  
        notificationModal.querySelector("p").textContent = "Account deleted successfully!"; // Thay đổi thông báo  
        notificationModal.style.display = 'block'; // Hiển thị modal thông báo  
        overlay.style.display = "block"; // Mở overlay khi thông báo hiển thị  
    }  
});  

document.addEventListener("DOMContentLoaded", function () {  
    // Lấy các modal  
    const accountModal = document.getElementById("accountModal"); // Modal thông tin tài khoản  
    const notificationModal = document.getElementById("notificationModal"); // Modal thông báo  
    const overlay = document.getElementById("overlay"); // Overlay nếu bạn có sử dụng  

    // Lấy các nút  
    const addAccountBtn = document.querySelector(".add-account"); // Nút thêm tài khoản  
    const closeBtn = document.getElementById("closeBtn"); // Nút thoát trong modal thêm tài khoản  
    const okBtn = document.querySelector(".ok-btn"); // Nút OK trong modal thêm tài khoản  
    const exitBtns = document.querySelectorAll(".exit-btn"); // Nút thoát trong modal thông báo  

    // Hiển thị modal thêm tài khoản khi nhấn nút "Add Account"  
    addAccountBtn.addEventListener("click", function () {  
        accountModal.style.display = "block"; // Mở modal thông tin tài khoản  
        overlay.style.display = "block"; // Mở overlay nếu cần  
    });  

    // Đóng modal thêm tài khoản  
    closeBtn.addEventListener("click", function () {  
        accountModal.style.display = "none"; // Đóng modal thông tin tài khoản  
        overlay.style.display = "none"; // Đóng overlay  
    });  

    // Xử lý sự kiện nút "OK" trong modal thêm tài khoản  
    okBtn.addEventListener("click", function () {  
        accountModal.style.display = "none"; // Đóng modal thông tin tài khoản  
        notificationModal.querySelector("p").textContent = "Added successfully!"; // Thay đổi nội dung thông báo  
        notificationModal.style.display = "block"; // Mở modal thông báo  
        overlay.style.display = "block"; // Mở overlay nếu cần  
    });  

    // Đóng modal thông báo  
    exitBtns.forEach(function(button) {  
        button.addEventListener("click", function () {  
            if (button.closest('#notificationModal')) {  
                notificationModal.style.display = "none"; // Đóng modal thông báo  
                overlay.style.display = "none"; // Đóng overlay  
            }  
        });  
    });  

    // Đóng tất cả các modal khi nhấp vào overlay  
    overlay.addEventListener("click", function () {  
        accountModal.style.display = "none"; // Đóng modal thông tin tài khoản  
        notificationModal.style.display = "none"; // Đóng modal thông báo  
        overlay.style.display = "none"; // Đóng overlay  
    });  
});  