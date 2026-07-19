import { useState } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Breadcrumb from "../../../components/Breadcrumb";
import { IconButton } from "@mui/material";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import RealEstateSangiraSetup from "./RealEstateSangiraSetup";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div sx={{ p: 3 }}>
          <div>{children}</div>
        </div>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

export default function RealEstateSetups() {
  const [value, setValue] = useState(0);

  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <Breadcrumb />
      <div className="mb-1">
        <IconButton
          onClick={() => navigate(-1)}
          className="bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
        >
          <MdArrowBack />
        </IconButton>
      </div>
      <Box sx={{ bgcolor: "background.paper" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          <Tab label="SANGIRA EXPRIRATION TIME SETUP" {...a11yProps(0)} />
        </Tabs>

        <TabPanel value={value} index={0}>
          <RealEstateSangiraSetup/>
        </TabPanel>
      </Box>
    </>
  );
}
