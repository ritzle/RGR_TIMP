import React, { useState } from "react";
import styles from "./ServerForm.module.css";

const ServerForm = ({ name, address, setName, setAddress, handleAddServer, ipError }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !address) return;
    
    setIsSubmitting(true);
    try {
      await handleAddServer();
      setName("");
      setAddress("");
    } catch (error) {
      console.error("Ошибка при добавлении сервера:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.serverForm}>
      <h3 className={styles.heading}>Добавить сервер</h3>
      
      <input
        type="text"
        placeholder="Название сервера"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
        required
      />

      <input
        type="text"
        placeholder="Адрес сервера"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className={`${styles.input} ${ipError ? styles.error : ""}`}
        required
      />
      {ipError && <div className={styles.errorText}>{ipError}</div>}

      <button 
        type="submit"
        className={styles.button}
        disabled={isSubmitting || !name || !address}
      >
        {isSubmitting ? "Добавление..." : "Добавить сервер"}
      </button>
    </form>
  );
};

export default ServerForm;