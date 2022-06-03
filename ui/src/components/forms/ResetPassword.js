import React, {createRef, Fragment, useEffect, useState} from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import EmailIcon from '@mui/icons-material/Email';
import Typography from "@mui/material/Typography";
import {ValidatorForm, TextValidator} from "react-material-ui-form-validator";
import Button from "@mui/material/Button";
import {resetNotification, sendEmailConfirmation} from "../../store/emailConfirmation/actions";
import {connect} from "react-redux";
import {Link as RouterLink, useLocation} from "react-router-dom";
import Link from "@mui/material/Link";


function ResetPassword(props) {
    const [email, changeEmail] = useState("");
    const [isSentEmail, setIsSentEmail] = useState(false);
    const location = useLocation();

    const handleSubmit = (event) => {
        event.preventDefault();
        props.sendEmailConfirmation("accounts/password_reset", email);
        setIsSentEmail(true);
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "email") {
            emailRef.current.validate(value);
        }
    }

    useEffect(() => {
        if (location.state && location.state.email) {
            const {email} = location.state;
            changeEmail(email);
        }
        return () => {
            props.resetNotification();
        }
    }, [location])

    const emailRef = createRef();
    return (
        <Box sx={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <Avatar sx={{ marginBottom: 3, bgcolor: 'secondary.main', width: 60, height: 60 }}>
                <EmailIcon fontSize="large"/>
            </Avatar>
            <Typography component="h1" variant="h5" sx={{marginBottom: 2}}>
                Reset Password
            </Typography>
            <Container component="main" maxWidth="xs">
                <Box sx={{
                    padding: 3,
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                }}
                >
                    {isSentEmail ? (
                            <Fragment>
                                <Typography variant='subtitle1'>
                                    If an account exists for {email},
                                    you will get an email with instructions on resetting your password. If it doesn't arrive,
                                    be sure to check your spam folder.
                                </Typography>
                                <Box sx={{marginTop: 2, display: 'flex', justifyContent: 'center'}}>
                                    <Link component={RouterLink} to="/signin">
                                        Back to sign in
                                    </Link>
                                </Box>
                            </Fragment>
                        ) :
                        (<Fragment>
                            <Typography variant='subtitle1'>
                                Enter your user account's verified email address and we will send you a password reset link.
                            </Typography>
                            <ValidatorForm component="form" onSubmit={handleSubmit} instantValidate={false}>
                                <TextValidator
                                    ref={emailRef}
                                    margin="normal"
                                    label="Email Address"
                                    fullWidth
                                    id="email"
                                    onBlur={handleBlur}
                                    value={email}
                                    onChange={e => changeEmail(e.target.value)}
                                    name="email"
                                    autoComplete="email"
                                    autoFocus={true}
                                    validators={['required', 'isEmail']}
                                    errorMessages={['this field is required', 'email is not valid']}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 2, mb: 2 }}
                                >
                                    Send password reset email
                                </Button>
                            </ValidatorForm>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                <Link component={RouterLink} to="/signin">
                                    Cancel
                                </Link>
                            </Box>
                        </Fragment>)}
                </Box>
            </Container>
        </Box>
    )
}


const mapDispatchToProps = dispatch => {
    return {
        sendEmailConfirmation: (action, email) => dispatch(sendEmailConfirmation(action, email)),
        resetNotification: () => dispatch(resetNotification())
    }
}

export default connect(null, mapDispatchToProps)(ResetPassword);