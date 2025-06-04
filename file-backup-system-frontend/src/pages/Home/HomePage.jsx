import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ServerList from "./ServerList";
import DeleteConfirmModal from "./DeleteConfirmModal";
import config from "../../config";

const HomePage = () => {
  const [servers, setServers] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [serverToDelete, setServerToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email) {
      fetch(`${config.API_BASE_URL}/api/get-user-servers?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setServers(data);
        })
        .catch((err) => console.error("Ошибка при загрузке серверов:", err));
    }
  }, []);

  const handleAddServer = async () => {
    if (!name || !address) return;
  
    const trimmedName = name.trim().toLowerCase();
    const trimmedAddress = address.trim();
  
    // Проверка уникальности по имени и IP
    const isDuplicate = servers.some(
      (s) =>
        s.name.trim().toLowerCase() === trimmedName ||
        s.ip.trim() === trimmedAddress
    );
  
    if (isDuplicate) {
      setAddressError("Такой сервер уже существует (имя или IP)");
      return;
    }
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        alert("Пользователь не найден");
        return;
      }
  
      const response = await fetch(`${config.API_BASE_URL}/api/add-server`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          ip_address: address,
          email: user.email,
          id_user: user.id,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const newServer = { name, ip: address, id: data.id || Date.now() };
        setServers((prev) => [...prev, newServer]);
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
  };
  

  const handleCardClick = (server) => {
    navigate(`/server/${encodeURIComponent(server.name)}`, {
      state: {
        address: server.ip,
        id: server.id,
      },
    });
  };

  const requestDeleteServer = (server) => {
    setServerToDelete(server);
    setDeleteError("");
  };

  const cancelDelete = () => {
    setServerToDelete(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!serverToDelete) return;
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        setDeleteError("Пользователь не найден");
        return;
      }
  
      const response = await fetch(`${config.API_BASE_URL}/api/delete-server`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: serverToDelete.name,
          email: user.email
        }),
      });
  
      if (response.ok) {
        setServers((prev) =>
          prev.filter((s) => s.name !== serverToDelete.name)
        );
        setServerToDelete(null);
        setDeleteError("");
      } else {
        const data = await response.json();
        setDeleteError(data.message || "Неизвестная ошибка при удалении");
      }
    } catch (error) {
      console.error("Ошибка удаления сервера:", error);
      setDeleteError("Не удалось удалить сервер. Попробуйте ещё раз.");
    }
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
        <ServerList
          servers={servers}
          handleCardClick={handleCardClick}
          onRequestDelete={requestDeleteServer}
        />
      </div>

      {serverToDelete && (
        <DeleteConfirmModal
          backupName={serverToDelete.name}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
          errorMessage={deleteError}
        />
      )}
    </div>
  );
};

export default HomePage;
