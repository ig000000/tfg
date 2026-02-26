const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;
//npm run dev

const FileStore = require("session-file-store")(session);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(
  session({
    store: new FileStore({
       path: "./sessions" 
    }),
    secret: "super_secret_key",
    resave: false,
    saveUninitialized: false,
    rolling: true, // 🔥 IMPORTANTE
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      //secure: false // true SOLO en https
    }
  })
);
//const session = require("express-session");
//const FileStore = require("session-file-store")(session);

//app.use(session({
//  store: new FileStore({}),
//  secret: "super_secret_key",
//  resave: false,
//  saveUninitialized: false,
//  cookie: {
//    httpOnly: true,
//    sameSite: "lax"
//  }
//}));

// Rutas
app.use("/", require("./routes/index"));
app.use("/api", require("./routes/api"));
app.use("/api/articles", require("./routes/articles"));
app.use("/api/articles",  require("./routes/comments"));
app.use("/auth", require("./routes/auth"));
app.use("/api/ideas", require("./routes/ideas"));
app.use("/users", require("./routes/users"));
app.use("/content", require("./routes/content"));
app.use("/settings", require("./routes/settings"));


// Servidor
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
