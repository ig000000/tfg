//Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json"},
    credentials: "include",
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!data.success) {
    document.getElementById("error").innerText = translations[currentLang].errorLogin;
  } else {

    if (data.mustChangePassword){
      window.location.href ="change-password.html";
    } else {
      if (data.roles){
        if (data.roles.length === 1){
          window.location.href=`${data.roles[0]}.html`;
        } else{
          window.location.href ="role-select.html";
        }
      }
      else{
          document.getElementById("error").innerText = "error";
      }

    }
  }
});