const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
const generateIdenticon = require("../utils/generateldenticon");
env.config();

const router = require("express").Router();

//prismaclientのインスタンス化
const prisma = new PrismaClient();

//新規ユーザー登録API
router.post("/register", async (req, res) => {
  //クライアントからのbodyを分割代入
  const { username, email, password } = req.body;

  //入力されたemailでデフォルト画像を作成する
  const defaultIconImage = generateIdenticon(email);

  //passwordをそのままDBnに保存するのは危ないためハッシュ化を行う
  //第二引数の10は裏側でランダムな値に置き換える時間のことを指定している
  const hashedPassword = await bcrypt.hash(password, 10);

  //SQLでいうINSERT文　modelがUserのものに追加！
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "はじめまして！",
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return res.json({ user });
});

//ユーザーログインAPI
router.post("/login", async (req, res) => {
  //クライアントからのbodyを分割代入
  const { email, password } = req.body;

  //同じメールアドレスが見つかればそのレコードの情報がuserに入る
  const user = await prisma.user.findUnique({ where: { email } });
  console.log(user);

  //もしデータベースに同じメールアドレスがなかったときの処理
  if (!user) {
    return res
      .status(401)
      .json({ error: "そのメールアドレスは登録されていません" });
  }

  //クライアントから渡ってきたパスワードとuserのパスワードを照合する
  const isPasswordVaild = await bcrypt.compare(password, user.password);
  if (!isPasswordVaild) {
    return res.status(401).json({ error: "パスワードが間違っています" });
  }

  //JWTを使ってトークンを発行する処理（今回はuserのidを暗号化している）
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1d", //保存期間1日
  });

  return res.json({ token });
});

module.exports = router;
