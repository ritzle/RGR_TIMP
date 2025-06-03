import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ServerDetailPage.module.css";
import ServerInfo from "./ServerInfo";
import ServerContent from "./ServerContent";
import SSHRequestForm from "./SSHRequestForm";


const ServerDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Загрузка...");
  const [flaskStatus, setFlaskStatus] = useState("Проверка...");
  const [address, setAddress] = useState("");

  // Добавляем состояние для SSH-запроса
  const [sshLoading, setSSHLoading] = useState(false);
  const [sshError, setSSHError] = useState(null);

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

    const checkStatus = async (address, port = 22) => {
      try {
        const res = await fetch(`http://localhost:5000/api/ping-host?address=${encodeURIComponent(address)}&port=${port}`);
        const data = await res.json();
    
        switch (data.status) {
          case "available":
            setStatus("🟢 Активен");
            break;
          case "timeout":
            setStatus("⏱️ Время ожидания истекло");
            break;
          case "ssh_error":
            setStatus("⚠️ SSH ошибка");
            break;
          case "unreachable":
            setStatus("🔴 Недоступен");
            break;
          default:
            setStatus("🔴 Неизвестный статус");
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

  const handleSSHConnect = async (username, password, port) => {
    setSSHLoading(true);
    setSSHError(null);
    try {
      const response = await fetch("http://localhost:5000/api/ssh-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, username, password, port }) // добавляем порт
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Ошибка SSH-подключения");
      }
  
      const blob = await response.blob();
  
      const downloadUrl = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `backup_${address.replace(/\./g, "_")}_${Date.now()}.tar.gz`;
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      window.URL.revokeObjectURL(downloadUrl);
  
    } catch (error) {
      setSSHError(error.message);
      throw error;
    } finally {
      setSSHLoading(false);
    }
  };
  
  

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
  <div className={styles.contentColumn}>
    {flaskStatus === "🟢 Работает" && (
      <ServerContent serverAddress={address} />
    )}
  </div>

  <div className={styles.sshColumn}>
    {flaskStatus !== "🟢 Работает" && (
      <div className={styles.sshFormWrapper}>
        <SSHRequestForm
          serverAddress={address}
          onConnect={handleSSHConnect}
          loading={sshLoading}
          error={sshError}
        />
      </div>
    )}
  </div>
</div>
    </div>
  );
};

export default ServerDetail;
