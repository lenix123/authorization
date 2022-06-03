import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ListItemLink from "./ListItemLink";
import {useLocation} from "react-router-dom";

export default function ListMenu(props) {
  const location = useLocation();
  const currentLocation = location.pathname

  return (
    <Box sx={{ width: '17%', height: '93vh', bgcolor: 'background.paper', borderRight: "1px #e0e0e0 solid" }}>
      <nav aria-label="main mailbox folders">
        <List>
          <ListItem disablePadding>
            <ListItemLink
                selected={"/userprofile/profile" === currentLocation || "/userprofile/" === currentLocation}
                to="profile"
                primary="Profile"
                icon={<AssignmentIndOutlinedIcon />}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemLink
                selected={"/userprofile/emails" === currentLocation}
                to="emails"
                primary="Emails"
                icon={<MailOutlineIcon />}
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemLink
                selected={"/userprofile/security" === currentLocation}
                to="security"
                primary="Security"
                icon={<LockOutlinedIcon />}
            />
          </ListItem>
        </List>
      </nav>
    </Box>
  );
}
