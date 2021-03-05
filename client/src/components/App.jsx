import React from 'react';
import '../scss/App.scss';
import '../scss/Container.scss';
import '../scss/Button.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Catalogue from './Catalogue.jsx';

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
                  <a
                    className="btn btn-primary"
                    href="https://github.com/COP4331-Large-Project/website"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi-github"> </i>
                    Visit Our Github
                  </a>
                </div>
              </div>
            </header>
          </div>
        </Route>
        <Route exact path="/catalogue" component={Catalogue} />
      </Switch>
    </Router>
  );
}

export default App;
