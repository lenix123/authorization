import React, {useEffect, useState, createRef} from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import Link from '@mui/material/Link';
import {Link as RouterLink, useNavigate, useLocation} from "react-router-dom";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {connect} from "react-redux";
import {authSignin, resetError} from "../../store/auth/actions";
import {resetNotification, sendEmailConfirmation} from "../../store/emailConfirmation/actions";


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link component={RouterLink} to="/" color="inherit">
        lenix.com
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

function SignIn(props) {
  const [email, changeEmail] = useState("");
  const [password, changePassword] = useState("");
  const [notification, setNotification] = useState({type: "", text: ""});
  const {isLoading, error, status, validatedEmail, isSendingEmail, emailNotification, resetError,
    isTwoFactorAuthRequired, actionType, resetNotification, sendEmailConfirmation} = props;

  const handleSubmit = (event) => {
    event.preventDefault();
    props.onAuth(email, password);
  };
  const emailRef = createRef();
  const passwordRef = createRef();
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (name === "email") {
      emailRef.current.validate(value);
    } else if (name === "password") {
      passwordRef.current.validate(value);
    }
  }

  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (status === 403) {
      setNotification({type: "warning", text: 'You need to verify your email address '});
    } else if (status === 200) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, {replace: true});
    } else if (status === 202 && isTwoFactorAuthRequired) {
      const from = location.state?.from?.pathname || "/";
      navigate('/two-factor', {replace: true, state: {from: from, isTwoFactorAuthRequired: true}});
    }
  }, [status]);

  useEffect(() => {
    if (emailNotification.type === "success" && validatedEmail) {
      navigate('/emailnotification', {replace: true, state: {email: validatedEmail}});
    } else if (emailNotification.type) {
      setNotification({type: emailNotification.type, text: emailNotification.text});
    }
  }, [emailNotification, validatedEmail])

  useEffect(() => {
    if (error && actionType === "signin") {
      changePassword("");
      // If the validation error was not specific to a particular field
      if (error.detail) {
        setNotification({type: "warning", text: error.detail});
      } else if (error["non_field_errors"]) {
        setNotification({type: "warning", text: error["non_field_errors"]})
      }
    }
  }, [error, actionType])

  useEffect(() => {
    return () => {
      removeNotification();
    }
  }, [])

  const removeNotification = () => {
    resetError();
    resetNotification();
  }

  const handleCloseNotification = () => {
    removeNotification()
    setNotification({type: "", text: ""});
  }

  const handleClick = () => {
    console.log(validatedEmail)
    sendEmailConfirmation("send_confirm_email", validatedEmail);
  }

  const sendConfirmEmail = status === 403 ? (<Link component="button" variant="body2" onClick={handleClick}>
                    Send email again
                  </Link>) : "";

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          {
            notification.type ? (
                <Alert severity={notification.type} sx={{width: 1, mt: 1}} onClose={handleCloseNotification}>
                  {notification.text}
                  {sendConfirmEmail}
                </Alert>
            ) : ""
          }
          <Box sx={{ mt: 1, width: 1 }}>
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
              <TextValidator
                  ref={passwordRef}
                  margin="normal"
                  fullWidth
                  value={password}
                  onChange={e => changePassword(e.target.value)}
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  validators={['required', ]}
                  errorMessages={['this field is required',]}
              />
              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>
            </ValidatorForm>
          </Box>
          <Grid container>
            <Grid item xs>
              <Link component={RouterLink} to="/password_reset">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/signup">
                Create an account
              </Link>
            </Grid>
          </Grid>
          {
            isLoading || isSendingEmail ? (
                <CircularProgress sx={{mt: 3}} />
            ) : ""
          }
        </Box>
        <Copyright sx={{ mt: 3, mb: 4 }} />
      </Container>
    </ThemeProvider>
  );
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    status: state.auth.status,
    validatedEmail: state.auth.validatedEmail,
    isSendingEmail: state.emailSending.isSending,
    emailNotification: state.emailSending.notification,
    isTwoFactorAuthRequired: state.auth.isTwoFactorAuthRequired,
    actionType: state.auth.actionType
  }
}

const mapDispatchToProps = dispatch => {
    return {
      onAuth: (email, password) => dispatch(authSignin(email, password)),
      resetError: () => dispatch(resetError()),
      sendEmailConfirmation: (action, email) => dispatch(sendEmailConfirmation(action, email)),
      resetNotification: () => dispatch(resetNotification()),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);