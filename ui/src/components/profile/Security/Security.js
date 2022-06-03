import React, {useEffect, useState} from "react";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ChangePassword from "./ChangePassword";
import Divider from "@mui/material/Divider";
import TwoFacAuth from "./TwoFacAuth";
import {connect} from "react-redux";
import {
    changeUserPassword,
    enableTwoFactorAuth,
    resetTwoFactorAuthSetup,
    resetSecurityNotification,
    disableTwoFactorAuth
} from "../../../store/userProfile/Security/actions";


function Security(props) {
    const [notification, setNotification] = useState({type: "", text: ""});
    const {status, errorTxt, actionType, changeUserPassword, resetSecurityNotification, email, isTwoFacAuthEnabled,
        enableTwoFactorAuth, secretUrl, resetTwoFactorAuthSetup, disableTwoFactorAuth, otpSecret} = props;

    useEffect(() => {
        if (actionType) {
            const successText = actionType === "changeUserPassword" ? "Your password was successfully changed!" : "Two-factor authentication enabled"
            if (status === 400) {
                setNotification({type: "error", text: errorTxt});
            } else if (status === 200) {
                setNotification({type: "success", text: successText});
            }
            return () => {
                resetSecurityNotification();
            }
        }
    }, [actionType, status, errorTxt])

    return (
        <Box sx={{
            display: "flex",
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 7
        }}>
            {
                notification.type ? (
                    <Alert severity={notification.type} sx={{width: 0.55, mt: 1, mb: 3}} onClose={() => {setNotification(
                        {type: "", text: ""}
                    )}}>
                        {notification.text}
                    </Alert>
                ) : ""
            }
            <Typography variant="h4" component="div" sx={{marginBottom: 1}}>
                Security
            </Typography>
            <Box sx={{marginTop: 4, width: "55%"}}>
                <ChangePassword changeUserPassword={changeUserPassword} actionType={actionType} email={email}/>
                <Divider />
                <TwoFacAuth isTwoFacAuthEnabled={isTwoFacAuthEnabled}
                            enableTwoFactorAuth={enableTwoFactorAuth}
                            resetTwoFactorAuthSetup={resetTwoFactorAuthSetup}
                            secretUrl={secretUrl}
                            otpSecret={otpSecret}
                            disableTwoFactorAuth={disableTwoFactorAuth}
                />
            </Box>
        </Box>
    )
}

const mapStateToProps = (state) => {
    return {
        status: state.security.status,
        errorTxt: state.security.errorTxt,
        actionType: state.security.actionType,
        email: state.account.personalInfo.email,
        isTwoFacAuthEnabled: state.account.personalInfo.is_two_fac_auth_enabled,
        secretUrl: state.security.secretUrl,
        otpSecret: state.security.otpSecret,
    }
}

const mapDispatchToProps = {
    changeUserPassword,
    resetSecurityNotification,
    enableTwoFactorAuth,
    resetTwoFactorAuthSetup,
    disableTwoFactorAuth,
}

export default connect(mapStateToProps, mapDispatchToProps)(Security);