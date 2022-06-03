import React, {Fragment, useEffect, useState} from "react";
import EmailIcon from '@mui/icons-material/Email';
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import LinearProgress from "@mui/material/LinearProgress";
import {connect} from "react-redux";
import {useNavigate, useLocation} from "react-router-dom";
import Alert from "@mui/material/Alert";
import {resetNotification, sendEmailConfirmation} from "../../store/emailConfirmation/actions";


function EmailNotification(props) {
    const [showPage, setShowPage] = useState(false);
    const [isSendingDisabled, setIsSendingDisabled] = useState(true);
    const [timeBeforeResend, setTimeBeforeResend] = useState(60);
    const [email, setEmail] = useState("");
    const {isSending, notification} = props;
    const location = useLocation();

    const navigate = useNavigate();
    useEffect(() => {
        if (location.state) {
            const { email } = location.state;
            setShowPage(true);
            setEmail(email);
        } else {
            navigate("/", {replace: true});
        }
    }, [location])

    const handleClick = (e) => {
        e.preventDefault();
        props.sendEmailConfirmation("send_confirm_email", email);
    }

    useEffect(() => {
        if (notification.type) {
            setIsSendingDisabled(true);
            return () => {
                props.resetNotification();
            }
        }
    }, [notification])

    useEffect(() => {
        if (isSendingDisabled) {
            const timeoutId = setTimeout(() => {
                setTimeBeforeResend(60);
                setIsSendingDisabled(false);
            }, 60000);
            return () => clearTimeout(timeoutId);
        }
    }, [isSendingDisabled])

    useEffect(() => {
        if (isSendingDisabled) {
            const intervalId = setInterval(() => {
                if (timeBeforeResend > 1) {
                    setTimeBeforeResend(timeBeforeResend - 1);
                } else {
                    setTimeBeforeResend(60);
                    clearInterval(intervalId);
                }
            }, 1000)
            return () => clearInterval(intervalId);
        }
    }, [isSendingDisabled, timeBeforeResend])

    const isButtonDisabled = isSending || isSendingDisabled;
    const btnBeforeResendTxt = `Resend after ${timeBeforeResend}s`;

    return (
        <Container component="main" maxWidth="xs">
            {notification && notification.type ? (
                <Alert severity={notification.type}
                       sx={{mt: 2}}
                       onClose={() => {props.resetNotification()}}
                >
                    {notification.text}
                </Alert>
            ) : ""}
            {showPage ? (
                <Fragment>
                    {isSending ? <LinearProgress /> : ""}
                    <CssBaseline />
                    <Box sx={{
                        marginTop: 12,
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                    }}
                    >
                        <Avatar sx={{
                            m: 2,
                            width: 60,
                            height: 60,
                            bgcolor: 'white',
                            border: '2px solid #1976d2'
                        }}>
                            <EmailIcon fontSize="large" color="primary" />
                        </Avatar>
                        <Typography component="div" variant="h5">
                            Verify your email address
                        </Typography>
                        <Typography variant="subtitle1" sx={{ m: 2, textAlign: 'center' }}>
                            We sent an email with a link to verify your email.
                            Please check the email to activate your account.
                        </Typography>
                        <Typography variant="body2" sx={{ m: 2, textAlign: 'center' }}>
                            If you do not receive any message on your email,
                            click the button to resend the message again.
                        </Typography>
                        <LoadingButton variant="contained"
                                       sx={{ m: 1 }}
                                       loading={isSendingDisabled}
                                       onClick={handleClick}
                                       fullWidth
                                       loadingIndicator={btnBeforeResendTxt}
                                       endIcon={<SendIcon />}
                                       disabled={isButtonDisabled}
                        >
                            Resend activation link
                        </LoadingButton>
                    </Box>
                </Fragment>
            ) : ""}
        </Container>
    )
}

const mapStateToProps = (state) => {
  return {
      isSending: state.emailSending.isSending,
      notification: state.emailSending.notification
  }
}

const mapDispatchToProps = dispatch => {
    return {
        sendEmailConfirmation: (action, email) => dispatch(sendEmailConfirmation(action, email)),
        resetNotification: () => dispatch(resetNotification())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailNotification);