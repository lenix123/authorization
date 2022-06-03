import React, {useEffect} from "react";
import Home from "./components/Home";
import SignIn from "./components/forms/SignIn";
import SignUp from "./components/forms/SignUp";
import EmailNotification from "./components/accountActivation/EmailNotification";
import Activate from "./components/accountActivation/Activate";
import UserProfile from "./components/profile/UserProfile";
import RequireAuth from "./components/permissions/RequireAuth";
import ResetPassword from "./components/forms/ResetPassword";
import ResetPasswordConfirm from "./components/forms/ResetPasswordConfirm";
import RecoveryEmailActivation from "./components/profile/Emails/RecoveryEmailActivation";
import TwoFactorAuth from "./components/forms/TwoFactorAuth";
import TwoFacAuthSetup from "./components/profile/Security/TwoFacAuthSetup";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {connect} from "react-redux";
import {updateTokens} from "./store/auth/actions";


function App(props) {
    const {authTokens} = props;

    useEffect(() => {
        if (authTokens) {
            const fourMinutes = 1000 * 60 * 4;
            const id = setInterval(() => {
                props.updateTokens(authTokens.refresh);
            }, fourMinutes);
            return () => clearInterval(id);
        } else {
            const tokens = localStorage.getItem('authTokens');

            if (tokens) {
                props.updateTokens(JSON.parse(tokens)["refresh"]);
            }
        }
    }, [authTokens])

    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/password_reset" element={<ResetPassword />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/emailnotification" element={<EmailNotification />} />
                    <Route path="/activate/:uid/:token" element={<Activate />} />
                    <Route path="/password_reset_confirm/:uid/:token" element={<ResetPasswordConfirm />} />
                    <Route path="/two-factor" element={<TwoFactorAuth/>} />
                    <Route
                        path="/activate_recovery_email/:uid/:token"
                        element={
                            <RequireAuth>
                                <RecoveryEmailActivation />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/userprofile/*"
                        element={
                            <RequireAuth>
                                <UserProfile />
                            </RequireAuth>
                        }
                    />
                    <Route
                        path="/two_factor_authentication/setup"
                        element={
                            <RequireAuth>
                                <TwoFacAuthSetup />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </Router>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        authTokens: state.auth.authTokens,
    }
}

const mapDispatchToProps = {
    updateTokens
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
