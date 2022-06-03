import React, {useState, useEffect, Fragment} from "react";
import ListMenu from "./ListMenu";
import Header from "../header/Header";
import Box from "@mui/material/Box";
import {connect} from "react-redux";
import {getProfileData} from "../../store/userProfile/actions";
import {useNavigate} from "react-router-dom";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import {Routes, Route} from "react-router-dom";
import EditProfile from "./EditProfile/EditProfile";
import Security from "./Security/Security";
import Emails from "./Emails/Emails";
import RequireAuth from "../permissions/RequireAuth";
import TwoFacAuthSetup from "./Security/TwoFacAuthSetup";


function UserProfile(props) {
    const [showPage, setShowPage] = useState(false);
    const [notification, setNotification] = useState({type: "", text: ""});
    const {isAuthenticated, errorTxt, status, actionType} = props;

    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            props.getProfileData();
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (actionType === "getProfileData") {
            if (status === 200) {
                setShowPage(true);
            } else if (status === 401) {
                navigate('/signin', {replace: true});
            } else if (errorTxt) {
                setNotification({
                    type: "error",
                    text: errorTxt
                })
            }
        }
    }, [actionType, status, errorTxt])

    return (
        <Box sx={{width: '100vw', height: '100vh', background: '#f5f5f5',}}>
            <Header />
            {notification && notification.type ? (
                <Alert severity={notification.type}
                       sx={{mt: 2}}
                       onClose={() => {setNotification({type: "", text: ""})}}
                >
                    {notification.text}
                </Alert>
            ) : ""}
            {showPage ? (
                <Box sx={{display: 'flex'}}>
                    <ListMenu />
                    <Container maxWidth="md"
                               sx={{border: "1px #e0e0e0 solid",
                                   background: "#fff",
                                   marginTop: 2,
                                   marginBottom: 2,
                                   borderRadius: 2}}>
                            <Routes>
                                <Route path="" element={<EditProfile />} />
                                <Route path="profile" element={<EditProfile />} />
                                <Route path="emails" element={<Emails />} />
                                <Route path="security" element={<Security />} />
                            </Routes>
                    </Container>
                </Box>
            ) : ""}
        </Box>
    )
}

const mapStateToProps = (state) => {
    return {
        isAuthenticated: state.auth.isAuthenticated,
        errorTxt: state.account.errorTxt,
        status: state.account.status,
        actionType: state.account.actionType,
    }
}

const mapDispatchToProps = {
    getProfileData,
}

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
