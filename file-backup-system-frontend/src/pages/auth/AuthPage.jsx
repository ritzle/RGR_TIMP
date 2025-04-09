import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

import pageStyles from "../../styles/AuthPage.module.css";
import leftStyles from "../../styles/LeftPanel.module.css";
import rightStyles from "../../styles/RightPanel.module.css";

const AuthPage = () => {

  localStorage.setItem("isAuthenticated", "false");

  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={pageStyles.page}>
      {/* Слой фона */}
      <div className={pageStyles.background}></div>

      {/* Центрированный контейнер */}
      <div className={pageStyles.authContainer}>
        <div className={pageStyles.authWrapper}>
          {/* Левая часть */}
          <div className={leftStyles.splitLeft}>
            <div className={leftStyles.rocket}>🚀</div>
            <h2 className={leftStyles.description}>File backup system</h2>
          </div>

          {/* Правая часть */}
          <div className={rightStyles.splitRight}>
            <div className={rightStyles.formSwitch}>
              <span
                className={isLogin ? rightStyles.active : ""}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </span>
              <span
                className={!isLogin ? rightStyles.active : ""}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </span>
            </div>

            <div className={rightStyles.formContainer}>
              {isLogin ? <Login /> : <Register />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
