import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* Logo */}
        <img
          
          className="App-logo"
          alt="Credence logo"
        />

        {/* Title */}
        <h1>Credence</h1>

        {/* Tagline */}
        <p className="subtitle">
          Blockchain-powered academic certificate verification.
        </p>

        {/* Actions */}
        <div className="button-group">
          <button className="primary-btn">Student Portal</button>
          <button className="secondary-btn">University Portal</button>
          <button className="outline-btn">Verify Certificate</button>
        </div>
      </header>
    </div>
  );
}

export default App;
