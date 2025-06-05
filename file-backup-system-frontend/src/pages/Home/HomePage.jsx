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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (!user || !token) {
        navigate("/login");
        return;
      }

      // Дополнительная проверка валидности токена
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/validate-token`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          // Попытка обновить токен, если есть refreshToken
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            const newTokens = await refreshTokens(refreshToken);
            if (newTokens) {
              localStorage.setItem("token", newTokens.access_token);
              localStorage.setItem("refreshToken", newTokens.refresh_token);
              return;
            }
          }
          
          // Если не удалось обновить - разлогиниваем
          localStorage.clear();
          navigate("/login");
        }
      } catch (error) {
        console.error("Ошибка проверки токена:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  // Функция для обновления токенов
  const refreshTokens = async (refreshToken) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error("Ошибка обновления токена:", error);
    }
    return null;
  };

  const fetchServers = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");
      
      if (!user?.email || !token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${config.API_BASE_URL}/api/get-user-servers?email=${encodeURIComponent(user.email)}`, 
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.status === 401) {
        // Попытка обновить токен
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const newTokens = await refreshTokens(refreshToken);
          if (newTokens) {
            localStorage.setItem("token", newTokens.access_token);
            localStorage.setItem("refreshToken", newTokens.refresh_token);
            // Повторяем запрос с новым токеном
            return fetchServers();
          }
        }
        
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setServers(data);
      localStorage.setItem("servers", JSON.stringify(data));
    } catch (error) {
      console.error("Ошибка загрузки:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleAddServer = async () => {
    if (!name || !address) return;
    const token = localStorage.getItem("token");
    if (!token) { // Проверка наличия токена
      alert("Требуется авторизация");
      return;
    }
  
    const trimmedName = name.trim().toLowerCase();
    const trimmedAddress = address.trim();
  
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
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
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

    const token = localStorage.getItem("token");
    if (!token) { // Проверка наличия токена
      setDeleteError("Требуется авторизация");
      return;
    }
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.email) {
        setDeleteError("Пользователь не найден");
        return;
      }
  
      const response = await fetch(`${config.API_BASE_URL}/api/delete-server`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
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