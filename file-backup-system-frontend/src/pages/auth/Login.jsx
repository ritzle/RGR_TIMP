import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Введите e-mail";
    }
    if (!password.trim()) {
      newErrors.password = "Введите пароль";
    }

    setErrors(newErrors);
    setServerError("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("isAuthenticated", "true");


        localStorage.setItem("user", JSON.stringify({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email
        }));

        navigate("/home");
      } else {
        const message = data.message?.toLowerCase();

        if (message.includes("почта") || message.includes("пользователь")) {
          setEmail("");
          setPassword("");
          setErrors({ email: true, password: true });
          setServerError("Пользователь не найден или почта не подтверждена");
        } else if (message.includes("пароль")) {
          setPassword("");
          setErrors({ password: true });
          setServerError("Неверный пароль");
        } else {
          setServerError("Ошибка входа");
        }
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
      setServerError("Сервер недоступен");
    }
  };

  return (
    <div className={styles.authForm}>
      <input
        placeholder="E-mail"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
        }}
        className={`${styles.input} ${errors.email ? styles.error : ""}`}
      />
      {errors.email && (
        <div className={styles.errorMessage}>
          {typeof errors.email === "string" ? errors.email : "Некорректный e-mail"}
        </div>
      )}

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
        }}
        className={`${styles.input} ${errors.password ? styles.error : ""}`}
      />
      {errors.password && (
        <div className={styles.errorMessage}>
          {typeof errors.password === "string" ? errors.password : "Введите пароль"}
        </div>
      )}

      {serverError && !errors.email && !errors.password && (
        <div className={styles.errorMessage}>{serverError}</div>
      )}

      <button className={styles.button} onClick={handleLogin}>Sign In</button>
    </div>
  );
}

export default Login;
