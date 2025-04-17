import React from "react";
import styles from "./Sidebar.module.css";
import ServerForm from "./ServerForm";

const Sidebar = ({ name, address, setName, setIp, handleAddServer, ipError }) => {
  return (
    <aside className={styles.sidebar}>
      <ServerForm
        name={name}
        address={address}
        setName={setName}
        setAddress={setIp} // Передаем setIp как setAddress
        handleAddServer={handleAddServer}
        ipError={ipError}
      />
      <div className={styles.emptyPanel}>
        <h2 className={styles.description}>Тут могла быть ваша реклама</h2>
      </div>
    </aside>
  );
};

export default Sidebar;