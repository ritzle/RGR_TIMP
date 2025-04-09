import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const navigate = useNavigate();
  const panelRef = useRef(null);

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
        setShowProfile(false);
        setIsEditing(false);
      }
    };
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfile]);

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
  

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>File Backup System</div>
        <div className={styles.profileIcon} onClick={() => setShowProfile(true)}>
          👤
        </div>
      </header>

      {showProfile && (
        <>
          <div className={styles.overlay}></div>
          <div ref={panelRef} className={styles.profilePanel}>
            <div className={styles.panelContent}>
              <h3>Профиль</h3>

              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedUser.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={styles.input}
                    placeholder="Имя"
                  />
                  <input
                    type="text"
                    value={editedUser.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={styles.input}
                    placeholder="Фамилия"
                  />
                </>
              ) : (
                <>
                  <p><strong>Имя:</strong> {user.firstName}</p>
                  <p><strong>Фамилия:</strong> {user.lastName}</p>
                </>
              )}

              <p><strong>E-mail:</strong> {user.email}</p>

              {isEditing ? (
                <button className={styles.saveButton} onClick={handleSave}>Сохранить</button>
              ) : (
                <button className={styles.editButton} onClick={() => setIsEditing(true)}>Редактировать</button>
              )}
              <button className={styles.logoutButton} onClick={handleLogout}>Выход</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
