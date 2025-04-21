import React from "react";
import styles from "./ScheduleList.module.css";

const ScheduleList = ({ 
  schedules, 
  loading, 
  error, 
  onCancelSchedule 
}) => {
  return (
    <div className={styles.scheduleListContainer}>
      <div className={styles.scrollArea}>
        {loading ? (
          <p className={styles.loading}>Загрузка расписаний...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : schedules.length > 0 ? (
          schedules.map((schedule, index) => (
            <div 
              key={schedule.id}
              className={styles.scheduleItem}
              style={{ '--order': index }}
            >
              <div className={styles.scheduleInfo}>
                <p className={styles.scheduleType}>
                  {schedule.type === "interval" 
                    ? `Каждые ${schedule.minutes} минут` 
                    : `Ежедневно в ${schedule.time}`}
                </p>
                {schedule.comment && (
                  <p className={styles.scheduleComment}>{schedule.comment}</p>
                )}
              </div>
              <button
                onClick={() => onCancelSchedule(schedule.id)}
                className={styles.cancelButton}
                disabled={loading}
              >
                Отменить
              </button>
            </div>
          ))
        ) : (
          <p className={styles.empty}>Нет активных расписаний</p>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;