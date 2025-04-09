import React from "react";
import { useParams } from "react-router-dom";
import styles from "./ServerDetail.module.css";

const ServerDetail = () => {
  const { name, ip } = useParams(); 

    console.log("Сервер:", decodeURIComponent(name), decodeURIComponent(ip));


  // useEffect для получения данных

  return (
    <div className={styles.container}>
      {/* Левая часть — инфа о сервере */}
      <aside className={styles.sidebar}>
        <h2>Информация о сервере</h2>
        <p><strong>Название:</strong> {decodeURIComponent(name)}</p>
        <p><strong>IP-адрес:</strong> {decodeURIComponent(ip)}</p>
        <p><strong>Статус:</strong> 🟢 Активен</p>
        <p><strong>Последний бэкап:</strong> 5 минут назад</p>
      </aside>

      {/* Правая часть — управление бэкапами */}
      <section className={styles.mainContent}>
        <h2>Бэкапы сервера</h2>

        {/* Список бэкапов (заглушка) */}
        <div className={styles.backupList}>
          <p>Бэкап 1 — 10.04.2025 12:00</p>
          <p>Бэкап 2 — 09.04.2025 18:00</p>
          {/* ... */}
        </div>

        {/* Кнопки управления */}
        <div className={styles.actions}>
          <button>Создать бэкап</button>
          <button>Восстановить</button>
          <button>Настроить расписание</button>
          <button>Тестировать доступ</button>
        </div>
      </section>
    </div>
  );
};

export default ServerDetail;
