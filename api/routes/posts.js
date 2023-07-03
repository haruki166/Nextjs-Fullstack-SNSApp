const { PrismaClient } = require("@prisma/client");
const env = require("dotenv");
const isAuthenticated = require("../middlewares/isAuthenticated");
env.config();

const router = require("express").Router();

//prismaclientのインスタンス化
const prisma = new PrismaClient();

//つぶやき投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
  //クライアントからのbodyを分割代入
  const { content } = req.body;

  //content(投稿内容)がなかった時の処理
  if (!content) {
    return res.status(400).json({ message: "投稿内容がありません" });
  }

  try {
    //SQLでいうinsert文をPrismaで実行！
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      //includeオプションを使用して、作成された投稿に関連する作者（User）の情報を含めるように指定
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//最新つぶやき所得用API
router.get("/get_latest_post", async (req, res) => {
  try {
    //postテーブルからcreatedAtが新しいものから10件取得する処理
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      //author: trueを指定することで、各投稿に関連する作者（User）の情報を取得します。
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.json(latestPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

//表示したプロフィールページのユーザーの投稿のみを取得
router.get("/:userId", async (req, res) => {
  const  userId  = req.params.userId;

  try {
    const userPosts = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      orderBy: { createdAt: "desc" },
      include: {
        author:true,
      },
    });
    console.log(userPosts);
    return res.status(200).json(userPosts)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "サーバーエラーです" });
  }
  
});

module.exports = router;
