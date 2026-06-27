async function changePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const repeatPassword = document.getElementById("repeatPassword").value;

  if (newPassword !== repeatPassword) {
    document.getElementById("msg").innerText = translations[currentLang].noSamePasswd;
    return;
  }

  const res = await fetch("/users/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
      repeatPassword
    })
  });

  const data = await res.json();

  //document.getElementById("msg").innerText = data.message;
  let docMsg = document.getElementById("msg");
    switch (data.errmsg){
      case 1:
        docMsg.innerText = translations[currentLang].noUserfound;
         alert(translations[currentLang].noUserfound);
        break;
      case 2:
        docMsg.innerText = translations[currentLang].noRepeatPasswd;
         alert(translations[currentLang].noRepeatPasswd);
        break;
      case 3:
        docMsg.innerText = translations[currentLang].fillPaswd;
        alert(translations[currentLang].fillPaswd);
        break;
      case 4:
        docMsg.innerText = translations[currentLang].passRequir;
        alert(translations[currentLang].passRequir);
        break;
      case 5:
        docMsg.innerText = translations[currentLang].passChanged;
        alert(translations[currentLang].passChanged);
        break;
      default:
        docMsg.innerText = translations[currentLang].error
    }
  
  if (data.activeRole){
    window.location.href=`${data.activeRole}.html`;
  }
}