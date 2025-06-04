import React, { useState } from "react";
import styles from "./Modal.module.css";
import config from "../../config";



const Modal = ({ onClose, onVerify, code, setCode }) => {
  const [status, setStatus] = useState("idle");

  const handleVerifyClick = async () => {
    const result = await onVerify();

    if (result === true) {
      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        onClose();
      }, 2000);
    } else {
      setStatus("error");
      setCode("");
      setTimeout(() => setStatus("idle"), 1500);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div
        className={`${styles.modalContent} ${
          status === "error" ? styles.errorShake : ""
        }`}
      >
        {status === "success" ? (
          <p className={styles.successMessage}>
            Пользователь зарегистрирован ✅
          </p>
        ) : (
          <>
            <h3>Подтвердите E-mail</h3>
            <p>Мы отправили код на вашу почту. Введите его ниже:</p>
            <input
              type="text"
              placeholder="Введите код"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={status === "error" ? styles.errorInput : ""}
            />
            {status === "error" && (
              <div className={styles.errorText}>Неверный код</div>
            )}
            <div className={styles.modalButtons}>
              <button
                onClick={handleVerifyClick}
                className={styles.confirmBtn}
              >
                Подтвердить
              </button>
              <button onClick={onClose} className={styles.closeBtn}>
                Отмена
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
