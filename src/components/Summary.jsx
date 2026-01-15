import { useEffect } from "react";
import { getEnv } from "@util";
export default function Summary() {
  const handleMessage = (event) => {
    if (!event) return;
    console.log("Received a message from " + event.origin + ".");
  };
  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return window.removeEventListener("message", handleMessage);
  }, []);
  return (
    <section className="summary-wrapper">
      <iframe
        src={getEnv("REACT_APP_IFRAME_URL")}
        title="SOF app iframe"
        width="100%"
        height="100%"
        frameBorder={0}
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation"
      ></iframe>
    </section>
  );
}
