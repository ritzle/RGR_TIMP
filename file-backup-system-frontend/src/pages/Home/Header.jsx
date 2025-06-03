import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

import Profile from './icons/profile.png';

import ChangePasswordModal from "./ChangePasswordModal";

const Header = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const navigate = useNavigate();
  const panelRef = useRef(null);

  // Для смены пароля
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1 - ввод кода, 2 - новый пароль
  const [emailCode, setEmailCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser({
          firstName: parsed.firstName || "",
          lastName: parsed.lastName || "",
          email: parsed.email || ""
        });
      } catch (e) {
        console.error("Ошибка парсинга user из localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        closePanel();
      }
    };
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

  const openPanel = () => {
    setShowProfile(true);
    setIsClosing(false);
  };

  const closePanel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowProfile(false);
      setIsEditing(false);
      setIsClosing(false);
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.setItem("isAuthenticated", "false");
    navigate("/");
  };

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const updatedUser = {
      ...user,
      firstName: editedUser.firstName,
      lastName: editedUser.lastName,
    };

    try {
      const response = await fetch("http://localhost:5000/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        alert("Ошибка при обновлении профиля: " + result.message);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
      alert("Сервер недоступен");
    }
  };

  // Здесь функция открытия модального окна смены пароля
  const openChangePassword = async () => {
    closePanel();
    setIsChangingPassword(true);
    setPasswordStep(1);
    setEmailCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCodeSent(false);

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/send-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка отправки кода");
      }

      setCodeSent(true);
    } catch (error) {
      alert(error.message);
      setIsChangingPassword(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!emailCode.trim()) {
      alert("Введите код из письма");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          code: emailCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка проверки кода");
      }

      setPasswordStep(2);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      alert("Введите пароль");
      return;
    } else if (newPassword.length < 8) {
      alert("Пароль должен содержать минимум 8 символов");
      return;
    } else if (!/[A-Z]/.test(newPassword)) {
      alert("Должна быть хотя бы одна заглавная буква");
      return;
    } else if (!/[0-9]/.test(newPassword)) {
      alert("Должна быть хотя бы одна цифра");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          newPassword: newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Ошибка смены пароля");
      }

      alert("Пароль успешно изменён");
      setIsChangingPassword(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeChangePassword = () => {
    setIsChangingPassword(false);
    setPasswordStep(1);
    setEmailCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>File Backup System</div>
        <div className={styles.profileIcon} onClick={openPanel}>
          <img src={Profile} alt="Профиль" width="40" height="40" />
        </div>
      </header>

      {showProfile && (
        <>
          <div className={`${styles.overlay} ${isClosing ? styles.closing : ''}`}></div>
          <div
            ref={panelRef}
            className={`${styles.profilePanel} ${isClosing ? styles.closing : ''}`}
          >
            <div className={styles.panelContent}>
              <h3>Профиль</h3>

              {isEditing ? (
                <>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      id="firstName"
                      value={editedUser.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={styles.input}
                      placeholder=" "
                    />
                    <label htmlFor="firstName" className={styles.inputLabel}>Имя</label>
                  </div>
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      id="lastName"
                      value={editedUser.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={styles.input}
                      placeholder=" "
                    />
                    <label htmlFor="lastName" className={styles.inputLabel}>Фамилия</label>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Имя:</strong> {user.firstName}</p>
                  <p><strong>Фамилия:</strong> {user.lastName}</p>
                </>
              )}

              <p><strong>E-mail:</strong> {user.email}</p>

              <div className={styles.buttonGroup}>
                {isEditing ? (
                  <button className={styles.saveButton} onClick={handleSave}>Сохранить</button>
                ) : (
                  <>
                    <button className={styles.editButton} onClick={() => setIsEditing(true)}>Редактировать</button>
                    <button className={styles.changePasswordButton} onClick={openChangePassword}>Изменить пароль</button>
                  </>
                )}
                <button className={styles.logoutButton} onClick={handleLogout}>Выход</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Используем вынесенный компонент смены пароля */}
      {isChangingPassword && (
        <ChangePasswordModal
          email={user.email} 
          emailCode={emailCode}
          setEmailCode={setEmailCode}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordStep={passwordStep}
          loading={loading}
          codeSent={codeSent}
          onClose={closeChangePassword}
          onConfirmCode={handleConfirmCode}
          onChangePassword={handleChangePassword}
        />
      )}
    </>
  );
};

export default Header;
