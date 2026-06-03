async function changePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const repeatPassword = document.getElementById("repeatPassword").value;

  if (newPassword !== repeatPassword) {
    document.getElementById("msg").innerText = "Las contraseñas no coinciden";
    return;
  }

  const res = await fetch("users/change-password-first", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      //userId,
      newPassword
    })
  });

  const data = await res.json();

  if (data.roles){
    if (data.roles.length ===1){
         window.location.href=`${data.roles[0]}.html`;
    } else{
        window.location.href ="role-select.html";
    }
  }
  else{
    document.getElementById("msg").innerText = data.message;
  }
}