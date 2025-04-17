import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import styles from "./AuthPage.module.css";

const AuthPage = () => {
  localStorage.setItem("isAuthenticated", "false");
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleSuccessfulRegister = (email, password) => {
    setLoginData({ email, password });
    setIsLogin(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}></div>

      <div className={styles.authContainer}>
        <div className={styles.authWrapper}>
          <div className={styles.splitLeft}>
            <div className={styles.rocket}>🚀</div>
            <h2 className={styles.description}>Система резервного копирования для серверов</h2>
          </div>

          <div className={styles.splitRight}>
            <div className={styles.formSwitch}>
              <span
                className={isLogin ? styles.active : ""}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </span>
              <span
                className={!isLogin ? styles.active : ""}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </span>
            </div>

            <div className={styles.formContainer}>
              {isLogin ? (
                <Login initialEmail={loginData.email} initialPassword={loginData.password} />
              ) : (
                <Register onSuccess={handleSuccessfulRegister} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;