// src/components/Header.tsx
import React from "react";
import { useAppSelector } from "../redux/store";

export const UserProfileWidget: React.FC = () => {
  const { user, loading, error } = useAppSelector((state) => state.auth);

  if (loading) return <p style={{ color: "#888" }}>Загрузка профиля...</p>;
  if (error) return <p style={{ color: "#ff4d4d" }}>Ошибка: {error}</p>;

  if (!user?.email) {
    return (
      <div style={{ color: "#888" }}>
        <p>Вы не авторизованы в системе</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0" }}>
      {user.photoURL && (
        <img
          src={user.photoURL}
          alt="Avatar"
          width="40"
          height="40"
          style={{ borderRadius: "50%", border: "1px solid #333" }}
        />
      )}
      <div>
        <strong style={{ color: "#fff", display: "block" }}>
          {user.displayName || "Оператор"}
        </strong>
        <span style={{ color: "#666", fontSize: "12px" }}>{user.email}</span>
      </div>
    </div>
  );
};

export default UserProfileWidget;