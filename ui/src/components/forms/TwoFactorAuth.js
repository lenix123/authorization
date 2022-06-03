import React, {createRef, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import {ValidatorForm, TextValidator} from "react-material-ui-form-validator";
import Button from "@mui/material/Button";
import {authTwoFactorCode, deleteTwoFactorToken, resetTwoFacError} from "../../store/auth/actions";
import {connect} from "react-redux";
import Alert from "@mui/material/Alert";

function TwoFactorAuth(props) {
    const [showPage, setShowPage] = useState(false);
    const [code, changeCode] = useState("");
    const {authTwoFactorCode, deleteTwoFactorToken, twoFactorError, resetTwoFacError, status, isAuthenticated} = props;
    const [notification, setNotification] = useState({type: "", text: ""});
    const location = useLocation();

    const navigate = useNavigate();
    useEffect(() => {
        if (location.state &&location.state.isTwoFactorAuthRequired) {
            setShowPage(true);
        } else {
            navigate("/", {replace: true});
        }
        return () => {
            deleteTwoFactorToken();
        }
    }, [location])

    useEffect(() => {
        if (status === 200 && isAuthenticated) {
            const from = location.state?.from?.pathname || "/";
            navigate(from, {replace: true});
        } else if (twoFactorError) {
            setNotification({type: "error", text: twoFactorError});
        } else if (twoFactorError === "") {
            setNotification({type: "", text: ""});
        }
    }, [status, isAuthenticated, twoFactorError])

    const codeRef = createRef();
    const handleBlur = (event) => {
        const {name, value} = event.target;
        if (name === "code") {
            codeRef.current.validate(value);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            { showPage ? (
                <Box
                    sx={{
                        marginTop: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    {
                        notification.type ? (
                            <Alert severity={notification.type} sx={{width: 0.8, mb: 2}} onClose={resetTwoFacError}>
                                {notification.text}<br/>
                            </Alert>
                        ) : ""
                    }
                    <Typography component="h1" variant="h5">
                        Two-factor authentication
                    </Typography>
                    <Box sx={{
                        p: 2,
                        mt: 2,
                        width: 0.8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: "1px solid #e5e5e5",
                        borderRadius: 3
                    }}>
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography>
                            Authentication code
                        </Typography>
                        <ValidatorForm component="form"
                                       instantValidate={false}
                                       onSubmit={() => {authTwoFactorCode(code)}}
                                       style={{width: "100%"}}>
                            <TextValidator
                                ref={codeRef}
                                margin="normal"
                                fullWidth
                                value={code}
                                onChange={e => changeCode(e.target.value)}
                                name="code"
                                label="6-digit code"
                                size="small"
                                id="code"
                                autoFocus
                                onBlur={handleBlur}
                                validators={['required', 'isNumber', 'minNumber:99999', 'maxNumber:999999']}
                                errorMessages={['this field is required', "doesn't match the required mask", "doesn't match the required mask", "doesn't match the required mask"]}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                size="small"
                                variant="contained"
                                sx={{ mt: 1, mb: 2 }}
                            >
                                Verify
                            </Button>
                        </ValidatorForm>
                        <Typography variant="body2">
                            Open the two-factor authenticator (TOTP) app
                            on your mobile device to view your authentication code.
                        </Typography>
                    </Box>
                </Box>
            ) :  ""}
        </Container>
    )
}

const mapStateToProps = (state) => {
    return {
        twoFactorError: state.auth.twoFactorError,
        status: state.auth.status,
        isAuthenticated: state.auth.isAuthenticated
    }
}

const mapDispatchToProps = {
    authTwoFactorCode,
    deleteTwoFactorToken,
    resetTwoFacError
}

export default connect(mapStateToProps, mapDispatchToProps)(TwoFactorAuth);