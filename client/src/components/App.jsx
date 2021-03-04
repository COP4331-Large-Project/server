import React from 'react';
import '../scss/App.scss';
import '../scss/Container.scss';
import '../scss/Button.scss';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="Rotated-Container Gradient-Box">
          <div className="Card">
            <h1>COP4331C Large Group #7</h1>
            <a
              className="btn btn-primary"
              href="https://github.com/COP4331-Large-Project/website"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit Our Github
            </a>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
