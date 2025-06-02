import React, { useState, useEffect, useCallback } from "react";
import styles from "./ServerContent.module.css";
import BackupList from "./BackupList";
import RestoreModal from "./RestoreModal";
import ScheduleModal from "./ScheduleModal";
import ScheduleList from "./ScheduleList";
import BackupCommentModal from "./BackupCommentModal";
import BackupFileTreeModal from "./BackupFileTreeModal";


//TODO для режима восстановления добавить окно при ошибки/
// сделать окно для удаления

const ServerContent = ({ serverAddress }) => {
  const [backups, setBackups] = useState({});
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreMode, setRestoreMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [comment, setComment] = useState("");
  const [backupCompleted, setBackupCompleted] = useState(false);
  const [createdBackupName, setCreatedBackupName] = useState('');

  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const [deletingBackup, setDeletingBackup] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);

  const [selectedBackupFiles, setSelectedBackupFiles] = useState([]);
  const [showFileTreeModal, setShowFileTreeModal] = useState(false);

  const loadBackups = useCallback(async () => {
    if (!serverAddress) return;

    setLoadingBackups(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/get-backups?address=${serverAddress}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      setBackups(data.backups || {});
    } catch (error) {
      console.error("Ошибка загрузки бэкапов:", error);
    } finally {
      setLoadingBackups(false);
    }
  }, [serverAddress]);

  const loadSchedules = useCallback(async () => {
    if (!serverAddress) return;

    setLoadingSchedules(true);
    setScheduleError(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/list-schedules?address=${serverAddress}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!response.ok) throw new Error(response.statusText);
      const data = await response.json();
      setSchedules(data.jobs || []);
    } catch (error) {
      setScheduleError(error.message || "Не удалось загрузить расписания");
      console.error("Ошибка загрузки расписаний:", error);
    } finally {
      setLoadingSchedules(false);
    }
  }, [serverAddress]);

  useEffect(() => {
    loadBackups();
    loadSchedules();
  }, [loadBackups, loadSchedules]);


  useEffect(() => {
    const interval = setInterval(() => {
      loadBackups();
      loadSchedules();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadBackups, loadSchedules]);

  const handleCreateBackup = async (comment) => {
    setLoadingBackup(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/create-backup?address=${serverAddress}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ошибка при создании бэкапа");
      setBackups(prev => ({ [data.backup_name]: comment, ...prev }));
      await loadBackups();
      setCreatedBackupName(data.backup_name);
      setBackupCompleted(true);
    } catch (error) {
      console.error("Ошибка создания бэкапа:", error);
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleDeleteBackup = async (backupName) => {
    if (!window.confirm(`Удалить бэкап ${backupName}?`)) return;
    setDeletingBackup(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/remove-backup?` + 
        `backupName=${encodeURIComponent(backupName)}&` +
        `address=${encodeURIComponent(serverAddress)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Ошибка удаления");
      }
      await loadBackups();
      alert("Бэкап успешно удалён");
    } catch (error) {
      console.error("Ошибка удаления:", error);
      alert(error.message);
    } finally {
      setDeletingBackup(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!serverAddress || !selectedBackup) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/restore-backup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            address: serverAddress, 
            backup: selectedBackup 
          })
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Ошибка восстановления");
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка восстановления:", error);
      throw error;
    }
  };

  const createSchedule = async (type, timeValue, comment) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/schedule-backup?address=${serverAddress}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, time: timeValue, comment })
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Ошибка при создании расписания");
      await loadSchedules();
      return { success: true, data };
    } catch (error) {
      console.error("Ошибка создания расписания:", error);
      return { success: false, error: error.message };
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/cancel-schedule?address=${encodeURIComponent(serverAddress)}&job_id=${encodeURIComponent(scheduleId)}`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Ошибка сервера");
      }
      await loadSchedules();
      return { success: true };
    } catch (error) {
      console.error("Ошибка отмены расписания:", error);
      return { success: false, error: error.message };
    }
  };

  const handleBackupItemClick = (backupName, filesTree) => {
    if (restoreMode) {
      setSelectedBackup(backupName);
    } else {
      setSelectedBackupFiles(filesTree || {});
      setSelectedBackup(backupName);
      setShowFileTreeModal(true);
    }
  };
  
  const handleBackupClick = () => {
    setBackupCompleted(false);
    setShowCommentModal(true);
  };

  const closeBackupModal = () => {
    setShowCommentModal(false);
    setComment("");
    setBackupCompleted(false);
  };

  return (
    <div className={styles.wrapper}>
      {restoreMode && <div className={styles.globalOverlay}></div>}

      <div className={styles.columnsContainer}>
        <section className={`${styles.listColumn} ${styles.backupColumn}`}>
          <h2 className={styles.listTitle}>Бэкапы сервера</h2>
          <BackupList
            backups={Object.entries(backups)}
            restoreMode={restoreMode}
            selectedBackup={selectedBackup}
            setSelectedBackup={setSelectedBackup}
            onDeleteBackup={handleDeleteBackup}
            loading={loadingBackups || deletingBackup}
            onBackupClick={handleBackupItemClick}
          />
        </section>

        <section className={`${styles.listColumn} ${styles.scheduleColumn}`}>
          <h2 className={styles.listTitle}>Запланированные бэкапы</h2>
          <ScheduleList
            schedules={schedules}
            loading={loadingSchedules}
            error={scheduleError}
            onCancelSchedule={handleCancelSchedule}
          />
        </section>
      </div>

      <div className={styles.actions}>
        <button 
          onClick={handleBackupClick} 
          disabled={loadingBackup || restoreMode}
          className={restoreMode ? styles.disabledButton : ''}
        >
          {loadingBackup ? "Создание..." : "Создать бэкап"}
        </button>

        <button 
          onClick={() => restoreMode ? setRestoreMode(false) : setRestoreMode(true)}
          disabled={loadingRestore}
          className={restoreMode ? styles.cancelButton : ''}
        >
          {restoreMode ? "Отмена" : "Восстановить"}
        </button>

        <button 
          onClick={() => setShowScheduleModal(true)}
          disabled={restoreMode || loadingSchedules}
          className={
            `${restoreMode || loadingSchedules ? styles.disabledButton : ''} ${styles.scheduleButton}`
          }
        >
          Настроить расписание
        </button>
      </div>

      <BackupCommentModal
        show={showCommentModal}
        comment={comment}
        loading={loadingBackup}
        isCompleted={backupCompleted}
        backupName={createdBackupName}
        onClose={closeBackupModal}
        onConfirm={() => handleCreateBackup(comment)}
        onCommentChange={setComment}
      />

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onCreate={createSchedule} 
          loading={loadingSchedules}
        />
      )}

      {restoreMode && selectedBackup && (
        <RestoreModal
          backup={selectedBackup}
          onCancel={() => {
            setRestoreMode(false);
            setSelectedBackup(null);
          }}
          onConfirm={handleConfirmRestore}
        />
      )}

      {showFileTreeModal && (
        <BackupFileTreeModal
          show={showFileTreeModal}
          onClose={() => setShowFileTreeModal(false)}
          files={selectedBackupFiles}
          backupName={selectedBackup}
        />
      )}
    </div>
  );
};

export default ServerContent;
