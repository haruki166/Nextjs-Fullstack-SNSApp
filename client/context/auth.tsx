import apiClient from "@/lib/apiClient";
import React, { ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: null | {
    id: number;
    email: string;
    username: string;
  };
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  //今ログインしているユーザーのデータを保持するstate
  const [user, setUser] = useState<null | {
    id: number;
    email: string;
    username: string;
  }>(null);

  //リロードするたびに発火する処理
  //取得したキーをAPIのheaderにつける（こっちはクライアントの処理のためuseEffect可能）
  useEffect(() => {
    //ローカルストレージに保存したトークンのキーを取得する
    const token = localStorage.getItem("auth_token");
    if (token) {
      //APIクライアントのデフォルトのヘッダーにAuthorizationヘッダーを追加するための処理
      apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;

      apiClient
        .get("/users/find")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("auth_token", token);
    apiClient.defaults.headers["Authorization"] = `Bearer ${token}`;

    try {
      apiClient
        .get("/users/find")
        .then((res) => {
          setUser(res.data.user);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    //ローカルストレージのtokenキーの値を削除
    localStorage.removeItem("auth_token");

    //APIクライアントのデフォルトのヘッダーに追加したAuthorizationヘッダーを削除するための処理
    delete apiClient.defaults.headers["Authorication"];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
