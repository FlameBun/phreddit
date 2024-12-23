import { useState } from "react";
import axios from "axios";

export default function LoginPage({ setView }) {
  // Input states
  const [inputs, setInputs] = useState({
    email: "",
    password: ""
  });

  // Error states
  const [error, setError] = useState("");
  const [networkError, setNetworkError] = useState(false);

  // Handle email input
  function handleEmail(event) {
    const copyInputs = {
      ...inputs,
      email: event.target.value
    }
    setInputs(copyInputs);
  }

  // Handle password input
  function handlePassword(event) {
    const copyInputs = {
      ...inputs,
      password: event.target.value
    }
    setInputs(copyInputs);
  }

  // Handle user login after clicking on Login button
  async function handleLogin() {
    try {
      const res = await axios.post("http://localhost:8000/users/login", inputs,
        {withCredentials: true});
      console.log(res.data);
      setView("main-app"); // Redirect to main application
    } catch (error) {
      console.log(error);
      if (error.code === "ERR_BAD_REQUEST")
        setError(error.response.data);
      else
        setNetworkError(true);
    }
  }
  
  return (
    <>
      {networkError === true && (
        <div id="error-popup">
          <div id="error-container">
            <h2>NETWORK ERROR</h2>
            <div
              id="error-popup-desc"
            >
              A network error has occurred.
            </div>
            <input
              type="button"
              value="Back to Welcome Page"
              onClick={() => setView("welcome-page")}
            />
          </div>
        </div>
      )}
      <div id="login-page">
        <h1>phreddit</h1>
        <h2>Welcome Back</h2>
        <input
          id="email"
          className="text-input"
          type="text"
          placeholder="Email"
          value={inputs.email}
          onChange={handleEmail}
        />
        <input
          id="password"
          className="text-input"
          type="password"
          placeholder="Password"
          value={inputs.password}
          onChange={handlePassword}
        />
        {(error !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + error}
          </div>
        )}
        <div id="login-buttons">
          <input
            id="return-button"
            className="buttons"
            type="button"
            value="Return"
            onClick={() => setView("welcome-page")}
          />
          <input
            id="login-button"
            className="buttons"
            type="button"
            value="Login"
            onClick={handleLogin}
          />
        </div>
      </div>
    </>
  );
}
