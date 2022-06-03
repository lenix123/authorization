import React, {createRef, useState, useEffect, Fragment} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import {TextValidator, ValidatorForm} from "react-material-ui-form-validator";
import {useNavigate} from "react-router-dom";


export default function TwoFacAuth(props) {
    const {enableTwoFactorAuth, isTwoFacAuthEnabled, secretUrl, resetTwoFactorAuthSetup, disableTwoFactorAuth, otpSecret} = props;
    const [openDialog, setOpenDialog] = useState(false);
    const [password, changePassword] = useState("");

    const navigate = useNavigate();
    useEffect(() => {
        if (secretUrl) {
            navigate('/two_factor_authentication/setup', {state: {secretUrl: secretUrl, otpSecret: otpSecret}});
        }
        return () => {
            resetTwoFactorAuthSetup();
        }
    }, [secretUrl]);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const handleSubmit = () => {
        enableTwoFactorAuth(password);
    }

    const passwordRef = createRef();
    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "password") {
            passwordRef.current.validate(value);
        }
    }

    return (
        <Box sx={{mb: 3}}>
            <Typography variant="h6" component="div" sx={{mt: 3}}>
                Two Factor Authentication
            </Typography>
            {isTwoFacAuthEnabled ? (
                <Fragment>
                    <Typography variant="body2" component="div" sx={{mb: 2, mt: 1, color: "#3c4043"}}>
                        Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.
                    </Typography>
                    <Button color="error"
                            variant="contained"
                            disableElevation
                            size="small"
                            onClick={disableTwoFactorAuth}
                    >
                        Disable
                    </Button>
                </Fragment>
            ) : (
                <Fragment>
                    <Typography variant="body2" component="div" sx={{mb: 2, mt: 1, color: "#3c4043"}}>
                        Prevent hackers from accessing your account with an additional layer of security.
                        When you sign in, two-factor authentication helps make sure your personal information stays private,
                        safe and secure.
                    </Typography>
                    <Button variant="contained" onClick={handleOpenDialog}>
                        Enable two factor authentication
                    </Button>
                    <Dialog open={openDialog} onClose={handleCloseDialog}>
                        <DialogTitle>Confirm access</DialogTitle>
                        <ValidatorForm component="form" onSubmit={handleCloseDialog} instantValidate={false}>
                            <DialogContent>
                                <DialogContentText>
                                    To enable two-factor authentication, please enter your password in order to verify that it's you.
                                </DialogContentText>
                                <TextValidator
                                    ref={passwordRef}
                                    onBlur={handleBlur}
                                    value={password}
                                    onChange={e => changePassword(e.target.value)}
                                    sx={{mt: 1, mb: 1}}
                                    size="small"
                                    fullWidth
                                    autoFocus
                                    label="Password"
                                    name="password"
                                    type="password"
                                    variant="standard"
                                    validators={['required']}
                                    errorMessages={['this field is required']}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDialog}>Cancel</Button>
                                <Button onClick={handleSubmit} variant="contained" disableElevation type="submit">
                                    confirm
                                </Button>
                            </DialogActions>
                        </ValidatorForm>
                    </Dialog>
                </Fragment>
            )}
        </Box>
    )
}