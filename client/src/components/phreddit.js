import WelcomePage from "./starting-pages/welcome-page.js";
import LoginPage from "./starting-pages/login-page.js";
import RegisterPage from "./starting-pages/register-page.js";
import MainApp from "./main-app-components/main-app.js";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Phreddit() {
  const [view, setView] = useState("empty-page");

  /**
   * Redirect to the main app if logged in or the welcome page if not logged in.
   */
  async function setInitialView() {
    try {
      const res = await axios.get("http://localhost:8000/users/loginStatus",
        {withCredentials: true});
      
      const isLoggedIn = res.data;
      if (isLoggedIn)
        setView("main-app");
      else
        setView("welcome-page");
    } catch (err) {
      setView("welcome-page");
    }
  }

  // Determine initial view for client starting the phreddit web app
  useEffect(() => {
    setInitialView();
  }, []);

  // Determine view of page
  if (view === "welcome-page")
    return <WelcomePage setView={setView} />;
  else if (view === "login-page")
    return <LoginPage setView={setView} />;
  else if (view === "register-page")
    return <RegisterPage setView={setView} />;
  else if (view === "main-app")
    return <MainApp setView={setView} />;
  else
    return null;
}
