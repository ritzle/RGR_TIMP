import React from "react";
import styles from "./Sidebar.module.css";
import ServerForm from "./ServerForm";

const Sidebar = ({ name, ip, setName, setIp, handleAddServer, ipError }) => {
  return (
    <aside className={styles.sidebar}>
      <ServerForm
        name={name}
        ip={ip}
        setName={setName}
        setIp={setIp}
        ipError={ipError}
        handleAddServer={handleAddServer}
      />
      <div className={styles.emptyPanel}>
        <h2 className={styles.description}>Тут могла быть ваша реклама</h2>
      </div>
    </aside>
  );
};

export default Sidebar;
