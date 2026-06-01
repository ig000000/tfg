  async function loadimg() {
    const res = await fetch("/settings");
    const settings = await res.json();

    document.getElementById("favicon").href = settings.favicon;
   }
   loadimg();