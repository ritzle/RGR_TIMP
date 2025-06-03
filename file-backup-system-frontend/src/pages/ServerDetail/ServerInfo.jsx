import React from "react";
import styles from "./ServerInfo.module.css";

const ServerInfo = ({ name, address, status, flaskStatus, onBack }) => {
  const getAnimationDelay = (index) => ({
    "--order": index,
    animationDelay: `${0.3 + index * 0.1}s`
  });

  const getStatusClass = (statusText) => {
    if (!statusText || typeof statusText !== "string") return "";
    return styles[statusText.replace(/[^a-zA-Zа-яА-Я]/g, '').toLowerCase()] || '';
  };

  return (
    <aside className={styles.sidebar}>
      <button onClick={onBack} className={styles.backButton}>
        ← Назад
      </button>
      <h2>Информация о сервере</h2>
      
      <div className={styles.infoContainer}>
        <div className={styles.infoItem} style={getAnimationDelay(0)}>
          <span className={styles.infoLabel}>Название:</span>
          <span className={styles.infoValue}>
            {decodeURIComponent(name)}
          </span>
        </div>
        
        <div className={styles.infoItem} style={getAnimationDelay(1)}>
          <span className={styles.infoLabel}>Адрес:</span>
          <span className={styles.infoValue}>
            {address || "Не указан"}
          </span>
        </div>
        
        <div className={styles.infoItem} style={getAnimationDelay(2)}>
          <span className={styles.infoLabel}>ssh-сервер:</span>
          <span className={`${styles.infoValue} ${getStatusClass(status)}`}>
            {status}
            <span className={styles.statusIndicator}></span>
          </span>
        </div>

        <div className={styles.infoItem} style={getAnimationDelay(3)}>
          <span className={styles.infoLabel}>Flask-сервер:</span>
          <span className={`${styles.infoValue} ${getStatusClass(flaskStatus)}`}>
            {flaskStatus || "Неизвестно"}
            <span className={styles.statusIndicator}></span>
          </span>
        </div>
      </div>
    </aside>
  );
};

export default ServerInfo;
