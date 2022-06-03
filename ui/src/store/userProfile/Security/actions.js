import {setProfileError, setProfileInfo} from "../actions";
export const SET_SECURITY_SUCCESS = "SET_SECURITY_SUCCESS";
export const SET_SECURITY_ERROR =  "SET_SECURITY_ERROR";
export const RESET_SECURITY_NOTIFICATION = "RESET_SECURITY_NOTIFICATION";
export const START_TWO_FACTOR_AUTH_SETUP = "START_TWO_FACTOR_AUTH_SETUP";
export const RESET_TWO_FACTOR_AUTH_SETUP = "RESET_TWO_FACTOR_AUTH_SETUP";


const setSecuritySuccess = (status, actionType) => {
    return {
        type: SET_SECURITY_SUCCESS,
        payload: {
            status,
            actionType
        }
    }
}

const setSecurityError = (errorTxt, status, actionType) => {
    return {
        type: SET_SECURITY_ERROR,
        payload: {
            status,
            errorTxt,
            actionType
        }
    }
}

const startTwoFactorAuthSetup = (secretUrl, otpSecret) => {
    return {
        type: START_TWO_FACTOR_AUTH_SETUP,
        payload: {
            secretUrl,
            otpSecret,
        }
    }
}

export const resetTwoFactorAuthSetup = () => {
    return {
        type: RESET_TWO_FACTOR_AUTH_SETUP
    }
}

export const resetSecurityNotification = () => {
    return {
        type: RESET_SECURITY_NOTIFICATION,
    }
}

export const changeUserPassword = (oldPassword, newPassword, confirmNewPass) => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/change_password/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                    confirm_new_password: confirmNewPass
                })
            }).then(response => {
                if (response.ok) {
                    dispatch(setSecuritySuccess(response.status, "changeUserPassword"));
                } else {
                    response.json().then(error => {dispatch(setSecurityError(error["detail"], response.status, "changeUserPassword"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}

export const enableTwoFactorAuth = (password) => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/enable_two_factor_auth/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: password,
                })
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {dispatch(startTwoFactorAuthSetup(data['secret_url'], data['otp_secret']))});
                } else {
                    response.json().then(errorTxt => {dispatch(setSecurityError(errorTxt["detail"], response.status, "enableTwoFactorAuth"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}

export const disableTwoFactorAuth = () => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/disable_two_factor_auth/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {dispatch(setProfileInfo(data, "disableTwoFactorAuth"))});
                } else {
                    response.json().then(errorTxt => {dispatch(setSecurityError(errorTxt["detail"], response.status, "disableTwoFactorAuth"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}