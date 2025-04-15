import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./ServerDetailPage.module.css";

import ServerInfo from "./ServerInfo";
import ServerContent from "./ServerContent";

const ServerDetail = () => {
  const { name } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("Загрузка...");
  const [address, setAddress] = useState("");
  const [backups, setBackups] = useState({});
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreMode, setRestoreMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);

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
        } else setStatus("Сервер не найден");
      } catch (err) {
        console.error("Ошибка загрузки сервера", err);
        setStatus("Ошибка при загрузке");
      }
    };

    const checkStatus = async (address) => {
      try {
        const res = await fetch(`http://localhost:5000/api/ping-server?address=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data.status === "OK") setStatus("🟢 Активен");
        else if (data.status === "timeout") setStatus("⏱️ Время ожидания истекло");
        else setStatus("🔴 Недоступен");
      } catch {
        setStatus("🔴 Ошибка подключения");
      }
    };

    fetchServerData();
  }, [name]);

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/get-backups?address=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (typeof data.backups === "object") {
          setBackups(data.backups);
        } else {
          console.warn("Неверный формат данных:", data);
        }
      } catch (err) {
        console.error("Ошибка при получении бэкапов:", err);
      }
    };

    if (address) fetchBackups();
  }, [address]);

  const handleCreateBackup = async (comment = "") => {
    if (!address) return;
    setLoadingBackup(true);
    try {
      const res = await fetch(`http://localhost:5000/api/create-backup?address=${encodeURIComponent(address)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Бэкап успешно создан");
        if (data.backupName) {
          setBackups((prev) => ({
            [data.backupName]: comment,
            ...prev
          }));
        }
      } else {
        alert(data.message || "Ошибка при создании бэкапа");
      }
    } catch (err) {
      console.error("Ошибка создания бэкапа:", err);
      alert("Не удалось создать бэкап");
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!address || !selectedBackup) return;
    setLoadingRestore(true);
    try {
      const res = await fetch(`http://localhost:5000/api/restore-backup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, backup: selectedBackup }),
      });
      const data = await res.json();
      alert(data.message || "Восстановление завершено");
    } catch (err) {
      console.error("Ошибка восстановления:", err);
      alert("Не удалось восстановить бэкап");
    } finally {
      setShowModal(false);
      setRestoreMode(false);
      setSelectedBackup(null);
      setLoadingRestore(false);
    }
  };

  return (
    <div className={styles.container}>
      <ServerInfo name={name} address={address} status={status} onBack={handleBack} />
      <ServerContent
        address={address}
        backups={backups}
        selectedBackup={selectedBackup}
        restoreMode={restoreMode}
        showModal={showModal}
        loadingBackup={loadingBackup}
        loadingRestore={loadingRestore}
        setSelectedBackup={setSelectedBackup}
        setShowModal={setShowModal}
        handleCreateBackup={handleCreateBackup}
        handleConfirmRestore={handleConfirmRestore}
        onEnterRestoreMode={() => setRestoreMode(true)}
        onCancelRestore={() => {
          setRestoreMode(false);
          setSelectedBackup(null);
          setShowModal(false);
        }}
      />
    </div>
  );
};

export default ServerDetail;
