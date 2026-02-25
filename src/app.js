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

//Prueba Luego borrar
app.use((req, res, next) => {
  console.log("SESSION ID:", req.sessionID);
  console.log("SESSION USER:", req.session.user);
  next();
});

//cors
//const cors = require("cors");

//app.use(cors({
//  origin: "http://localhost:3000", // o tu frontend
//  credentials: true
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


// Servidor
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
