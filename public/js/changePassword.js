async function changePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const repeatPassword = document.getElementById("repeatPassword").value;

  if (newPassword !== repeatPassword) {
    document.getElementById("msg").innerText = translations[currentLang].noSamePasswd;
    
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
    console.log(data.errmsg);
    let docMsg = document.getElementById("msg");
    switch (data.errmsg){
      case 1:
        docMsg.innerText = translations[currentLang].noUserfound;
        break;
      case 2:
        docMsg.innerText = translations[currentLang].passRequir;
        break;
      case 3:
        docMsg.innerText = translations[currentLang].updatesPswd;
        break;
      default:
        docMsg.innerText = translations[currentLang].error
    }
    /*
    if (data.errmsg = 2){
      document.getElementById("msg").innerText = translations[currentLang].passRequir;
    }
    else if (data.errmsg = 1){

    }
    else{
      document.getElementById("msg").innerText = data.message;
    }*/
  }
}