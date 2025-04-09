import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

import styles from "./AuthPage.module.css";

const AuthPage = () => {
  localStorage.setItem("isAuthenticated", "false");
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.page}>
      {/* Слой фона */}
      <div className={styles.background}></div>

      {/* Центрированный контейнер */}
      <div className={styles.authContainer}>
        <div className={styles.authWrapper}>
          {/* Левая часть */}
          <div className={styles.splitLeft}>
            <div className={styles.rocket}>🚀</div>
            <h2 className={styles.description}>Система резервного копирования для серверов</h2>
          </div>

          {/* Правая часть */}
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
              {isLogin ? <Login /> : <Register />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
