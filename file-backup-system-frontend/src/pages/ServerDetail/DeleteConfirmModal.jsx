import React, { useState } from "react";
import styles from "./DeleteConfirmModal.module.css";

const DeleteConfirmModal = ({ backupName, onCancel, onConfirm }) => {
  const [isDeleted, setIsDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Вызов функции удаления, которая должна вернуть успешный результат или выбросить ошибку
      await onConfirm();
      setIsDeleted(true);
    } catch (err) {
      // err может быть строкой или объектом, нормализуем его для корректного вывода
      console.error("Ошибка при удалении:", err);
      if (typeof err === "string") {
        setError({ message: err, backup_name: backupName });
      } else if (err && typeof err === "object") {
        // Если в ошибке нет backup_name, добавим его для отображения
        setError({
          message: err.message || "Не удалось удалить бэкап",
          backup_name: err.backup_name || backupName,
        });
      } else {
        setError({ message: "Неизвестная ошибка", backup_name: backupName });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {error ? (
          <>
            <h3 className={styles.modalTitle}>Ошибка</h3>
            <p className={styles.error}>
              {error.message} {error.backup_name ? `"${error.backup_name}"` : ""}
            </p>
            <div className={styles.modalActions}>
              <button className={styles.confirmBtn} onClick={onCancel}>
                OK
              </button>
            </div>
          </>
        ) : !isDeleted ? (
          <>
            <h3 className={styles.modalTitle}>Подтвердите удаление</h3>
            <p>
              Вы действительно хотите удалить бэкап <strong>{backupName}</strong>?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={onCancel} disabled={isLoading}>
                Отмена
              </button>
              <button className={styles.confirmBtn} onClick={handleDelete} disabled={isLoading}>
                {isLoading ? "Удаление..." : "Удалить"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Удаление завершено</h3>
            <p>
              Бэкап <strong>{backupName}</strong> успешно удалён.
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

export default DeleteConfirmModal;
