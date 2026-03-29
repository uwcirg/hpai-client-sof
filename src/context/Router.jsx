import { useState, useEffect, useContext, createContext } from "react";
import PropTypes from "prop-types";

const RouterContext = createContext(null);

function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(typeof window !== "undefined" ? window.location.pathname : "/");

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  return <RouterContext.Provider value={{ currentPath, navigate }}>{children}</RouterContext.Provider>;
}

RouterProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used inside RouterProvider");
  }
  return context;
}

function Router({ routes }) {
  const { currentPath } = useRouter();
  return routes[currentPath] || null;
}

Router.propTypes = {
  routes: PropTypes.object.isRequired,
};

export { RouterProvider, Router };
