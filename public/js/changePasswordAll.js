async function changePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const repeatPassword = document.getElementById("repeatPassword").value;

  if (newPassword !== repeatPassword) {
    document.getElementById("msg").innerText = "Las contraseñas no coinciden";
    return;
  }

  const res = await fetch("/users/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      currentPassword,
      newPassword
    })
  });

  const data = await res.json();

  document.getElementById("msg").innerText = data.message;
  alert(data.message);
  
  if (data.activeRole){
    window.location.href=`${data.activeRole}.html`;
  }
}