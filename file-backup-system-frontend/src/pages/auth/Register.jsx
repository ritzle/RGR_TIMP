import React, { useState } from "react";
import Modal from "./Modal.jsx";
import styles from "../../styles/Form.module.css";

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [loading, setLoading] = useState(false);


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    const newErrors = {};
  
    if (!formData.firstName.trim()) newErrors.firstName = "Введите имя";
    if (!formData.lastName.trim()) newErrors.lastName = "Введите фамилию";
  
    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = "Неверный формат email";
    }
  
    if (!formData.password.trim()) newErrors.password = "Введите пароль";
  
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
  
    try {
      setLoading(true); // 👈 запуск индикатора
  
      const response = await fetch("http://localhost:5000/api/register-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setShowModal(true);
      } else {
        const message = data.message?.toLowerCase();
  
        if (message?.includes("используется")) {
          setFormData((prev) => ({ ...prev, email: "" }));
          setErrors({ email: "Этот e-mail уже зарегистрирован. Попробуйте войти." });
        } else if (message?.includes("подтверждения")) {
          setErrors({ email: "Эта почта уже ожидает подтверждения. Проверьте email." });
        } else {
          setErrors({ email: "Ошибка регистрации. Попробуйте позже." });
        }
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setErrors({ email: "Сервер недоступен. Попробуйте позже." });
    } finally {
      setLoading(false); // 👈 стоп индикатора
    }
  };
  

  const handleVerify = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Ошибка:", error);
      return false;
    }
  };

  return (
    <>
      <div className={styles.authForm}>
        <input
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange("firstName", e.target.value)}
          className={`${styles.input} ${errors.firstName ? styles.error : ""}`}
        />
        {errors.firstName && (
          <div className={styles.errorMessage}>{errors.firstName}</div>
        )}

        <input
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          className={`${styles.input} ${errors.lastName ? styles.error : ""}`}
        />
        {errors.lastName && (
          <div className={styles.errorMessage}>{errors.lastName}</div>
        )}

        <input
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className={`${styles.input} ${errors.email ? styles.error : ""}`}
        />
        {errors.email && (
          <div className={styles.errorMessage}>
            {typeof errors.email === "string" ? errors.email : "Неверный email"}
          </div>
        )}

        <input
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          className={`${styles.input} ${errors.password ? styles.error : ""}`}
        />
        {errors.password && (
          <div className={styles.errorMessage}>
            {typeof errors.password === "string" ? errors.password : "Введите пароль"}
          </div>
        )}

<button
  className={styles.button}
  onClick={handleRegister}
  disabled={loading}
>
  {loading ? "Отправка..." : "Sign Up"}
</button>

      </div>

      {showModal && (
        <Modal
          code={verificationCode}
          setCode={setVerificationCode}
          onVerify={handleVerify}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

export default Register;
