import * as React from 'react';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {Link as RouterLink} from 'react-router-dom';
import ListItemButton from "@mui/material/ListItemButton";

export default function ListItemLink(props) {
    const { icon, primary, to, selected } = props;

    const renderLink = React.useMemo(
        () =>
            React.forwardRef(function Link(itemProps, ref) {
                return <RouterLink to={to} ref={ref} {...itemProps} role={undefined} />;
            }),
        [to],
    );

    return (
        <div style={{width: "100%"}}>
            <ListItemButton selected={selected} component={renderLink}>
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={primary} />
            </ListItemButton>
        </div>
    );
}

