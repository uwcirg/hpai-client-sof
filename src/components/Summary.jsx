import React, { useState, useEffect, useContext } from "react";
import { Alert, CircularProgress, Stack } from "@mui/material";
import { FhirClientContext } from "@context/FhirClientContext";
import { getEnv } from "@util";

const Summary = () => {
  const { patient } = useContext(FhirClientContext);
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const questionnaireId = getEnv("REACT_APP_QUESTIONNAIRE_ID");
  // used to make request to retrieve the URL to be used with the iframe
  const populateLinkUrl = questionnaireId ? `/Questionnaire/${questionnaireId}/$populatelink` : "";
  const timeout = 15000; // time out after 15 seconds

  useEffect(() => {
    const fetchUrl = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        setLoading(true);
        setError(null);

        if (!questionnaireId) throw new Error("No Questionnaire ID specified");

        const response = await fetch(populateLinkUrl, {
          method: "POST",
          body: JSON.stringify({ subject: `Patient/${patient?.id}` }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to fetch URL for content: ${response.statusText} ${response.status}`);
        }

        const responseLinkUrl = await response.text();
        console.log("link URL from request ", responseLinkUrl);
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

    if (populateLinkUrl) {
      fetchUrl();
    }
  }, [populateLinkUrl, patient, questionnaireId]);

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
