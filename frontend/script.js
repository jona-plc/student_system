document.addEventListener("DOMContentLoaded", function () {
    
    document.getElementById("show-signup")?.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("login-container").style.display = "none";
        document.getElementById("signup-container").style.display = "block";
    });

    document.getElementById("show-login")?.addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("signup-container").style.display = "none";
        document.getElementById("login-container").style.display = "block";
    });
});

    // Student Login
    const studentLoginForm = document.querySelector('form[action="/student-login"]');
    if (studentLoginForm) {
        studentLoginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const username = studentLoginForm.querySelector('input[name="username"]').value;
            const password = studentLoginForm.querySelector('input[name="password"]').value;

            fetch("/student-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            })
                .then((response) => response.json())
                .then((data) => {
                    document.getElementById("login-message").textContent = data.message;

                    if (data.success) {
                        window.location.href = "/student-dashboard"; rd
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    document.getElementById("login-message").textContent = "An error occurred.";
                });
        });
    }

    // Student Signup
    const signupForm = document.getElementById("signup-form");
    const registerMessage = document.getElementById("register-message");

    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData(signupForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            registerMessage.textContent = "Processing...";
            registerMessage.style.color = "orange";

            fetch("/student-signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
                .then((response) => response.json())
                .then((data) => {
                    registerMessage.textContent = data.message;
                    registerMessage.style.color = data.success ? "green" : "red";

                    if (data.success) {
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 2000); 
                    }
                })
                .catch((error) => {
                    registerMessage.textContent = "An error occurred. Please try again.";
                    registerMessage.style.color = "red";
                    console.error("Error:", error);
                });
        });
    }
    if (document.getElementById("student-form")) {
        document.getElementById("student-form").addEventListener("submit", function(event) {
            event.preventDefault();  
    
            const formData = new FormData(event.target);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
    
            fetch("/submit-student", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("success-modal").style.display = "flex";
                } else {
                    alert(data.message);  
                }
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                alert('An error occurred while submitting the form.');
            });
        });
    
        
        document.getElementById("ok-success").addEventListener("click", function() {
          
            document.getElementById("success-modal").style.display = "none";
    
            document.getElementById("student-form").reset();
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
        const userMenuIcon = document.getElementById("user-menu-icon");
        const menuContainer = document.getElementById("menu-container");

        userMenuIcon.addEventListener("click", () => {
            menuContainer.style.display = menuContainer.style.display === "block" ? "none" : "block";
        });
    });

 // Admin Login 
const adminLoginForm = document.querySelector('form[action="/admin-login"]');
const loginMessage = document.getElementById("admin-login-message"); 

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", function (e) {
        e.preventDefault();  

        const username = adminLoginForm.querySelector('input[name="username"]').value;
        const password = adminLoginForm.querySelector('input[name="password"]').value;

        fetch("/admin-login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        })
            .then((response) => response.json())
            .then((data) => {
              
                loginMessage.textContent = data.message; 

                if (data.success) {
                  
                    window.location.href = "/admin-dashboard"; 
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                loginMessage.textContent = "An error occurred. Please try again."; 
            });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const homeLink = document.getElementById("home-link");
    if (homeLink) {
        homeLink.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "/admin-dashboard";
        });
    } else {
        console.error("home-link element is not found!");
    }
});


window.onload = function () {
    if (window.location.pathname === '/admin-dashboard') {
        fetchDashboardData(); 
    }
};


function fetchDashboardData() {
    const totalRegisteredElement = document.getElementById("totalRegistered");
    const totalRecordsElement = document.getElementById("totalRecords");

    let totalRegistered = 0;
    let totalRecords = 0;
  
    fetch("/total-registered")
    .then((response) => response.json())
    .then((data) => {
        console.log("Total Registered:", data);
        if (data.success) {
            totalRegistered = data.totalRegistered;
            totalRegisteredElement.textContent = totalRegistered;
            updateChart();
        } else {
            totalRegisteredElement.textContent = "Error fetching total registered.";
        }
    })
    .catch((error) => {
        console.error("Error fetching total registered:", error);
        totalRegisteredElement.textContent = "Error fetching total registered.";
    });

        fetch("/total-dashboard-records")
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    totalRecords = data.totalRecords;
                    totalRecordsElement.textContent = totalRecords;
                    updateChart();
                } else {
                    totalRecordsElement.textContent = "Error fetching total records.";
                }
            })
            .catch((error) => {
                console.error("Error fetching total records:", error);
                totalRecordsElement.textContent = "Error fetching total records.";
            });

            fetch("/get-student-data")
    .then(response => response.json())
    .then(data => {
        console.log("Student Data:", data);
        if (Array.isArray(data) && data.length > 0) {
            students = data;
            renderTable();
        } else {
            students = [];
            renderTable();
        }
    })
    .catch(error => {
        console.error("Error fetching student data:", error);
        students = [];
        renderTable();
    });


