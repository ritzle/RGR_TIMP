// HomePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/HomePage.module.css";

const HomePage = () => {
  const [servers, setServers] = useState([]);
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [showProfile, setShowProfile] = useState(false);
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
      <header className={styles["dashboard-header"]}>
        <div className={styles.logo}>File Backup System</div>
        <div className={styles["profile-menu"]} onClick={() => setShowProfile(!showProfile)}>
          👤
          {showProfile && (
            <div className={styles["profile-dropdown"]}>
              <p>Имя: Владислав</p>
              <p>Фамилия: Иванов</p>
              <button>Редактировать</button>
              <button>Выход</button>
            </div>
          )}
        </div>
      </header>

      <div className={styles["main-content"]}>
        <aside className={styles.sidebar}>
          <h3>Добавить сервер</h3>
          <input
            type="text"
            placeholder="Название сервера"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="IP адрес"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <button onClick={handleAddServer}>Добавить</button>
        </aside>

        <section className={styles["server-list"]}>
          <h2>Сервера</h2>
          <div className={styles.cards}>
            {servers.map((server, index) => (
              <div
                key={index}
                className={styles["server-card"]}
                onClick={() => handleCardClick(server)}
              >
                <h3>{server.name}</h3>
                <p>{server.ip}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
