import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login({ initialEmail = "", initialPassword = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(initialEmail);
    setPassword(initialPassword);
  }, [initialEmail, initialPassword]);

  const sanitizeInput = (input) => {
    return input.replace(/[<>'"\\;]/g, '');
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Введите e-mail";
    } else if (!validateEmail(email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!password.trim()) {
      newErrors.password = "Введите пароль";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Должна быть хотя бы одна заглавная буква";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Должна быть хотя бы одна цифра";
    }

    setErrors(newErrors);
    setServerError("");

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: sanitizedEmail, 
          password: sanitizedPassword 
        }),
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
          setServerError("Пользователь не найден");
          setErrors({});
        } else if (message.includes("пароль")) {
          setServerError("Неверный пароль");
          setErrors({ password: true });
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
          const sanitizedValue = sanitizeInput(e.target.value);
          setEmail(sanitizedValue);
          if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
          setServerError("");
        }}
        maxLength={100}
        className={`${styles.input} ${errors.email ? styles.error : ""}`}
      />
      {errors.email && (
        <div className={styles.errorMessage}>{errors.email}</div>
      )}

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => {
          const sanitizedValue = sanitizeInput(e.target.value);
          setPassword(sanitizedValue);
          if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
          setServerError("");
        }}
        maxLength={50}
        className={`${styles.input} ${errors.password ? styles.error : ""}`}
      />
      {errors.password && (
        <div className={styles.errorMessage}>{errors.password}</div>
      )}

      {serverError && (
        <div className={styles.errorMessage}>{serverError}</div>
      )}

      <button className={styles.button} onClick={handleLogin}>
        Sign In
      </button>
    </div>
  );
}

export default Login;