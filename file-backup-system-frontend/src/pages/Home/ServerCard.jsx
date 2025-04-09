import React from "react";
import styles from "./ServerCard.module.css";

const ServerCard = ({ server, onClick }) => {
  return (
    <div className={styles.serverCard} onClick={() => onClick(server)}>
      <h3 className={styles.title}>{server.name}</h3>
      <p className={styles.ip}>{server.ip}</p>
    </div>
  );
};

export default ServerCard;
