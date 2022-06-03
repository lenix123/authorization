import React, {useState, createRef, useEffect} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {connect} from "react-redux";
import {changeEmail, resetProfileError, setRecoveryEmail} from "../../../store/userProfile/actions";
import Alert from "@mui/material/Alert";
import ChangeEmail from "./ChangeEmail";
import RecoveryEmail from "./RecoveryEmail";


function Emails(props) {
    const {personalInfo, status, errorTxt, actionType, changeEmail, resetProfileError, setRecoveryEmail} = props;
    const [notification, setNotification] = useState({type: "", text: ""});

    useEffect(() => {
        if (actionType === "changeEmail") {
            if (status === 400) {
                setNotification({type: "error", text: errorTxt});
            } else if (status === 200) {
                setNotification({type: "success", text: "We sent a message to a new email address"});
            }
            return () => {
                resetProfileError();
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
                Emails
            </Typography>
            <Box sx={{marginTop: 4, width: "55%"}}>
                <ChangeEmail changeEmail={changeEmail} email={personalInfo.email}/>
                <Divider />
                <RecoveryEmail setRecoveryEmail={setRecoveryEmail} personalInfo={personalInfo}/>
            </Box>
        </Box>
    )
}

const mapStateToProps = (state) => {
    return {
        personalInfo: state.account.personalInfo,
        status: state.account.status,
        errorTxt: state.account.errorTxt,
        actionType: state.account.actionType,
    }
}

const mapDispatchToProps = {
    changeEmail,
    resetProfileError,
    setRecoveryEmail,
}

export default connect(mapStateToProps, mapDispatchToProps)(Emails);