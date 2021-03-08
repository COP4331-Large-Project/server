import React from 'react';
import '../scss/App.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <div className="App">
            <header className="App-header">
              <div className="Rotated-Container Gradient Box">
                <div className="Card">
                  <h1>COP4331C Large Group #7</h1>
                </div>
              </div>
            </header>
          </div>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
