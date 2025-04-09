import React from "react";
import { useParams } from "react-router-dom";
import "../styles/HomePage.module.css";

const ServerPage = () => {
  const { name, ip } = useParams();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="logo">Управление сервером</div>
      </header>

      <div className="main-content">
        <div className="server-panel">
          <h2>Сервер: {name}</h2>
          <p>IP-адрес: {ip}</p>

          <div className="server-actions">
            <button>Создать бэкап</button>
            <button>Список файлов</button>
            <button>Восстановить</button>
            <button className="danger">Удалить сервер</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerPage;
