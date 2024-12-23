export default function WelcomePage({ setView }) {
  return (
    <>
      <div id="welcome-page">
        <h1>phreddit</h1>
        <input
          id="new-user"
          type="button"
          value="Register as New User"
          onClick={() => setView("register-page")}
        />
        <input
          id="existing-user"
          type="button"
          value="Login as Existing User"
          onClick={() => setView("login-page")}
        />
        <input
          id="guest"
          type="button"
          value="Continue as Guest"
          onClick={() => setView("main-app")}
        />
      </div>
    </>
  );
}
