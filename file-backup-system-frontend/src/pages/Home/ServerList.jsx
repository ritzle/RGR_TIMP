import React from "react";
import styles from "./ServerList.module.css";
import ServerCard from "./ServerCard";

const ServerList = ({ servers, handleCardClick }) => {
  return (
    <section className={styles.serverList}>
      <h2 className={styles.heading}>Сервера</h2>
      <div className={styles.cards}>
        {servers.map((server, index) => (
          <ServerCard key={index} server={server} onClick={handleCardClick} />
        ))}
      </div>
    </section>
  );
};

export default ServerList;
