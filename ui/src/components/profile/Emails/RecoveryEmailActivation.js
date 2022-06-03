import React, {Fragment, useEffect, useState} from "react";
import {Link as RouterLink, useParams, useNavigate, useLocation} from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";

export default function RecoveryEmailActivation() {
    const [isLoading, setIsLoading] = useState("");
    const [notification, setNotification] = useState({type: "", text: ""});
    const params = useParams();

    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        if (params.uid && params.token) {
            const tokens = JSON.parse(localStorage.getItem('authTokens'));
            if (tokens) {
                const accessToken = tokens["access"];
                const {uid, token} = params;
                fetch(`http://127.0.0.1:8000/api/activate_recovery_email/${uid}/${token}/`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }).then(response => {
                    if (response.ok) {
                        navigate("/userprofile/emails", {replace: true});
                    } else if (response.status === 401) {
                        navigate('/signin', {from: location, replace: true});
                    } else {
                        setNotification({type: "error", text: "Something wrong with your email"})
                    }
                })
            } else {
                navigate('/signin', {from: location, replace: true});
            }
        }
    }, [params])

    return (
        <Box>
            <Container maxWidth="xs">
                <Box sx={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {isLoading ?
                        (<Fragment>
                            <p style={{fontSize: 22, textAlign: "center"}}>
                                Activating your recovery email. It may take a few moments...
                            </p>
                            <CircularProgress sx={{mt: 2}}/>
                        </Fragment>) : ""
                    }
                    {
                        notification.type ? (
                            <Fragment>
                                <Alert severity={notification.type} sx={{width: 1}}>
                                    {notification.text}
                                </Alert>
                                <Link sx={{mt: 2}} component={RouterLink} to="/">Home</Link>
                            </Fragment>
                        ) : ""
                    }
                </Box>
            </Container>
        </Box>
    )
}