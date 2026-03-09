import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, Router } from "./context/Router";
import App from "./containers/App";

function Home() {
  return <App></App>;
}

const routes = {
  "/": <Home />,
};

function Index() {
  return (
    <RouterProvider>
      <Router routes={routes} />
    </RouterProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // turn strict mode off as it causes useEffect to be called twice,
  // see issue https://github.com/facebook/react/issues/24455
  // <React.StrictMode>
  <Index />,
  // </React.StrictMode>
);
