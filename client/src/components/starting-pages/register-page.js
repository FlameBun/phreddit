import { useState } from "react";
import axios from "axios";

export default function RegisterPage({ setView }) {
  // Input states
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: ""
  });

  // Error states
  const [errors, setErrors] = useState({
    firstNameError: "",
    lastNameError: "",
    emailError: "",
    displayNameError: "",
    passwordError: "",
    confirmPasswordError: "",
  });
  const [networkError, setNetworkError] = useState(false);

  // Handle first name input
  function handleFirstName(event) {
    const copyInputs = {
      ...inputs,
      firstName: event.target.value
    }
    setInputs(copyInputs);
  }

  // Handle last name input
  function handleLastName(event) {
    const copyInputs = {
      ...inputs,
      lastName: event.target.value
    }
    setInputs(copyInputs);
  }

  // Handle email input
  function handleEmail(event) {
    const copyInputs = {
      ...inputs,
      email: event.target.value
    }
    setInputs(copyInputs);
  }

  // Handle display name input
  function handleDisplayName(event) {
    const copyInputs = {
      ...inputs,
      displayName: event.target.value
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

  // Handle password confirmation input
  function handleConfirmPassword(event) {
    const copyInputs = {
      ...inputs,
      confirmPassword: event.target.value
    }
    setInputs(copyInputs);
  }

  // Handle user registration after clicking on Sign Up button
  async function handleSignUp() {
    try {
      const res = await axios.post("http://localhost:8000/users/register", inputs);
      console.log(res.data);
      setView("welcome-page"); // Redirect to welcome page
    } catch (error) {
      if (error.code === "ERR_BAD_REQUEST")
        setErrors(error.response.data);
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
      <div id="register-page">
        <h1>phreddit</h1>
        <h2>Sign Up</h2>
        <input
          id="first-name"
          className="text-input"
          type="text"
          placeholder="First Name"
          value={inputs.firstName}
          onChange={handleFirstName}
        />
        {(errors.firstNameError !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + errors.firstNameError}
          </div>
        )}
        <input
          id="last-name"
          className="text-input"
          type="text"
          placeholder="Last Name"
          value={inputs.lastName}
          onChange={handleLastName}
        />
        {(errors.lastNameError !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + errors.lastNameError}
          </div>
        )}
        <input
          id="email"
          className="text-input"
          type="text"
          placeholder="Email"
          value={inputs.email}
          onChange={handleEmail}
        />
        {(errors.emailError !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + errors.emailError}
          </div>
        )}
        <input
          id="display-name"
          className="text-input"
          type="text"
          placeholder="Display Name"
          value={inputs.displayName}
          onChange={handleDisplayName}
        />
        {(errors.displayNameError !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + errors.displayNameError}
          </div>
        )}
        <input
          id="password"
          className="text-input"
          type="password"
          placeholder="Password"
          value={inputs.password}
          onChange={handlePassword}
        />
        {(errors.passwordError !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + errors.passwordError}
          </div>
        )}
        <input
          id="confirm-password"
          className="text-input"
          type="password"
          placeholder="Confirm Password"
          value={inputs.confirmPassword}
          onChange={handleConfirmPassword}
        />
        {(errors.confirmPasswordError !== "") && (
          <div className="input-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            {" " + errors.confirmPasswordError}
          </div>
        )}
        <div id="register-buttons">
          <input
            id="return-button"
            className="buttons"
            type="button"
            value="Return"
            onClick={() => setView("welcome-page")}
          />
          <input className="buttons"
            id="sign-up-button"
            type="button"
            value="Sign Up"
            onClick={handleSignUp}
          />
        </div>
      </div>
    </>
  );
}
