import React from "react";
import styles from "./ServerCard.module.css";

const ServerCard = ({ server, onClick, onRequestDelete }) => {
  return (
    <div
      className={styles.serverCard}
      onClick={() => onClick(server)} // вот сюда
    >
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>
          {server.name}
        </h3>
        <button
          className={styles.deleteBtn}
          onClick={(e) => {
            e.stopPropagation(); 
            onRequestDelete();
          }}
          aria-label={`Удалить сервер ${server.name}`}
        >
          ✕
        </button>
      </div>
      <p className={styles.address}>{server.ip}</p>
    </div>
  );
};

export default ServerCard;
