import React from "react";
import styles from "./RestoreModal.module.css";

const RestoreModal = ({ backup, onConfirm, onCancel }) => (
  <div className={styles.overlay}>
    <div className={styles.modal}>
      <h3 className={styles.modalTitle}>Восстановление</h3>
      <p>Вы действительно хотите восстановить бэкап <strong>{backup}</strong>?</p>
      <div className={styles.modalActions}>
        <button className={styles.cancelBtn} onClick={onCancel}>Отмена</button>
        <button className={styles.confirmBtn} onClick={onConfirm}>Подтвердить</button>
      </div>
    </div>
  </div>
);

export default RestoreModal;
