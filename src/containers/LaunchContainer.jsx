import React from "react";
import FHIR from "fhirclient";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider } from "@mui/material/styles";
import { queryNeedPatientBanner, queryPatientIdKey } from "@consts";
import { fetchEnvData, getEnv } from "@util";
import { getTheme } from "@config/theme_config";
import ErrorComponent from "@components/ErrorComponent";
import "../style/App.scss";
import ReturnButton from "@components/ReturnButton";

const fetchContextJson = async (authURL) => {
  if (!authURL) {
    // default, if no auth url provided
    return {
      clientId: "hpai_sof_client",
      scope: "profile roles email patient/*.read",
      // default to not show patient banner, can be overridden
      // cannot seem to override this when testing against SMART healthIT launcher though
      need_patient_banner: false,
    };
  }
  const response = await fetch(authURL, {
    // include cookies in request
    credentials: "include",
  }).catch((e) => {
    console.log(e);
    throw new Error("Error retrieving context json via auth url. See console for detail.");
  });

  if (!response.ok) {
    console.log(response.status, response.statusText);
    throw new Error(`Error launch application: Server returned status ${response.status.toString()}`);
  }

  const contextJson = await response.json().catch((e) => {
    console.log(e);
    throw new Error("Context json parsing error. See console for detail.");
  });

  return contextJson;
};

function reducer(state, action) {
  if (action.type === "loading") {
    return {
      loading: true,
      authorized: false,
      error: "",
    };
  }
  if (action.type === "authorized") {
    return {
      loading: false,
      authorized: true,
      error: "",
    };
  }
  if (action.type === "error") {
    return {
      loading: false,
      authorized: false,
      error: action.payload || "Application error.",
    };
  }
  throw Error("Unknown action. ", action.type);
}

export default function Launch() {
  const [state, dispatch] = React.useReducer(reducer, { loading: true, authorized: false, error: "" });

  React.useEffect(() => {
    fetchEnvData().then((results) => {
      console.log("environment variables ", results);
      const backendURL = getEnv("REACT_APP_CONF_API_URL");
      const authURL = backendURL ? `${backendURL}/auth/auth-info` : "";
      const urlParams = new URLSearchParams(window.location.search);
      const patientId = urlParams.get("patient");
      console.log("patient id from url query string: ", patientId);
      const needPatientBanner = urlParams.get("need_patient_banner");
      console.log("need_patient_banner from url query string: ", needPatientBanner);
      console.log("Auth url ", authURL);

      fetchContextJson(authURL)
        .then((json) => {
          if (!json) {
            dispatch({ type: "error", payload: "No valid context json specified" });
            return;
          }
          if (patientId) {
            json.patientId = patientId;
            sessionStorage.setItem(queryPatientIdKey, patientId);
          }

          if (needPatientBanner !== null) {
            json.need_patient_banner = needPatientBanner;
            sessionStorage.setItem(queryNeedPatientBanner, needPatientBanner);
          }

          // allow client id to be configurable
          const envClientId = getEnv("REACT_APP_CLIENT_ID");
          if (envClientId) json.clientId = envClientId;

          // allow auth scopes to be updated via environment variable
          // see https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html
          const envAuthScopes = getEnv("REACT_APP_AUTH_SCOPES");
          if (envAuthScopes) json.scope = envAuthScopes;

          sessionStorage.setItem("launchContextJson", JSON.stringify(json));

          console.log("launch context json ", json);
          FHIR.oauth2
            .authorize(json)
            .then(() => {
              dispatch({ type: "authorized" });
            })
            .catch((e) => {
              console.log("FHIR auth error ", e);
              dispatch({ type: "error", payload: "Fhir auth error. see console for detail." });
            });
        })
        .catch((error) => dispatch({ type: "error", payload: error?.message }));
    });
  }, []);

  return (
    <ThemeProvider theme={getTheme()}>
      {state.error && (
        <Stack spacing={1} direction="column" alignItems="flex-start" sx={{ padding: 1, width: "100%" }}>
          <ErrorComponent message={state.error} containerStyle={{ width: "100%" }}></ErrorComponent>
          <ReturnButton />
        </Stack>
      )}
      {state.loading && (
        <Stack spacing={2} direction="row" sx={{ padding: (theme) => theme.spacing(3) }} alignItems="center">
          <CircularProgress></CircularProgress>
          <div>Launching ...</div>
        </Stack>
      )}
    </ThemeProvider>
  );
}
