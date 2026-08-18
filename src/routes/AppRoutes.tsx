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
import { getUserData } from "../services/firebase";

import BodyPage from "../pages/Body__page";
import TodoListPage from "../pages/TodoList__page";


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

const Header: React.FC<HeaderProps> = ({ routes }) => {
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
    <div className="nav_wrap">
      {!user ? (
        <p className="nav_guest">Вы не в системе... войдите...</p>
      ) : (
        <div>
          <Link to="/">
            <button className="nav_link">Навигация</button>
          </Link>
        </div>
      )}
      <div className="current-time">{formatDateTime(currentTime)}</div>
    </div>
  );
};

// const MainPage: React.FC = () => {
//   const user = useAppSelector((state) => state.auth.user);
//   const visibleRoutes = routeConfig.filter(
//     (item) => item.path !== "/" && (!item.isPrivate || Boolean(user))
//   );

//   React.useEffect(() => {
//     const fetchUserData = async () => {
//       if (!user?.uid) return;
//       try {
//         const data = await getUserData(user.uid);
//         console.log("data", data);
//       } catch (err) {
//         console.error("Ошибка при получении данных на главной:", err);
//       }
//     };

//     fetchUserData();
//   }, [user?.uid]);

//   return (
//     <div style={{ padding: "10px" }}>
//       {user && (
//         <div style={{ marginBottom: "10px" }}>
//           <p>
//             <strong>Email:</strong> {user.email}
//           </p>
//           <p>
//             <strong>Имя:</strong> {user.displayName}
//           </p>
//           {user.photoURL && (
//             <img
//               src={user.photoURL}
//               alt="Avatar"
//               style={{ width: "50px", borderRadius: "50%" }}
//             />
//           )}
//         </div>
//       )}

//       <div>
//         <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//           {visibleRoutes.map((route, index) => {
//             if (user && route.isVisibleWhenLoggined) {
//               return (
//                 <Link to={route.path} key={route.path || index}>
//                   <button className="nav_link">
//                     {route.label || route.path}
//                   </button>
//                 </Link>
//               );
//             } else if (!user && !route.isVisibleWhenLoggined) {
//               return (
//                 <div key={route.path || index}>
//                   <Link
//                     to={route.path}
//                     style={{
//                       textDecoration: "none",
//                       color: "blue",
//                       padding: "5px 10px",
//                       border: "1px solid #ccc",
//                       borderRadius: "5px",
//                       backgroundColor: "#fff",
//                     }}
//                   >
//                     {route.label || route.path}
//                   </Link>
//                 </div>
//               );
//             }
//             return <div key={route.path || index} />;
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

const routeConfig: AppRouteItem[] = [
  {
    path: "/login",
    element: <Login />,
    isPrivate: false,
    isVisibleWhenLoggined: false,
    label: "Вход",
  },
  // <Route path="/body_page" element={<BodyPage />} />
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
  // <Route path="/todolist_page" element={<TodoListPage />} />
  {
    path: "/",
    element: <DashboardPage />,
    // <Route path="/" element={<DashboardPage />} />
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