import React from 'react';
import styles from './BackupCommentModal.module.css';

const BackupCommentModal = ({
  show,
  comment,
  loading,
  isCompleted,
  onClose,
  onConfirm,
  onCommentChange,
  backupName // Добавляем новое свойство для имени бэкапа
}) => {
  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!isCompleted ? (
          <>
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
                disabled={loading}
              >
                Отмена
              </button>
              <button
                onClick={onConfirm}
                className={styles.confirmBtn}
                disabled={loading || !comment.trim()}
              >
                {loading ? "Создание..." : "Подтвердить"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className={styles.modalTitle}>Бэкап успешно создан</h3>
            <div className={styles.successInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Имя:</span>
                <span className={styles.infoValue}>{backupName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Комментарий:</span>
                <span className={styles.infoValue}>{comment || '—'}</span>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={onClose}
                className={styles.confirmBtn}
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BackupCommentModal;