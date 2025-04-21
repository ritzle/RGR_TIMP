import React from 'react';
import styles from './BackupCommentModal.module.css';

const BackupCommentModal = ({
  show,
  comment,
  loading,
  onClose,
  onConfirm,
  onCommentChange
}) => {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Комментарий к бэкапу</h3>
        <textarea
          className={styles.textarea}
          placeholder="Введите комментарий..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
        />
        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            className={styles.cancelBtn}
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className={styles.confirmBtn}
            disabled={loading}
          >
            {loading ? "Создание..." : "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupCommentModal;