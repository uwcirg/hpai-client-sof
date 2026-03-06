import PropTypes from "prop-types";
import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import "../style/App.scss";
import { FhirClientContext } from "@context/FhirClientContext";
import Report from "@components/Report";
import Summary from "@components/Summary";
import {
  getEnvDashboardURL,
  shouldShowPatientInfo,
} from "../util";
import Header from "./Header";

export default function Content({ children }) {
  const { isReady, client, patient } = useContext(FhirClientContext);
  const showPatientInfo = shouldShowPatientInfo(client);
  return (
    isReady && (
      <Box sx={{ display: "flex" }}>
        <Header returnURL={getEnvDashboardURL()} inEHR={!showPatientInfo} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Toolbar variant="dense" />
          {children}
          {!patient && <Report></Report>}
          {patient && <Summary></Summary>}
          {/* add other components as needed */}
        </Box>
      </Box>
    )
  );
}

Content.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
};
