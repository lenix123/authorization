import React, {useEffect, useState, createRef} from "react";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { ValidatorForm, TextValidator} from 'react-material-ui-form-validator';
import {Link as RouterLink, useNavigate} from "react-router-dom";
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CircularProgress from "@mui/material/CircularProgress";
import {connect} from "react-redux";
import {authSignup, resetError} from "../../store/auth/actions";
import Alert from "@mui/material/Alert";

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" component={RouterLink} to="/">
        lenix.com
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

function SignUp(props) {
  const [firstName, changeFirstName] = useState("");
  const [lastName, changeLastName] = useState("");
  const [email, changeEmail] = useState("");
  const [password, changePassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const {isLoading, authError, status, validatedEmail, actionType} = props;

  const handleSubmit = (event) => {
    event.preventDefault();
    props.onSignup(email, firstName, lastName, password);
  };

  const firstNameRef = createRef();
  const lastNameRef = createRef();
  const emailRef = createRef();
  const passwordRef = createRef();
  const handleBlur = (event) => {
    const {name, value} = event.target;
    if (name === "firstName") {
      firstNameRef.current.validate(value);
    } else if (name === "lastName") {
      lastNameRef.current.validate(value);
    } else if (name === "email") {
      emailRef.current.validate(value);
    } else if (name === "password") {
      passwordRef.current.validate(value);
    }
  }

  const navigate = useNavigate();
  useEffect(() => {
    if (status===201) {
      navigate('/emailnotification', {replace: true, state: {email: validatedEmail}});
    }
  }, [status]);

  useEffect(() => {
    if (authError && actionType === "signup") {
      // If the validation authError was not specific to a particular field
      if (authError.detail) {
        setErrorMessage(authError.detail);
      } else if (authError["non_field_errors"]) {
        setErrorMessage(authError["non_field_errors"]);
      //  if user with this Email address already exists
      } else if (authError.email) {
        setEmailError(authError.email[0]);
      }
      return () => {
        props.resetError();
      }
    }
  }, [authError, actionType])

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
            Sign up
          </Typography>
          {
            errorMessage ? (
                <Alert severity="warning" sx={{width: 1, mt: 1}} onClose={() => {setErrorMessage("")}}>
                  {errorMessage}
                </Alert>
            ) : ""
          }
          <Box sx={{ mt: 3 }}>
            <ValidatorForm component="form" onSubmit={handleSubmit} instantValidate={false}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextValidator
                      autoComplete="given-name"
                      ref={firstNameRef}
                      onBlur={handleBlur}
                      name="firstName"
                      value={firstName}
                      onChange={e => changeFirstName(e.target.value)}
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      validators={['required', ]}
                      errorMessages={['this field is required',]}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextValidator
                      ref={lastNameRef}
                      onBlur={handleBlur}
                      value={lastName}
                      onChange={e => changeLastName(e.target.value)}
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      validators={['required', ]}
                      errorMessages={['this field is required',]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextValidator
                      ref={emailRef}
                      onBlur={handleBlur}
                      value={email}
                      onChange={e => changeEmail(e.target.value)}
                      fullWidth
                      error={emailError !== ""}
                      helperText={emailError}
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      validators={['required', 'isEmail']}
                      errorMessages={['this field is required', 'email is not valid']}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextValidator
                      ref={passwordRef}
                      onBlur={handleBlur}
                      value={password}
                      onChange={e => changePassword(e.target.value)}
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      validators={['required', ]}
                      errorMessages={['this field is required',]}
                  />
                </Grid>
              </Grid>
              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link component={RouterLink} to="/signin" className="basic-link">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </ValidatorForm>
          </Box>
          {
            isLoading ? (
                <CircularProgress sx={{mt: 2}} />
            ) : ""
          }
        </Box>
        <Copyright sx={{ mt: 3 }} />
      </Container>
    </ThemeProvider>
  );
}

const mapStateToProps = (state) => {
  return {
    isLoading: state.auth.isLoading,
    authError: state.auth.error,
    status: state.auth.status,
    validatedEmail: state.auth.validatedEmail,
    actionType: state.auth.actionType
  }
}

const mapDispatchToProps = dispatch => {
    return {
      onSignup: (email, firstName, lastName, password) => dispatch(authSignup(email, firstName, lastName, password)),
      resetError: () => dispatch(resetError())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
