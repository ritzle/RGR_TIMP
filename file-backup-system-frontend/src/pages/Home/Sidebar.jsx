import React from "react";
import styles from "./Sidebar.module.css";
import ServerForm from "./ServerForm";

const Sidebar = ({ name, ip, setName, setIp, handleAddServer }) => {
  return (
    <aside className={styles.sidebar}>
      <ServerForm
        name={name}
        ip={ip}
        setName={setName}
        setIp={setIp}
        handleAddServer={handleAddServer}
      />
      <div className={styles.emptyPanel}>
        {/* Здесь можно разместить статистику, фильтры и т.д. */}
      </div>
    </aside>
  );
};

export default Sidebar;
