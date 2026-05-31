async function loadRoleSwitcher() {
  const res = await fetch("/auth/check");
  const data = await res.json();

  const select = document.getElementById("roleSwitcher");

  data.roles.forEach(role => {
    const opt = document.createElement("option");
    opt.value = role;
    opt.textContent = role;
    select.appendChild(opt);
  });

  select.value = data.activeRole;

  select.addEventListener("change", async () => {
    await fetch("/auth/set-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: select.value })
    });

    window.location.href = `${select.value}.html`;
  });
}

loadRoleSwitcher();