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

router.get("/profile/:userId", async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);

  try {
    //prisma.profile.findUnique()メソッドを使用して特定のプロフィール情報を取得
    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) }, //URLパラメーターのユーザを取得
      ////
      //include: { user: { ... } }を使用することで、prisma.profile.findUnique()メソッドで
      //取得したプロフィール情報に関連するユーザー（User）テーブルのデータにもアクセスできます
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
    //プロフィールが見つからなかった場合の処理
    if (!profile) {
      return res
        .status(404)
        .json({ message: "プロフィールが見つかりませんでした" });
    }

    //見つかった時の処理
    res.status(200).json(profile);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
