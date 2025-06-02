import React, { useState } from "react";
import styles from "./SSHRequestForm.module.css";

const SSHRequestForm = ({ serverAddress, onConnect }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onConnect(username, password);
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
        <button type="submit" disabled={loading}>
          {loading ? "Подключение..." : "Получить бэкап"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
};

export default SSHRequestForm;
