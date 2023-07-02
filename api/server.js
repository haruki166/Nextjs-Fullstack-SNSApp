const express = require("express");
const app = express();
const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");
const usersRoute = require("./routes/users");
const cors = require("cors");

//ポート番号設定
const PORT = 5050;

//jsonを受け取れるようにミドルウェア設定
app.use(express.json());

//CORSを許可する
app.use(cors());

//各APIのRoute設定
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/users", usersRoute);

//サーバー起動
app.listen(PORT, () => {
  console.log(`Server start🏃‍♂️:${PORT}Port`);
});
