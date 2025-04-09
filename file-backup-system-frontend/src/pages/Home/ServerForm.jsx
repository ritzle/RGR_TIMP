import React from "react";
import styles from "./ServerForm.module.css";

const ServerForm = ({ name, ip, setName, setIp, handleAddServer, ipError }) => {
  return (
    <div className={styles.serverForm}>
      <h3 className={styles.heading}>Добавить сервер</h3>
      <input
        type="text"
        placeholder="Название сервера"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <input
        type="text"
        placeholder="IP адрес"
        value={ip}
        onChange={(e) => setIp(e.target.value)}
        className={`${styles.input} ${ipError ? styles.error : ""}`}
      />
      {ipError && <div className={styles.errorText}>{ipError}</div>}
      <button onClick={handleAddServer} className={styles.button}>Добавить</button>
    </div>
  );
};


export default ServerForm;
