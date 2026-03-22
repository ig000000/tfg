async function changePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const repeatPassword = document.getElementById("repeatPassword").value;
  //const userId = localStorage.getItem("userId");

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

  console.log(data);
  //console.log(session);

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

  //window.location.href = "/dashboard.html";
}