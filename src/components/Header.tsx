// src/components/Header.tsx (или Dashboard.tsx)
import React from "react";
import { useAppSelector } from "../redux/store";

const Dashboard: React.FC = () => {
  const { user, loading, error } = useAppSelector((state) => state.auth);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error}</p>;

  if (!user?.email) {
    return (
      <div>
        <h1>Вы не залогинились... повторите попытку...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Добро пожаловать, {user.displayName || "Гость"}!</h1>
      <p>Email: {user.email}</p>
      {user.photoURL && (
        <img src={user.photoURL} alt="Avatar" width="50" style={{ borderRadius: "50%" }} />
      )}
    </div>
  );
};

export default Dashboard;