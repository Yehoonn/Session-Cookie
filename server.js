const express = require("express");
const session = require("express-session");
const app = express();
const port = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");
const { MemoryStore } = require("express-session");

const sessionData = {};

let dummyData = [
  {
    id: "yehoon",
    password: "yehoon123",
  },
  { id: "haha", password: "haha123" },
];

app.use(cookieParser("strong"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "strong",
    store: new MemoryStore(),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 10,
    },
  })
);

app.listen(port, () => {
  console.log(`Express Server On : ${port}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/login", (req, res) => {
  let id = req.body.id;
  let password = req.body.password;

  for (let value of dummyData) {
    if (value.id === id && value.password === password) {
      req.session.save();
      sessionData[req.sessionID] = { id, password };

      res
        .setHeader("Set-Cookie", `${req.sessionID}=${req.sessionID}; path=/`)
        .cookie("connect_id", `${req.sessionID}`, { maxAge: 5000 })
        .send(
          `<h1>로그인 완료</h1><h2>암호화된 쿠키는 ${req.sessionID}입니다</h2><a href="/">돌아가기</a>`
        );
    }
  }
});

app.get("/profile", (req, res) => {
  if (req.headers.cookie) {
    const [, privateKey] = req.headers.cookie.split("=");
    res.send(
      `<h1>${sessionData[privateKey].id}님 환영합니다</h1><h2>고객님의 암호화된 쿠키는 ${privateKey}입니다</h2><a href='/'>돌아가기</a><br><a href='/profile/logout'>로그아웃하기</a>`
    );
  } else {
    res.redirect("/");
  }
});

app.get("/profile/logout", (req, res) => {
  if (req.headers.cookie) {
    const [, privateKey] = req.headers.cookie.split("=");
    delete session[privateKey];
    // res.setHeader("Set-Cookie", "connect.id=delete; Max-age=0; path=/");
    res.clearCookie(privateKey);
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});
