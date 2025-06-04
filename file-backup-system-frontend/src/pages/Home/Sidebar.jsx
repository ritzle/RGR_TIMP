import React from "react";
import styles from "./Sidebar.module.css";
import ServerForm from "./ServerForm";

import Lottie from "lottie-react";
import animationData from "./animations/Animation_server.json";

const Sidebar = ({ name, address, setName, setIp, handleAddServer, ipError }) => {
  return (
    <aside className={styles.sidebar}>
      <ServerForm
        name={name}
        address={address}
        setName={setName}
        setAddress={setIp}
        handleAddServer={handleAddServer}
        ipError={ipError}
      />
      <div className={styles.emptyPanel}>
        {/* Вместо текста рендерим Lottie-анимацию */}
        <Lottie 
          animationData={animationData} 
          loop={true} 
          autoplay={true} 
          style={{ width: 300, height: 300 }} // размер можно менять
        />
        <div className={styles.underline} />
      </div>
    </aside>
  );
};

export default Sidebar;
