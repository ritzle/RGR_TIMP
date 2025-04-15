import React from "react";
import styles from "./ServerInfo.module.css";

const ServerInfo = ({ name, address, status, onBack }) => (
  <aside className={styles.sidebar}>
    <button onClick={onBack} className={styles.backButton}>← Назад</button>
    <h2>Информация о сервере</h2>
    <p><strong>Название:</strong> {decodeURIComponent(name)}</p>
    <p><strong>Адрес:</strong> {address}</p>
    <p><strong>Статус:</strong> {status}</p>
  </aside>
);

export default ServerInfo;
