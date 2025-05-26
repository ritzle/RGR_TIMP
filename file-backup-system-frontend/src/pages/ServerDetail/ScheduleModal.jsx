import React, { useState } from "react";
import styles from "./ScheduleModal.module.css";

const ScheduleModal = ({ onClose, onCreate }) => {
  const [scheduleType, setScheduleType] = useState("daily");
  const [time, setTime] = useState("17:00");
  const [minutes, setMinutes] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (scheduleType === "daily" && !time) {
      setError("Укажите время для ежедневного бэкапа");
      return;
    }
    
    if (scheduleType === "interval") {
      const mins = parseInt(minutes);
      if (isNaN(mins) || mins < 1) {
        setError("Интервал должен быть не менее 1 минуты");
        return;
      }
    }

    setLoading(true);
    setError(null);
    
    const result = await onCreate(
      scheduleType,
      scheduleType === "daily" ? time : parseInt(minutes),
      comment
    );
    
    if (result.success) {
      onClose();
    } else {
      setError(result.error || "Ошибка при создании расписания");
    }
    
    setLoading(false);
  };

  const handleMinutesChange = (e) => {
    const value = e.target.value;
    // Разрешаем только цифры и пустую строку
    if (value === "" || /^[0-9]+$/.test(value)) {
      setMinutes(value);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Новое расписание бэкапов</h3>
        
        <div className={styles.formGroup}>
          <label>Тип расписания:</label>
          <select
            value={scheduleType}
            onChange={(e) => setScheduleType(e.target.value)}
            className={styles.select}
          >
            <option value="daily">Ежедневно</option>
            <option value="interval">С интервалом</option>
          </select>
        </div>
        
        {scheduleType === "daily" ? (
          <div className={styles.formGroup}>
            <label>Время выполнения:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={styles.timeInput}
            />
          </div>
        ) : (
          <div className={styles.formGroup}>
            <label>Интервал (минуты):</label>
            <input
              type="text"
              min="1"
              value={minutes}
              onChange={handleMinutesChange}
              className={styles.numberInput}
              placeholder="Введите интервал"
            />
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label>Комментарий (необязательно):</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={styles.commentInput}
            placeholder="Описание расписания"
          />
        </div>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.modalActions}>
          <button
            onClick={onClose}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={styles.confirmBtn}
          >
            {loading ? "Создание..." : "Создать расписание"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;