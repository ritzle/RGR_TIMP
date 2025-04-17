import React from "react";
import styles from "./ServerInfo.module.css";

const ServerInfo = ({ name, address, status, onBack }) => {
  // Добавляем порядковый номер для задержки анимации
  const getAnimationDelay = (index) => ({
    "--order": index,
    animationDelay: `${0.3 + index * 0.1}s`
  });

  return (
    <aside className={styles.sidebar}>
      <button onClick={onBack} className={styles.backButton}>
        ← Назад
      </button>
      <h2>Информация о сервере</h2>
      
      <div className={styles.infoContainer}>
        <div 
          className={styles.infoItem}
          style={getAnimationDelay(0)}
        >
          <span className={styles.infoLabel}>Название:</span>
          <span className={styles.infoValue}>
            {decodeURIComponent(name)}
          </span>
        </div>
        
        <div 
          className={styles.infoItem}
          style={getAnimationDelay(1)}
        >
          <span className={styles.infoLabel}>Адрес:</span>
          <span className={styles.infoValue}>
            {address || "Не указан"}
          </span>
        </div>
        
        <div 
          className={styles.infoItem}
          style={getAnimationDelay(2)}
        >
          <span className={styles.infoLabel}>Статус:</span>
          <span className={`${styles.infoValue} ${styles[status.replace(/[^a-zA-Zа-яА-Я]/g, '').toLowerCase()] || ''}`}>
            {status}
            <span className={styles.statusIndicator}></span>
          </span>
        </div>
      </div>


    </aside>
  );
};

export default ServerInfo;