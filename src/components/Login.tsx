// src/components/Login.tsx
import React from "react";
import { useAppDispatch } from "../redux/store";
import { loginStart, loginSuccess, loginFailure } from "../redux/authSlice";
import { auth, provider, signInWithPopup, db } from "../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { AuthUser, UserDocument } from "../types";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleGoogleLogin = async () => {
    console.log("попытка залогиниться...");
    dispatch(loginStart());

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("result", result);

      // Извлекаем только нужные сериализуемые данные
      const user: AuthUser = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
      };

      // Проверяем, существует ли пользователь в базе данных
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Если пользователя нет, создаем документ с начальными данными
        const initialUserData: UserDocument = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL || null,
          nofap_timestamp: 0,
          nofap_links: [
            {
              link: "https://drive.google.com/file/d/1pwPKr-wq0yw-ZTyHwGxOyqOit9_BXXEV/view?usp=drive_link",
              note: "почитай гайд на сексуальную энергию",
            },
            {
              link: "https://www.youtube.com/watch?v=CwGQiTCrqEA&list=PLB5lKOLFXiEfstpsfl7UcdvwBV6TpqG7G&pp=gAQB",
              note: "отвлекись, посмотри видео",
            },
          ],
        };

        try {
          await setDoc(userRef, initialUserData);
        } catch (error) {
          console.error("Ошибка при создании документа пользователя:", error);
        }
      }

      dispatch(loginSuccess(user));
    } catch (error: any) {
      console.error("Ошибка входа:", error?.message);
      dispatch(loginFailure(error?.message || "Неизвестная ошибка при входе"));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <button onClick={handleGoogleLogin} className="login_button">
        Войти через Google
      </button>
    </div>
  );
};

export default Login;