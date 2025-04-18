document.addEventListener("DOMContentLoaded", function () {
    const editBtns = document.querySelectorAll(".edit-btn");
    const deleteBtns = document.querySelectorAll(".delete-btn");
    const accountModal = document.getElementById("accountModal");
    const deleteAccountModal = document.getElementById("deleteAccountModal");
    const notificationModal = document.getElementById("notificationModal");
    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("closeBtn");
    const okBtn = document.querySelector(".ok-btn");
    const exitBtns = document.querySelectorAll(".exit-btn");
    const confirmBtn = document.querySelector(".confirm-btn");
    const addAccountBtn = document.querySelector(".add-account");
    const searchInput = document.getElementById("searchInput"); 

    

    let selectedUser = null;
    let allUsers = [];

    // Load danh sách account từ Flask
    async function loadAccounts() {
        const res = await fetch("http://localhost:5000/api/get_users", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
         
        });
        const users = await res.json();

        allUsers = users;
        renderAccounts(users);
    }
    function renderAccounts(users) {
        const tableBody = document.querySelector(".account-table tbody");
        tableBody.innerHTML = "";
        
        users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.password}</td>
                <td>${user.role}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        document.querySelectorAll(".edit-btn").forEach((btn, index) => {
            btn.addEventListener("click", function () {
                const user = users[index];
                selectedUser = user.username;
                document.getElementById("userInput").value = user.username;
                document.getElementById("passwordInput").value = user.password;
                document.getElementById("departmentSelect").value = user.role;
                accountModal.style.display = "block";
                overlay.style.display = "block";
            });
        });
    
        document.querySelectorAll(".delete-btn").forEach((btn, index) => {
            btn.addEventListener("click", function () {
                selectedUser = users[index].username;
                deleteAccountModal.style.display = "block";
                overlay.style.display = "block";
            });
        });
    }
    

    // Thêm tài khoản
    async function addAccount() {
        const username = document.getElementById("userInput").value;  
        const password = document.getElementById("passwordInput").value;
        const role = document.getElementById("departmentSelect").value || "Employee";  // Mặc định là "Employee"

        const res = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role })  
        });

        if (res.ok) {
            showNotification("Added successfully!");
            loadAccounts();
        } else {
            showNotification("Failed to add account.");
        }
    }

    // Cập nhật tài khoản
    async function updateAccount() {
        const password = document.getElementById("passwordInput").value;
        const role = document.getElementById("departmentSelect").value;

        const res = await fetch("http://localhost:5000/api/update", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: selectedUser, password, role })
        });

        if (res.ok) {
            showNotification("Updated successfully!");
            loadAccounts();
        } else {
            showNotification("Failed to update.");
        }
    }

    // Xóa tài khoản
    async function deleteAccount() {
        deleteAccountModal.style.display = "none";
        const res = await fetch("http://localhost:5000/api/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: selectedUser })
        });

        if (res.ok) {
            showNotification("Deleted successfully!");
            loadAccounts();
        } else {
            showNotification("Delete failed.");
        }
    }

    function showNotification(message) {
        notificationModal.querySelector("p").textContent = message;
        notificationModal.style.display = "block";
        overlay.style.display = "block";
        accountModal.style.display = "none";
    }
    
    // Sự kiện nút Add Account
    addAccountBtn.addEventListener("click", function () {
        selectedUser = null;
        document.getElementById("userInput").value = "";
        document.getElementById("passwordInput").value = "";
        document.getElementById("departmentSelect").value = "Employee"; // Mặc định là "employee"
        accountModal.style.display = "block";
        overlay.style.display = "block";
    });

    // Sự kiện nút OK trong form
    okBtn.addEventListener("click", function () {
        const username = document.getElementById("userInput").value;
        const password = document.getElementById("passwordInput").value;
        const role = document.getElementById("departmentSelect").value || "employee"; // Mặc định là "employee"
    
        if (selectedUser) {
            updateAccount(); // Cập nhật tài khoản
        } else {
            addAccount(username, password, role); // Thêm tài khoản mới
        }
    });

    closeBtn.addEventListener("click", () => {
        accountModal.style.display = "none";
        overlay.style.display = "none";
    });

    confirmBtn.addEventListener("click", deleteAccount);

    exitBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            if (this.closest('#notificationModal')) {
                notificationModal.style.display = "none";
            }
            if (this.closest('#deleteAccountModal')) {
                deleteAccountModal.style.display = "none";
            }
            overlay.style.display = "none";
        });
    });

    overlay.addEventListener("click", function () {
        accountModal.style.display = "none";
        deleteAccountModal.style.display = "none";
        notificationModal.style.display = "none";
        overlay.style.display = "none";
    });

    // Tìm kiếm tài khoản
    searchInput.addEventListener("input", function () {
        const keyword = searchInput.value.toLowerCase();
        const filtered = allUsers.filter(user =>
            user.username.toLowerCase().includes(keyword) ||
            user.password.toLowerCase().includes(keyword) ||
            user.role.toLowerCase().includes(keyword)
        );
        renderAccounts(filtered);
    });


    // Tải dữ liệu ban đầu
    loadAccounts();
});