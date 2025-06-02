import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ServerDetailPage.module.css";
import ServerInfo from "./ServerInfo";
import ServerContent from "./ServerContent";

const ServerDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Загрузка...");
  const [flaskStatus, setFlaskStatus] = useState("Проверка...");
  const [address, setAddress] = useState("");

  const handleBack = () => navigate("/home");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.email) return alert("Пользователь не авторизован");

    const fetchServerData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/get-user-servers?email=${user.email}`);
        const allServers = await res.json();
        const target = allServers.find((srv) => srv.name === name);

        if (target) {
          setAddress(target.ip);
          checkStatus(target.ip);
        } else {
          setStatus("Сервер не найден");
          setFlaskStatus("❌ Неизвестно");
        }
      } catch (err) {
        console.error("Ошибка загрузки сервера", err);
        setStatus("Ошибка при загрузке");
        setFlaskStatus("❌ Неизвестно");
      }
    };

    const checkStatus = async (address) => {
      try {
        const res = await fetch(`http://localhost:5000/api/ping-host?address=${encodeURIComponent(address)}`);
        const data = await res.json();

        switch (data.status) {
          case "OK":
            setStatus("🟢 Активен");
            break;
          case "timeout":
            setStatus("⏱️ Время ожидания истекло");
            break;
          default:
            setStatus("🔴 Недоступен");
        }

        checkFlaskStatus(address);
      } catch {
        setStatus("🔴 Ошибка подключения");
      }
    };

    const checkFlaskStatus = async (address) => {
      try {
        const res = await fetch(`http://localhost:5000/api/ping-server?address=${encodeURIComponent(address)}`);
        if (res.ok) {
          setFlaskStatus("🟢 Работает");
        } else {
          setFlaskStatus("🔴 Не отвечает");
        }
      } catch {
        setFlaskStatus("🔴 Не отвечает");
      }
    };

    fetchServerData();
  }, [name]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <ServerInfo 
          name={name} 
          address={address} 
          status={status} 
          flaskStatus={flaskStatus}
          onBack={handleBack} 
        />
      </div>

      <div className={styles.mainArea}>
        <ServerContent serverAddress={address} />
      </div>
    </div>
  );
};

export default ServerDetail;
