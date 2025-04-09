import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ServerList from "./ServerList";

const HomePage = () => {
  const [servers, setServers] = useState([]);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const navigate = useNavigate();

  const handleAddServer = () => {
    if (name && ip) {
      setServers([...servers, { name, ip }]);
      setName("");
      setIp("");
    }
  };

  const handleCardClick = (server) => {
    navigate(`/server/${encodeURIComponent(server.name)}/${encodeURIComponent(server.ip)}`);
  };

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar
          name={name}
          ip={ip}
          setName={setName}
          setIp={setIp}
          handleAddServer={handleAddServer}
        />
        <ServerList servers={servers} handleCardClick={handleCardClick} />
      </div>
    </div>
  );
};

export default HomePage;