function renderTable() {
    const tableBody = document.querySelector("#data-table tbody");
    tableBody.innerHTML = ""; 

    students.forEach(student => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${student.full_name}</td>
            <td>${student.gender}</td>
            <td>${student.email}</td>
            <td>${student.student_id}</td>
            <td>${student.classes}</td>
            <td>
                <button class="edit-btn" data-id="${student.id}">Edit</button>
                <button class="delete-btn" data-id="${student.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDelete);
    });
}

function handleEdit(event) {
    const studentId = event.target.dataset.id;
    const student = students.find(s => s.id == studentId);
    
    document.getElementById("edit-id").value = student.id;
    document.getElementById("edit-full-name").value = student.full_name;
    document.getElementById("edit-gender").value = student.gender;
    document.getElementById("edit-email").value = student.email;
    document.getElementById("edit-classes").value = student.classes;
    document.getElementById("edit-modal").style.display = "flex";
}

document.getElementById("edit-form").addEventListener("submit", function(event) {
    event.preventDefault(); 

    const id = document.getElementById("edit-id").value;
    const fullName = document.getElementById("edit-full-name").value;
    const gender = document.getElementById("edit-gender").value;
    const email = document.getElementById("edit-email").value;
    const classes = document.getElementById("edit-classes").value;

    fetch('/update-student', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            full_name: fullName,
            gender: gender,
            email: email,
            classes: classes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById("edit-modal").style.display = "none";
            document.getElementById("success-modal").style.display = "flex";
            
            setTimeout(() => {
                window.location.reload(); 
            }, 1000);  
        } else {
            alert("Failed to update student information.");
        }
    })
    .catch(error => {
        console.error("Error updating student information:", error);
    });
});

document.getElementById("cancel-edit")?.addEventListener("click", function () {
    document.getElementById("edit-modal").style.display = "none";
});

let studentIdToDelete = null;

function handleDelete(event) {
    studentIdToDelete = event.target.dataset.id;
    
    document.getElementById("delete-modal").style.display = "block";
}

document.getElementById("confirm-delete").addEventListener('click', function() {
    if (studentIdToDelete) {
        fetch("/delete-student", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: studentIdToDelete })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("delete-modal").style.display = "none";
                document.getElementById("delete-success-modal").style.display = "block";

               
                setTimeout(() => {
                    window.location.reload(); 
                }, 1000); 
            } else {
                alert("Failed to delete record");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("There was an error deleting the record.");
        });
    }
});

document.getElementById("cancel-delete").addEventListener('click', function() {
    document.getElementById("delete-modal").style.display = "none";
});

document.getElementById("ok-delete-success").addEventListener('click', function() {
    document.getElementById("delete-success-modal").style.display = "none";
});


        function updateChart() {
            if (totalRegistered > 0 && totalRecords > 0) {
                const ctx = document.getElementById('statsChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar', 
                    data: {
                        labels: ['Total Registered', 'Total Records'],
                        datasets: [{
                            label: 'Student Statistics',
                            data: [totalRegistered, totalRecords],
                            backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                            borderWidth: 1,
                        }],
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    },
                });
            }
        }

        document.querySelector('.search-bar input').addEventListener('input', function () {
            const searchQuery = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('#data-table tbody tr');

            tableRows.forEach(row => {
                const studentName = row.cells[0].textContent.toLowerCase(); 
                if (studentName.includes(searchQuery)) {
                    row.style.display = ''; 
                } else {
                    row.style.display = 'none'; 
                }
            });
        });
    }

function renderTable(students) {
    const tableBody = document.getElementById("student-table-body");
    tableBody.innerHTML = ""; 

    students.forEach(student => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.full_name}</td>
            <td>${student.email}</td>
            <td>${student.username}</td>
        `;

        tableBody.appendChild(row);
    });
}

function handleSearch() {
    const query = document.getElementById("search-input").value.toLowerCase();
    
    fetch(`/search-students?query=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderTable(data.students); 
            } else {
                alert("No results found");
            }
        })
        .catch(error => {
            console.error('Error searching students:', error);
            alert('An error occurred while searching.');
        });
}

document.getElementById("search-button").addEventListener("click", handleSearch);
document.getElementById("search-input").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});  
function toggleMenu() {
    var menu = document.getElementById("slidingMenu");
    var body = document.body;
    menu.classList.toggle("open");
    body.classList.toggle("dimmed");
}