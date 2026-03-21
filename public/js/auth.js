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
    document.getElementById("error").innerText = "Login incorrecto";
  } else {

    if (data.mustChangePassword){

      //localStorage.setItem("userId", data.userId);
      window.location.href ="change-password.html";

    } else {

      if (data.roles){
        if (data.roles.length ===1){
          //console.log(data.roles[0][0]);
          window.location.href=`${data.roles[0]}.html`;
        } else{
          window.location.href ="role-select.html";
        }
          //console.log(data.roles[0].length);
          //console.log(data.roles);
          //window.location.href ="role-select.html";
      }
      else{
          document.getElementById("error").innerText = "error";
      }

    }
  }
});

//logout
document.getElementById("")