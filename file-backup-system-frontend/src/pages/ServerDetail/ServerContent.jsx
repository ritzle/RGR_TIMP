import React, { useState, useEffect, useCallback } from "react";
import styles from "./ServerContent.module.css";
import modalStyles from "./BackupCommentModal.module.css";
import BackupList from "./BackupList";
import RestoreModal from "./RestoreModal";
import ScheduleModal from "./ScheduleModal";
import ScheduleList from "./ScheduleList";
import BackupCommentModal from "./BackupCommentModal";

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
  onCancelRestore,
  serverAddress
}) => {
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [comment, setComment] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState(null);

  const loadSchedules = useCallback(async () => {
    setLoadingSchedules(true);
    setScheduleError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/list-schedules?address=${serverAddress}`);
      const data = await response.json();
      
      if (response.ok) {
        setSchedules(data.jobs || []);
      } else {
        setScheduleError(data.message || "Ошибка загрузки расписаний");
      }
    } catch (error) {
      setScheduleError("Не удалось подключиться к серверу");
      console.error("Ошибка загрузки расписаний:", error);
    } finally {
      setLoadingSchedules(false);
    }
  }, [serverAddress]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const handleCreateSchedule = async (type, timeValue, comment) => {
    try {
      const response = await fetch(`http://localhost:5000/api/schedule-backup?address=${serverAddress}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, time: timeValue, comment })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || "Ошибка сервера" };
      }

      await loadSchedules();
      return { success: true, data };
    } catch (error) {
      console.error("Ошибка создания расписания:", error);
      return { success: false, error: "Ошибка сети" };
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    try {
      const response = await fetch(
        `/api/cancel-schedule/${scheduleId}?address=${serverAddress}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || "Ошибка сервера" };
      }

      await loadSchedules();
      return { success: true };
    } catch (error) {
      console.error("Ошибка отмены расписания:", error);
      return { success: false, error: "Ошибка сети" };
    }
  };

  const handleBackupClick = () => setShowCommentModal(true);

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
      {restoreMode && <div className={styles.globalOverlay}></div>}

      <div className={styles.columnsContainer} style={{ display: 'flex', gap: '20px', padding: '0 20px' }}>
        <section className={styles.mainContent} style={{ flex: 3 }}>
          <h2>Бэкапы сервера</h2>
          <BackupList
            backups={Object.entries(backups)}
            restoreMode={restoreMode}
            selectedBackup={selectedBackup}
            setSelectedBackup={handleSelectBackup}
          />
        </section>

        <section className={styles.schedulesColumn} style={{ flex: 2 }}>
          <h2>Запланированные бэкапы</h2>
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
          onClick={restoreMode ? onCancelRestore : onEnterRestoreMode}
          disabled={loadingRestore}
          className={restoreMode ? styles.cancelButton : ''}
        >
          {restoreMode ? "Отмена" : "Восстановить"}
        </button>
        <button 
          onClick={() => setShowScheduleModal(true)}
          disabled={restoreMode || loadingSchedules}
          className={restoreMode ? styles.disabledButton : ''}
        >
          Настроить расписание
        </button>
      </div>

      <BackupCommentModal
        show={showCommentModal}
        comment={comment}
        loading={loadingBackup}
        onClose={() => {
          setShowCommentModal(false);
          setComment("");
        }}
        onConfirm={confirmBackupWithComment}
        onCommentChange={setComment}
        styles={modalStyles}
      />

      {showScheduleModal && (
        <ScheduleModal
          onClose={() => setShowScheduleModal(false)}
          onCreate={handleCreateSchedule}
          loading={loadingSchedules}
        />
      )}

      {restoreMode && selectedBackup && (
        <RestoreModal
          backup={selectedBackup}
          onConfirm={handleConfirmRestore}
          onCancel={onCancelRestore}
        />
      )}
    </div>
  );
};

export default ServerContent;
