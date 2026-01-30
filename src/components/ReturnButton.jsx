import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getEnvDashboardURL } from "../util";

const ReturnButton = () => {
  const dashboardURL = getEnvDashboardURL();
  if (!dashboardURL) {
    return null;
  }
  return (
    <Button
      color="primary"
      href={dashboardURL + "/clear_session"}
      className="btn-return-url"
      startIcon={<ArrowBackIcon></ArrowBackIcon>}
      size="medium"
      variant="contained"
    >
      Patient List
    </Button>
  );
};

export default ReturnButton;
