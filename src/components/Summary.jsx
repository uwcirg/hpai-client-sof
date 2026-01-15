import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Box, CircularProgress, Alert } from "@mui/material";
import { getEnv } from "@util";

const Summary = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentUrl = getEnv("REACT_APP_IFRAME_URL");
  const timeout = 15000; // time out after 15 seconds

  useEffect(() => {
    const fetchContent = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(contentUrl, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText} ${response.status}`);
        }

        const html = await response.text();
        setHtmlContent(html);
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

    if (contentUrl) {
      fetchContent();
    }
  }, [contentUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Error loading content: {error}</Alert>;
  }

  return <Box className="content-container" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />;
};

export default Summary;
