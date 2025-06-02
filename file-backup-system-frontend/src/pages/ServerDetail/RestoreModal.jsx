import React, { useState } from "react";
import styles from "./RestoreModal.module.css";

const RestoreModal = ({ backup, onCancel, onConfirm }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await onConfirm();
      setIsConfirmed(true);
    } catch (error) {
      console.error("Ошибка при восстановлении:", error);
      setErrorMessage(
        error.message || "Не удалось восстановить бэкап. Повторите попытку."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Если есть ошибка — показываем только текст ошибки и кнопку "OK" */}
        {errorMessage ? (
          <>
            <h3 className={styles.modalTitle}>Ошибка</h3>
            <p className={styles.errorMessage}>{errorMessage}</p>
            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={onCancel}>
                OK
              </button>
            </div>
          </>
        ) : !isConfirmed ? (
          <>
            <h3 className={styles.modalTitle}>Подтвердите действие</h3>
            <p>
              Вы действительно хотите восстановить бэкап{" "}
              <strong>{backup}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={onCancel}
                disabled={isLoading}
              >
                Отмена
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Восстановление..." : "Подтвердить"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Восстановление завершено</h3>
            <p>
              Полное восстановление завершено из <strong>{backup}</strong>.
            </p>
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
