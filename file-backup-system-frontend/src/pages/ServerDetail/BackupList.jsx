import React from "react";
import styles from "./BackupList.module.css";

const BackupList = ({ backups, restoreMode, selectedBackup, setSelectedBackup }) => (
  <div className={styles.backupListContainer}>
    <div className={styles.scrollArea}>
      {backups.length > 0 ? (
        backups.map(([name, comment], index) => (
          <div
            key={index}
            className={`${styles.backupItem} ${restoreMode ? styles.selectable : ""} ${selectedBackup === name ? styles.selected : ""}`}
            onClick={() => {
              if (restoreMode) setSelectedBackup(name);
            }}
          >
            <p className={styles.backupName}>{name}</p>
            {comment && <p className={styles.backupComment}>{comment}</p>}
          </div>
        ))
      ) : (
        <p className={styles.noBackups}>Нет доступных бэкапов</p>
      )}
    </div>
  </div>
);

export default BackupList;
