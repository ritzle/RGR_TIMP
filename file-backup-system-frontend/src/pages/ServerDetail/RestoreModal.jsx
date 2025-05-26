import React, { useState } from "react";
import styles from "./RestoreModal.module.css";

const RestoreModal = ({ backup, onCancel }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      setIsConfirmed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!isConfirmed ? (
          <>
            <h3 className={styles.modalTitle}>Подтвердите действие</h3>
            <p>Вы действительно хотите восстановить бэкап <strong>{backup}</strong>?</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={onCancel} disabled={isLoading}>
                Отмена
              </button>
              <button className={styles.confirmBtn} onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? "Восстановление..." : "Подтвердить"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Восстановление завершено</h3>
            <p>Полное восстановление завершено из <strong>{backup}</strong></p>
            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={onCancel}>
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestoreModal;