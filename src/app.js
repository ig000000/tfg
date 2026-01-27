const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;
//npm run dev

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  session({
    secret: "super_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

// Rutas
app.use("/", require("./routes/index"));
app.use("/api", require("./routes/api"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/articles",  require("./routes/comments"));
app.use("/auth", require("./routes/auth"));

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
