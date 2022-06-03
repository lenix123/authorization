import React, {useState, useEffect, Fragment} from "react";
import Box from '@mui/material/Box';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import DoneIcon from '@mui/icons-material/Done';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {Link as RouterLink, useLocation, useNavigate} from "react-router-dom";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import SystemUpdateOutlinedIcon from '@mui/icons-material/SystemUpdateOutlined';
import KeyIcon from '@mui/icons-material/Key';
import {QRCodeSVG} from 'qrcode.react';
import TextField from "@mui/material/TextField";
import {connect} from "react-redux";
import {authTwoFactorCode, resetTwoFacError} from "../../../store/auth/actions";
import {disableTwoFactorAuth} from "../../../store/userProfile/Security/actions";
import Alert from "@mui/material/Alert";

const steps = ['Two-factor authentication', 'Connect the application', 'Authentication verification'];

function TwoFacAuthSetup(props) {
  const [secretUrl, setSecretUrl] = useState("");
  const [otpSecret, setOtpSecret] = useState("");
  const [showPage, setShowPage] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());
  const [code, changeCode] = useState("");
  const [isFinishDisabled, setIsFinishDisabled] = useState(true);
  const [notification, setNotification] = useState({type: "", text: ""})
  const {isTwoFactorCodeVerified, twoFactorError, authTwoFactorCode, resetTwoFacError} = props;

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.state && location.state.secretUrl && location.state.otpSecret) {
      setShowPage(true);
      setSecretUrl(location.state.secretUrl);
      setOtpSecret(location.state.otpSecret);
    } else {
      navigate("/", {replace: true});
    }
  }, [location]);

  useEffect(() => {
    if (code.length === 6 && !isNaN(code)) {
      authTwoFactorCode(code);
    }
  }, [code]);

  useEffect(() => {
    if (isTwoFactorCodeVerified) {
      setIsFinishDisabled(false);
      setNotification({type: "success", text: 'two-factor code is verified.'});
    } else if (twoFactorError) {
      setNotification({type: "error", text: twoFactorError});
    }
    return () => {
      resetTwoFacError();
    }
  }, [isTwoFactorCodeVerified, twoFactorError]);

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCloseNotification = () => {
    setNotification({type: "", text: ""});
    resetTwoFacError();
  }

  let activeComponent;
  if (activeStep === 0) {
    activeComponent = (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", mt: 4, flexDirection: "column"}}>
          <ShieldOutlinedIcon color="primary" sx={{ fontSize: 50 }}/>
          <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>Two-factor authentication</Typography>
          <Box sx={{width: "70%"}}>
            <Box sx={{display: "flex", alignItems: "center"}}>
              <Avatar sx={{mr: 1, bgcolor: "#1976d2"}}>
                <SystemUpdateOutlinedIcon />
              </Avatar>
              <Typography variant="h6">Install an app authenticator</Typography>
            </Box>
            <Typography variant="body1" sx={{mt: 1.5}}>
              Use an application on your phone to get two-factor authentication codes when prompted.
              We recommend using cloud-based TOTP apps such as: Google Authenticator, 1Password, Authy, LastPass Authenticator,
              or Microsoft Authenticator.
            </Typography>
          </Box>
        </Box>
    )
  } else if (activeStep === 1) {
    activeComponent = (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", mt: 3, flexDirection: "column"}}>
          <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>Connect the application</Typography>
          <Box sx={{width: "70%"}}>
            <Box sx={{display: "flex", alignItems: "center"}}>
              <Avatar sx={{mr: 1, bgcolor: "#1976d2"}}>
                <QrCodeScannerOutlinedIcon />
              </Avatar>
              <Typography variant="h6">Scan the image below</Typography>
            </Box>
            <Typography variant="body1" sx={{mt: 1.5}}>
              Open the app and scan the qr code below with the two-factor authentication app on your phone.
            </Typography>
            <Box sx={{p: 1.3, mt: 2.5, mb: 2.5, border: '1px solid #d8dee4', width: 'max-content', borderRadius: 2}}>
              <QRCodeSVG value={secretUrl} size="160"/>
            </Box>
            <Typography variant="body1" sx={{mt: 1.5}}>
              If you can’t use a QR code, enter this text code instead:
            </Typography>
            <Typography variant="h6">
              {otpSecret}
            </Typography>
          </Box>
        </Box>
    )
  } else if (activeStep === 2) {
    activeComponent = (
        <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", mt: 4, flexDirection: "column"}}>
          <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>Authentication verification</Typography>
          <Box sx={{width: "70%"}}>
            <Box sx={{display: "flex", alignItems: "center"}}>
              <Avatar sx={{mr: 1, bgcolor: "#1976d2"}}>
                <KeyIcon />
              </Avatar>
              <Typography variant="h6">Enter the code from the application</Typography>
            </Box>
            <Typography variant="body1" sx={{mt: 1.5}}>
              After scanning the QR code image, the app will display a code that you can enter below.
            </Typography>
            <TextField
                    value={code}
                    onChange={e => changeCode(e.target.value)}
                    sx={{mt: 2}}
                    label="6-digit code"
                    name="code"
                    size="small"
                    autoFocus
                />
            {
              notification.type ? (
                  <Alert severity={notification.type} sx={{width: 1, mt: 2, p: 2}} onClose={handleCloseNotification}>
                    {notification.text}<br/>
                  </Alert>
              ) : ""
            }
          </Box>
        </Box>
    )
  }

  return (
      <Container maxWidth="md" sx={{display: "flex", alignItems: "center"}}>
        {showPage ? (
            <Box sx={{ width: '100%', p: 3, border: '1px solid #dadce0', borderRadius: 2, mt: 12 }}>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const stepProps = {};
                  const labelProps = {};
                  if (isStepSkipped(index)) {
                    stepProps.completed = false;
                  }
                  return (
                      <Step key={label} {...stepProps}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                      </Step>
                  );
                })}
              </Stepper>
              {activeStep === steps.length ? (
                  <Box sx={{display: "flex", justifyContent: "center", alignItems: "center", mt: 4, flexDirection: "column"}}>
                    <GppGoodOutlinedIcon color="success" sx={{ fontSize: 50 }} />
                    <Typography variant="h4" sx={{ mt: 2, mb: 2 }}>Two-factor authentication activated</Typography>
                    <Box sx={{width: "70%"}}>
                      <Box sx={{display: "flex", alignItems: "center"}}>
                        <Avatar sx={{mr: 1, bgcolor: "#2da44e"}}>
                          <DoneIcon />
                        </Avatar>
                        <Typography variant="h6">Account is protected</Typography>
                      </Box>
                      <Typography variant="body1" sx={{mt: 1.5}}>
                        The next time you login to this site, you will need to provide a two-factor authentication code.
                      </Typography>
                    </Box>
                    <Box sx={{display: "flex", justifyContent: "flex-end", width: 1}}>
                      <Button
                          variant="contained"
                          disableElevation
                          sx={{ mt: 2 }}
                          component={RouterLink}
                          to="/"
                          replace={true}
                      >
                        Done
                      </Button>
                    </Box>
                  </Box>
              ) : (
                  <React.Fragment>
                    {activeComponent}
                    <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, mt: 2 }}>
                      {activeStep === 0 ? ('') : (
                          <Button
                              color="inherit"
                              onClick={handleBack}
                              sx={{ mr: 1 }}
                          >
                            Back
                          </Button>
                      )}
                      <Box sx={{ flex: '1 1 auto' }} />
                      <Button onClick={handleNext} disabled={activeStep === 2 && isFinishDisabled}>
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </Box>
                  </React.Fragment>
              )}
            </Box>
        ) : ""}
      </Container>
  );
}

const mapStateToProps = (state) => {
  return {
    twoFactorError: state.auth.twoFactorError,
    isTwoFactorCodeVerified: state.auth.isTwoFactorCodeVerified,
  }
}

const mapDispatchToProps = {
  authTwoFactorCode,
  resetTwoFacError,
}

export default connect(mapStateToProps, mapDispatchToProps)(TwoFacAuthSetup);