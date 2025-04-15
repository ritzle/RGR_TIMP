import React, { useState } from "react";
import styles from "./ServerContent.module.css";
import BackupList from "./BackupList";
import RestoreModal from "./RestoreModal";

const ServerContent = ({
  backups,
  selectedBackup,
  restoreMode,
  showModal,
  loadingBackup,
  loadingRestore,
  setSelectedBackup,
  setShowModal,
  handleCreateBackup,
  handleConfirmRestore,
  onEnterRestoreMode,
  onCancelRestore
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");

  const handleBackupClick = () => {
    setShowCommentModal(true);
  };

  const confirmBackupWithComment = () => {
    setShowCommentModal(false);
    handleCreateBackup(comment);
    setComment("");
  };

  const handleSelectBackup = (name) => {
    if (restoreMode) {
      setSelectedBackup(name);
      setShowModal(true);
    }
  };

  return (
    <div className={styles.wrapper}>
      {restoreMode && <div className={styles.dimOverlay}></div>}
      <section className={styles.mainContent}>
        <h2>Бэкапы сервера</h2>

        <BackupList
          backups={Object.entries(backups)}
          restoreMode={restoreMode}
          selectedBackup={selectedBackup}
          setSelectedBackup={handleSelectBackup}
        />

        <div className={styles.actions}>
          <button onClick={handleBackupClick} disabled={loadingBackup}>
            {loadingBackup ? "Создание..." : "Создать бэкап"}
          </button>
          <button onClick={onEnterRestoreMode}>Восстановить</button>
          <button>Настроить расписание</button>
        </div>

        {showCommentModal && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>Комментарий к бэкапу</h3>
              <textarea
                className={styles.textarea}
                placeholder="Введите комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className={styles.modalActions}>
                <button
                  onClick={confirmBackupWithComment}
                  className={styles.confirmBtn}
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setComment("");
                  }}
                  className={styles.cancelBtn}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {restoreMode && selectedBackup && (
          <RestoreModal
            backup={selectedBackup}
            onConfirm={handleConfirmRestore}
            onCancel={onCancelRestore}
          />
        )}
      </section>
    </div>
  );
};

export default ServerContent;
