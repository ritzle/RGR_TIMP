import React from "react";
import styles from "./BackupList.module.css";

const BackupList = ({ backups, ...rest }) => (
  <div className={styles.backupListContainer}>
    <div className={styles.scrollArea}>
      {backups.length > 0 ? (
        backups.map(([name, data], index) => (
          <div
            key={index}
            className={`${styles.backupItem} ${rest.restoreMode ? styles.selectable : ''} ${
              rest.selectedBackup === name ? styles.selected : ''
            }`}
            onClick={() => {
              if (rest.restoreMode) {
                rest.setSelectedBackup(name);
              } else {
                rest.onBackupClick(name, data.tree);
              }
            }}
          >
            <div className={styles.backupInfo}>
              <div className={styles.backupHeader}>
                <p className={styles.backupName}>{name}</p>
                <p className={styles.backupDate}>{data.created_at}</p>
              </div>

              <div className={styles.commentContainer}>
                {data.comment ? (
                  <p className={styles.backupComment}>{data.comment}</p>
                ) : (
                  <p className={styles.emptyComment}>&nbsp;</p>
                )}
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.downloadButton}
                onClick={(e) => {
                  e.stopPropagation();
                  rest.onDownloadBackup(name);
                }}
                disabled={rest.loading}
              >
                Скачать
              </button>

              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  rest.onDeleteBackup(name);
                }}
                disabled={rest.loading}
              >
                Удалить
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.noBackups}>Нет доступных бэкапов</p>
      )}
    </div>
  </div>
);

export default BackupList;
