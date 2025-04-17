import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ServerList from "./ServerList";

const HomePage = () => {
  const [servers, setServers] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email) {
      fetch(`http://localhost:5000/api/get-user-servers?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setServers(data);
        })
        .catch(err => console.error("Ошибка при загрузке серверов:", err));
    }
  }, []);

  const handleAddServer = async () => {
    if (name && address) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.email) {
          alert("Пользователь не найден");
          return;
        }

        const response = await fetch("http://localhost:5000/api/add-server", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            ip_address: address,
            email: user.email,
            id_user: user.id
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setServers([...servers, { name, ip: address }]);
          setName("");
          setAddress("");
          setAddressError("");
        } else if (data.message?.toLowerCase().includes("ip")) {
          setAddress("");
          setAddressError("Этот адрес уже зарегистрирован");
        } else {
          alert("Ошибка: " + data.message);
        }
      } catch (error) {
        console.error("Ошибка запроса:", error);
        alert("Сервер недоступен");
      }
    }
  };

  const handleCardClick = (server) => {
    navigate(`/server/${encodeURIComponent(server.name)}`, {
      state: {
        address: server.ip,
        id: server.id,
      }
    });
  };
  

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.mainContent}>
        <Sidebar
          name={name}
          address={address}
          setName={setName}
          setIp={setAddress}
          handleAddServer={handleAddServer}
          ipError={addressError}
        />
        <ServerList servers={servers} handleCardClick={handleCardClick} />
      </div>
    </div>
  );
};

export default HomePage;
