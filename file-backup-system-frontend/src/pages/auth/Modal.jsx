import React, { useState } from "react";
import styles from "./Modal.module.css";

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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {status === "success" ? (
          <h3 className={styles.modalTitle}>
            Пользователь зарегистрирован ✅
          </h3>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Подтвердите E-mail</h3>

            <div className={styles.formGroup}>
              <label>Мы отправили код на вашу почту. Введите его ниже:</label>
              <input
                type="text"
                placeholder="Код подтверждения"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`${styles.commentInput} ${
                  status === "error" ? styles.error : ""
                }`}
              />
              {status === "error" && (
                <div className={styles.error}>Неверный код</div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button
                onClick={onClose}
                className={styles.cancelBtn}
                disabled={status === "success"}
              >
                Отмена
              </button>
              <button
                onClick={handleVerifyClick}
                className={styles.confirmBtn}
                disabled={status === "success"}
              >
                Подтвердить
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
