import React, { useState, useEffect } from "react";
import styles from "./ChangePasswordModal.module.css";

const ChangePasswordModal = ({
  email,
  onClose,
  onPasswordChangeSuccess = () => {},
}) => {
  const [passwordStep, setPasswordStep] = useState(1);
  const [emailCode, setEmailCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");



  const handleConfirmCode = async () => {
    if (!emailCode.trim()) {
      setError("Введите код из письма");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: emailCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка проверки кода");
      }

      setPasswordStep(2);
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      setError("Введите пароль");
      return;
    } else if (newPassword.length < 8) {
      setError("Пароль должен содержать минимум 8 символов");
      return;
    } else if (!/[A-Z]/.test(newPassword)) {
      setError("Должна быть хотя бы одна заглавная буква");
      return;
    } else if (!/[0-9]/.test(newPassword)) {
      setError("Должна быть хотя бы одна цифра");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка смены пароля");
      }

      setSuccessMessage("Пароль успешно изменён!");
      setError("");
      setPasswordStep(3);
      onPasswordChangeSuccess(); // например, скрыть модалку через setShowModal(false)
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.authForm} onClick={(e) => e.stopPropagation()}>
        <h3>Смена пароля</h3>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        {passwordStep === 1 && (
          <>
            <p>На вашу почту отправлен код подтверждения. Введите его ниже:</p>
            <input
              type="text"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              placeholder="Код из письма"
              className={styles.input}
              disabled={loading}
            />
            <button className={styles.button} onClick={handleConfirmCode} disabled={loading}>
              Подтвердить код
            </button>
            <button
              className={styles.button}
              onClick={onClose}
              disabled={loading}
              style={{ marginTop: "10px", backgroundColor: "#ff4d4d" }}
            >
              Отмена
            </button>
          </>
        )}

        {passwordStep === 2 && (
          <>
            <p>Введите новый пароль:</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новый пароль"
              className={styles.input}
              disabled={loading}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Подтвердите пароль"
              className={styles.input}
              disabled={loading}
            />
            <button className={styles.button} onClick={handleChangePassword} disabled={loading}>
              Сменить пароль
            </button>
            <button
              className={styles.button}
              onClick={onClose}
              disabled={loading}
              style={{ marginTop: "10px", backgroundColor: "#ff4d4d" }}
            >
              Отмена
            </button>
          </>
        )}

        {passwordStep === 3 && (
          <button className={styles.button} onClick={onClose} style={{ marginTop: "20px" }}>
            Закрыть
          </button>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
