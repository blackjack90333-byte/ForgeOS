// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate, Link, HashRouter } from "react-router-dom";
import { useAppSelector } from "../redux/store";

// Компоненты
import Login from "../components/Login";
import DashboardPage from "../pages/Dashboard__page";
import NoFapPage from "../pages/NoFap__page";
import CountMoneyPage from "../pages/CountMoney__page";
import Logout from "../pages/Logout__page";
import BodyPage from "../pages/Body__page";
import TodoListPage from "../pages/TodoList__page";
import QuestPage from "../pages/Quest__page";
import SkillsPage from "../pages/Skills__page";
import BackgroundAudioPlayer from "../components/BackgroundAudioPlayer";
import LoopWorkoutPage from "../pages/LoopWorkout__page";

export interface AppRouteItem {
  path: string;
  element: React.ReactElement;
  isPrivate: boolean;
  isVisibleWhenLoggined: boolean;
  label?: string;
}

interface HeaderProps {
  routes: AppRouteItem[];
}

const Header: React.FC<HeaderProps> = () => {
  const user = useAppSelector((state) => state.auth.user);
  const [currentTime, setCurrentTime] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatDateTime = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  return (
    <div
      className="nav_wrap"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px",
        // padding: "0 10px",
      }}
    >
      {!user ? (
        <p className="nav_guest">Вы не в системе... войдите...</p>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/">
            <button className="nav_link">Навигация</button>
          </Link>
          {/* Плеер фоновой музыки в шапке */}
          <BackgroundAudioPlayer videoId="RG2IK8oRZNA" />
          <div className="current-time">{formatDateTime(currentTime)}</div>
        </div>
      )}
    </div>
  );
};

const routeConfig: AppRouteItem[] = [
  {
    path: "/login",
    element: <Login />,
    isPrivate: false,
    isVisibleWhenLoggined: false,
    label: "Вход",
  },
  {
    path: "/body_page",
    element: <BodyPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Физическое состояние тела",
  },
  {
    path: "/logout",
    element: <Logout />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Выход",
  },
  {
    path: "/nofap_page",
    element: <NoFapPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Трекер воздержания",
  },
  {
    path: "/todolist_page",
    element: <TodoListPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Таблица Сделать Дела",
  },
  {
    path: "/quest_page",
    element: <QuestPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Сделать квест (Цепочка дел)",
  },
  {
    path: "/",
    element: <DashboardPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Главный Дашборд",
  },
  {
    path: "/countmoney_page",
    element: <CountMoneyPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Трекер денег",
  },
  {
    path: "/skills_page",
    element: <SkillsPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Мои скиллы и ачивки",
  },
  {
    path: "/loop_workout_page",
    element: <LoopWorkoutPage />,
    isPrivate: true,
    isVisibleWhenLoggined: true,
    label: "Loop Тренировка (Таймер)",
  },
];

interface PrivateRouteProps {
  children: React.ReactElement;
  isPrivate: boolean;
  path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isPrivate, path }) => {
  const user = useAppSelector((state) => state.auth.user);

  if (isPrivate && !user) {
    return <Navigate to="/login" replace />;
  } else if (!isPrivate && user && path === "/login") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <div className="BrowserRouter_wrap">
        <Header routes={routeConfig.filter((route) => Boolean(route.label))} />
        <Routes>
          {routeConfig.map((route, index) => (
            <Route
              key={route.path || index}
              path={route.path}
              element={
                <PrivateRoute isPrivate={route.isPrivate} path={route.path}>
                  {route.element}
                </PrivateRoute>
              }
            />
          ))}
        </Routes>
      </div>
    </HashRouter>
  );
};

export default AppRoutes;