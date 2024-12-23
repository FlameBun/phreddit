export default function PopUp({ setView, mainContent, setMainContent, onConfirmation }) {
  function handleCancel() {
    setMainContent({
      ...mainContent,
      popUp: undefined,
      type: null
    });
  }

  return (
    <div id="error-popup">
      <div id="error-container">
        {mainContent.type === "error" && (
          <>
            <h2>ERROR</h2>
            <div
              id="error-popup-desc"
            >
              {mainContent.message}
            </div>
            <input
              type="button"
              value="Back to Welcome Page"
              onClick={() => setView("welcome-page")}
            />
          </>
        )}
        {mainContent.type === "confirmation" && (
          <>
            <h2>Are you sure?</h2>
            <div id="error-popup-desc">
              Are you sure you want to delete this?
            </div>
            <div id="cancel-confirmation">
              <input
                type="button"
                value="Cancel"
                onClick={handleCancel}
              />
              <input
                type="button"
                value="Delete"
                onClick={onConfirmation}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}