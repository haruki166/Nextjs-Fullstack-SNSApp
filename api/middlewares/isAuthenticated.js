const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  //トークン取得
  //apiClient.defaults.headers["Authorization"] = `Bearer ${token}`の${token}の部分を取得している
  const token = req.headers.authorization?.split(" ")[1];

  // console.log(token);
  //トークンがなかったらエラー
  if (!token) {
    return res.status(401).json({ message: "権限がありません" });
  }


  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "権限がありません" });
    }
    
    req.userId = decoded.id;


    next();

  });
}

module.exports = isAuthenticated;