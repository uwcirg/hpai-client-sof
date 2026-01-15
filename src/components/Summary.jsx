import React, { useState, useEffect } from "react";
import { Alert, CircularProgress, Stack } from "@mui/material";
import { getEnv } from "@util";

const Summary = () => {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const linkUrl = getEnv("REACT_APP_POPULATE_LINK_URL");
  const timeout = 15000; // time out after 15 seconds

  useEffect(() => {
    const fetchUrl = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(linkUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch URL for content: ${response.statusText} ${response.status}`);
        }

        const responseLinkUrl = await response.text();
        console.log("link URL from request ", responseLinkUrl)
        setLink(responseLinkUrl);
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
          setError(`Request timed out after ${timeout / 1000} seconds`);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (linkUrl) {
      fetchUrl();
    }
  }, [linkUrl]);

  if (loading) {
    return (
      <Stack justifyContent={"center"} alignItems={"center"} p={4}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading content: {error}</Alert>;
  }

  return (
    <iframe
      src={link}
      title="SOF app iframe"
      width="100%"
      height="100%"
      frameBorder={0}
      sandbox="allow-scripts allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation"
    ></iframe>
  );
};

export default Summary;
