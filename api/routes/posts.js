const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const env = require("dotenv");
env.config();

const router = require("express").Router();

//prismaclientのインスタンス化
const prisma = new PrismaClient();

//つぶやき投稿用API
router.post("/post", async (req, res) => {
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
        authorId: 1,
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
    });
    return res.json(latestPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "サーバーエラーです" });
  }
});

module.exports = router;
