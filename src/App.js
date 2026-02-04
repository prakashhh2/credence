import "./App.css";
import logo from "./assets/transparent-logo.png";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="Credence logo"
        />

        <h1>Credence</h1>

        <p className="subtitle">
          Blockchain-powered academic certificate verification.
        </p>

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
