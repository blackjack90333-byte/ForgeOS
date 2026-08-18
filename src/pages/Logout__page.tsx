// src/pages/Logout__page.tsx
import React from "react";
import { useAppDispatch } from "../redux/store";
import { logout } from "../redux/authSlice";
import { auth, signOut } from "../services/firebase";

const Logout: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Выход из Firebase Auth
      dispatch(logout()); // Очистка состояния в Redux
      console.log("Пользователь успешно вышел из системы");
    } catch (error: any) {
      console.error("Ошибка при выходе из системы:", error?.message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <button className="logout_button" onClick={handleLogout}>
        Выйти из системы
      </button>
    </div>
  );
};

export default Logout;