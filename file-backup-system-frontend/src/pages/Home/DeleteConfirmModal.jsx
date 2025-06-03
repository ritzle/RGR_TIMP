import React from "react";
import styles from "./DeleteConfirmModal.module.css";

const DeleteConfirmModal = ({ backupName, onCancel, onConfirm, errorMessage }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Подтвердите удаление</h3>
        <p>
          Вы действительно хотите удалить сервер <strong>{backupName}</strong>?
        </p>

        {errorMessage && (
          <p className={styles.error}>{errorMessage}</p>
        )}

        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Отмена
          </button>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
