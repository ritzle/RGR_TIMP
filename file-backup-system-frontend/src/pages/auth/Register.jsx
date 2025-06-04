import React, { useState } from "react";
import Modal from "./Modal.jsx";
import styles from "./Register.module.css";


import config from "../../config";



import EyeIcon from './icons/eye.png';
import EyeSlashIcon from './icons/eye-slash.png';

function Register({ onSuccess }) {
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
  const [showPassword, setShowPassword] = useState(false);

  const sanitizeInput = (input) => {
    return input.replace(/[<>'"\\;]/g, '');
  };

  const validateName = (name) => {
    return /^[a-zA-Zа-яА-ЯёЁ\s-]{2,50}$/.test(name);
  };

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const handleInputChange = (field, value) => {
    let sanitizedValue = value;
    
    if (field === 'email' || field === 'password') {
      sanitizedValue = sanitizeInput(value);
    } else {
      sanitizedValue = value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Введите имя";
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = "Имя должно содержать 2-50 букв, пробелы или дефисы";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Введите фамилию";
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = "Фамилия должна содержать 2-50 букв, пробелы или дефисы";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Введите email";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Введите пароль";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Пароль должен содержать: 8+ символов, заглавную букву, цифру и спецсимвол";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const sanitizedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: sanitizeInput(formData.email),
        password: sanitizeInput(formData.password)
      };

      const response = await fetch(`${config.API_BASE_URL}/api/register-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(true);
      } else {
        const message = data.message?.toLowerCase();
        if (message?.includes("используется")) {
          setErrors({ email: "Этот e-mail уже зарегистрирован" });
        } else if (message?.includes("подтверждения")) {
          setErrors({ email: "Почта ожидает подтверждения" });
        } else {
          setErrors({ email: "Ошибка регистрации" });
        }
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setErrors({ email: "Сервер недоступен" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sanitizeInput(formData.email),
          code: sanitizeInput(verificationCode),
        }),
      });

      if (response.ok) {
        onSuccess(formData.email, formData.password);
        return true;
      }
      return false;
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
          maxLength={50}
          className={`${styles.input} ${errors.firstName ? styles.error : ""}`}
        />
        {errors.firstName && (
          <div className={styles.errorMessage}>{errors.firstName}</div>
        )}

        <input
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange("lastName", e.target.value)}
          maxLength={50}
          className={`${styles.input} ${errors.lastName ? styles.error : ""}`}
        />
        {errors.lastName && (
          <div className={styles.errorMessage}>{errors.lastName}</div>
        )}

        <input
          placeholder="E-mail"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          maxLength={100}
          className={`${styles.input} ${errors.email ? styles.error : ""}`}
        />
        {errors.email && (
          <div className={styles.errorMessage}>{errors.email}</div>
        )}

<div className={styles.passwordWrapper}>
          <input
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            maxLength={50}
            className={`${styles.input} ${errors.password ? styles.error : ""}`}
          />
          <button
            type="button"
            className={styles.showPasswordButton}
            onClick={toggleShowPassword}
          >
              {showPassword ? (
    <img src={EyeSlashIcon} alt="Hide password" width="20" height="20" />
  ) : (
    <img src={EyeIcon} alt="Show password" width="20" height="20" />
  )}
          </button>
        </div>
        {errors.password && (
          <div className={styles.errorMessage}>{errors.password}</div>
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