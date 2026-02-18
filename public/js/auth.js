//document.getElementById("loginForm").addEventListener("submit", async (e) => {
//  e.preventDefault();

//  const username = document.getElementById("username").value;
//  const password = document.getElementById("password").value;

//  const res = await fetch("/auth/login", {
//    method: "POST",
//    headers: { "Content-Type": "application/json"},
//    body: JSON.stringify({ username, password })
//  });

//  const data = await res.json();

//  if (!data.success) {
//    document.getElementById("error").innerText = "Login incorrecto";
//  } else {
//    window.location.href = "teacher.html";
//  }
//});

//Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!data.success) {
    document.getElementById("error").innerText = "Login incorrecto";
  } else {
    if (data.role === "teacher") {
        window.location.href = "teacher.html";
    } else if (data.role === "admin") {
        window.location.href = "admin.html";
    }
  }
});

//logout
document.getElementById("")