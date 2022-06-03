export const SET_PROFILE_INFO = "SET_PROFILE_INFO";
export const SET_USER_EMAIL = "SET_USER_EMAIL";
export const SET_PROFILE_ERROR = "SET_PROFILE_ERROR";
export const RESET_PROFILE_ERROR = "RESET_PROFILE_ERROR";
export const DELETE_ACCOUNT = "DELETE_ACCOUNT";

export const setProfileInfo = (data, actionType) => {
    return {
        type: SET_PROFILE_INFO,
        payload: {
            personalInfo: data,
            actionType: actionType,
        }
    }
}

export const setUserEmail = (email) => {
    return {
        type: SET_USER_EMAIL,
        payload: email
    }
}

export const setProfileError = (errorTxt, status, actionType) => {
    return {
        type: SET_PROFILE_ERROR,
        payload: {
            errorTxt: errorTxt,
            status: status,
            actionType: actionType
        }
    }
}

export const resetProfileError = () => {
    return {
        type: RESET_PROFILE_ERROR,
    }
}

export const deleteAccount = () => {
    return {
        type: DELETE_ACCOUNT,
    }
}

export const getProfileData = () => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/user_profile/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {dispatch(setProfileInfo(data, "getProfileData"))});
                } else {
                    response.json().then(error => {dispatch(setProfileError(error["detail"], response.status, "getProfileData"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}


export const updateProfileData = (newProfileInfo) => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/user_profile/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProfileInfo)
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {dispatch(setProfileInfo(data, "updateProfileData"))});
                } else {
                    response.json().then(error => {dispatch(setProfileError(error["detail"], response.status, "updateProfileData"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}


export const deleteUser = () => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/user_profile/`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }).then(response => {
                if (response.ok) {
                    dispatch(setProfileError("", 204, "deleteUser"));
                } else {
                    response.json().then(error => {dispatch(setProfileError(error["detail"], response.status, "deleteUser"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}


export const changeEmail = (email, password) => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/change_email/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_email: email,
                    password: password
                })
            }).then(response => {
                if (response.ok) {
                    dispatch(setUserEmail(email));
                } else {
                    response.json().then(error => {dispatch(setProfileError(error["detail"], response.status, "changeEmail"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}


export const setRecoveryEmail = (recoveryEmail) => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));

        if (tokens) {
            const accessToken = tokens["access"];
            fetch(`http://127.0.0.1:8000/api/set_recovery_email/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: recoveryEmail,
                })
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {dispatch(setProfileInfo(data, "setRecoveryEmail"))});
                } else {
                    response.json().then(error => {dispatch(setProfileError(error["detail"], response.status, "setRecoveryEmail"))});
                }
            })
        } else {
            dispatch(setProfileError("Authentication credentials were not provided.", 401, ""));
        }
    }
}
