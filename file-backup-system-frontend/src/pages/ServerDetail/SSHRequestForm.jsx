import React, { useState } from "react";
import styles from "./SSHRequestForm.module.css";

const SSHRequestForm = ({ serverAddress, onConnect }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [port, setPort] = useState("22"); // добавлено состояние для порта, по умолчанию 22
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConnect(username, password, Number(port)); // передаем порт как число
    } catch (err) {
      setError(err.message || "Ошибка SSH подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Получение бэкапа по SSH</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          Пользователь:
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <label>
          Пароль:
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <label>
          Порт:
          <input
            type="number"
            value={port}
            onChange={e => setPort(e.target.value)}
            required
            min="1"
            max="65535"
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Подключение..." : "Получить бэкап"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default SSHRequestForm;
