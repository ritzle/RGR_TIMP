import React from "react";
import styles from "./BackupFileTreeModal.module.css";

const FileItem = ({ name, data, level = 0 }) => {
    const isFile = data === "file" || typeof data !== "object";
    
    return (
      <div className={styles.fileItem} style={{ paddingLeft: `${level * 20}px` }}>
        {isFile ? (
          <span className={styles.file}>
            <span className={styles.fileIcon}>📄</span>
            {name}
          </span>
        ) : (
          <details className={styles.folder}>
            <summary>
              <span className={styles.folderIcon}>📁</span>
              {name}
            </summary>
            {Object.entries(data).map(([childName, childData]) => (
              <FileItem 
                key={childName} 
                name={childName} 
                data={childData} 
                level={level + 1} 
              />
            ))}
          </details>
        )}
      </div>
    );
  };
  

const BackupFileTreeModal = ({ show, onClose, files, backupName }) => {
    if (!show) return null;
  
    const hasFiles = files && typeof files === "object" && Object.keys(files).length > 0;
  
    // Закрыть модалку при клике на overlay
    const handleOverlayClick = () => {
      onClose();
    };
  
    // Остановить всплытие при клике на модальное окно
    const handleModalClick = (e) => {
      e.stopPropagation();
    };
  
    return (
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={styles.modal} onClick={handleModalClick}>
          <div className={styles.modalHeader}>
            <h3>
              Содержимое бэкапа: <span className={styles.backupName}>{backupName}</span>
            </h3>
          </div>
  
          <div className={styles.fileTree}>
            {hasFiles ? (
              Object.entries(files).map(([name, data]) => (
                <FileItem key={name} name={name} data={data} />
              ))
            ) : (
              <p className={styles.emptyMessage}>Бэкап не содержит файлов</p>
            )}
          </div>
  
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  };
  

export default BackupFileTreeModal;