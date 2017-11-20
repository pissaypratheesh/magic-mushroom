
//import '../assets/css/main.css';
import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "mobx-react";
import { AppContainer } from "react-hot-loader";
import { rehydrate, hotRehydrate } from "rfx-core";
import { isProduction } from "./config/constants";
import App from "./pages/App";
import stores from "./stores/stores";

const store = rehydrate();

const renderApp = Component => {
  render(
    <AppContainer>
      <Router>
        <Provider store={isProduction ? store : hotRehydrate()}>
          <App />
        </Provider>
      </Router>
    </AppContainer>,
    document.getElementById("app")
  );
};

renderApp(App);

if (module.hot) {
  module.hot.accept(() => renderApp(App));
}
