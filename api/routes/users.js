const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = require("express").Router();

//prismaclientのインスタンス化
const prisma = new PrismaClient();

router.get("/find", isAuthenticated, async (req, res) => {
  try {
    //今ログインしているユーザーのIDがDBにあるか探す
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    //もしそのユーザーがなかったらエラー
    if (!user) {
      res.status(404).json({ error: "ユーザーが見つかりませんでした。" });
    }

    //ユーザーが見つかればクライアントにデータを返す
    res.status(200).json({
      user: { id: user.id, emial: user.email, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
