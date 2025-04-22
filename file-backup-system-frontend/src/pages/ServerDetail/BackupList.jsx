import React from "react";
import styles from "./BackupList.module.css";

const BackupList = ({ backups, restoreMode, selectedBackup, setSelectedBackup }) => (
  <div className={styles.backupListContainer}>
    <div className={styles.scrollArea}>
      {backups.length > 0 ? (
        backups.map(([name, comment, size, date], index) => (
          <div
            key={index}
            className={`${styles.backupItem} ${restoreMode ? styles.selectable : ""} ${selectedBackup === name ? styles.selected : ""}`}
            onClick={() => restoreMode && setSelectedBackup(name)}
          >
            <div className={styles.backupInfo}>
              <div className={styles.backupHeader}>
                <p className={styles.backupName}>{name}</p>
              </div>
              
              {comment && (
                <div className={styles.backupCommentContainer}>
                  <p className={styles.backupComment}>{comment}</p>
                </div>
              )}
              
              <div className={styles.backupMeta}>
                {size && <span className={styles.backupSize}>{size}</span>}
                {date && <span className={styles.backupDate}>{date}</span>}
              </div>
            </div>
            
            {restoreMode && (
              <div className={styles.backupActions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBackup(name);
                  }}
                >
                  {selectedBackup === name ? "Выбран" : "Выбрать"}
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className={styles.noBackups}>Нет доступных бэкапов</p>
      )}
    </div>
  </div>
);

export default BackupList;