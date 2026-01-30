import * as React from "react";
import PropTypes from "prop-types";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

export default function Error(props) {
  const { message, containerStyle } = props;
  const getMessage = () => {
    if (!message) return "";
    if (typeof message !== "string" && message?.message) {
      return message.message;
    }
    if (typeof message !== "string") {
      if (Array.isArray(message)) {
        return (
          <ul>
            {message.map((m, index) => (
              <li key={`errormessage_${index}`}>{m}</li>
            ))}
          </ul>
        );
      }
      return "Error occurred. See console for detail.";
    }
    return message;
  };
  const messageToBeRendered = getMessage();
  const isString = typeof messageToBeRendered === "string";
  const alertParams = {
    severity: props.severity ?? "error",
    variant: "filled",
    sx: props.sx,
    icon: props.icon
  };
  return (
    <Box className="error-container" sx={containerStyle ?? {}}>
      {isString && (
        <Alert {...alertParams}>
          <div dangerouslySetInnerHTML={{ __html: messageToBeRendered }}></div>
        </Alert>
      )}
      {!isString && <Alert {...alertParams}>{messageToBeRendered}</Alert>}
    </Box>
  );
}

Error.propTypes = {
  message: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.array]),
  severity: PropTypes.string,
  sx: PropTypes.object,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  containerStyle: PropTypes.object
};
