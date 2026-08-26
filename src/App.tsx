// src/App.tsx
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { listenToAuthChanges } from "./services/firebase";
import { setUser, clearUser } from "./redux/authSlice";
import AppRoutes from "./routes/AppRoutes";
import { store } from "./redux/store";
import { AuthUser } from "./types";


function AppRoutesWrap(): React.JSX.Element {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = listenToAuthChanges((firebaseUser) => {
      if (firebaseUser) {
        const userData: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        dispatch(setUser(userData));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <AppRoutes />;
}

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <AppRoutesWrap />
    </Provider>
  );
}

export default App;