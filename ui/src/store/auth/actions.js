import jwt_decode from "jwt-decode";
export const AUTH_START = "AUTH_START";
export const AUTH_SUCCESS = "AUTH_SUCCESS";
export const AUTH_FAIL = "AUTH_FAIL";
export const AUTH_LOGOUT = "AUTH_LOGOUT";
export const RESET_ERROR = "RESET_ERROR";
export const AUTH_FINISH = "AUTH_FINISH";
export const INVALID_TWO_FACTOR_CODE = "INVALID_TWO_FACTOR_CODE";
export const TWO_FACTOR_CODE_VERIFIED = "TWO_FACTOR_CODE_VERIFIED";
export const RESET_TWO_FACTOR_ERROR = "RESET_TWO_FACTOR_ERROR";
export const TWO_FACTOR_AUTH_REQUIRED = "TWO_FACTOR_AUTH_REQUIRED";
export const DELETE_TWO_FACTOR_TOKEN = "DELETE_TWO_FACTOR_TOKEN";

const BASE_URL = 'http://127.0.0.1:8000/';


export const authStart = () => {
    return {
        type: AUTH_START,
    }
}

export const authSuccess = (authTokens) => {
    const {user_name} = jwt_decode(authTokens["access"]);
    return {
        type: AUTH_SUCCESS,
        payload: {
            authTokens: authTokens,
            userName: user_name,
        }
    }
}

export const twoFactorAuthRequired = (status, two_factor_access_token) => {
    localStorage.setItem('twoFactorToken', JSON.stringify(two_factor_access_token));
    return {
        type: TWO_FACTOR_AUTH_REQUIRED,
        payload: {
            status
        }
    }
}

// Finish auth without tokens
// validatedEmail is email of a real user
export const authFinish = (status, email) => {
    return {
        type: AUTH_FINISH,
        payload: {
            status: status,
            validatedEmail: email
        }
    }
}

export const authFail = (error, actionType) => {
    return {
        type: AUTH_FAIL,
        payload: {
            error: error,
            actionType: actionType
        }
    }
}

export const resetError = () => {
    return {
        type: RESET_ERROR,
    }
}

export const logout = () => {
    localStorage.removeItem('authTokens');
    return {
        type: AUTH_LOGOUT
    }
}

export const verifyTwoFacCodeFail = (errorTxt) => {
    return {
        type: INVALID_TWO_FACTOR_CODE,
        payload: errorTxt
    }
}

export const resetTwoFacError = () => {
    return {
        type: RESET_TWO_FACTOR_ERROR
    }
}

export const deleteTwoFactorToken = () => {
    return {
        type: DELETE_TWO_FACTOR_TOKEN
    }
}

export const verifyTwoFactorCodeSuccess = () => {
    return {
        type: TWO_FACTOR_CODE_VERIFIED
    }
}

const setSuccessAuth = (authTokens, dispatch) => {
    dispatch(authSuccess(authTokens));
    localStorage.setItem('authTokens', JSON.stringify(authTokens));
}

export const authSignin = (email, password) => {
    return dispatch => {
        dispatch(authStart());
        fetch(`${BASE_URL}api/signin/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }).then(response => {
            if (response.status === 200) {
                response.json().then(data => {setSuccessAuth(data, dispatch)});
            } else if (response.status === 202) {
                response.json().then(data => {dispatch(twoFactorAuthRequired(202, data["two_factor_access_token"]))})
            } else if (response.status === 403) {
                dispatch(authFinish(403, email));
            } else {
                response.json().then(errorMessage => {
                    dispatch(authFail(errorMessage, "signin"));
                })
            }
        })
    }
}

export const updateTokens = (refreshToken) => {
    return dispatch => {
        fetch(`${BASE_URL}api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({refresh: refreshToken})
        }).then(response => {
            if (response.ok) {
                response.json().then(data => {setSuccessAuth(data, dispatch)})
            } else {
                logout();
            }
        })
    }
}

export const authSignup = (email, firstName, lastName, password) => {
    return dispatch => {
        dispatch(authStart());
        fetch(`${BASE_URL}api/signup/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                first_name: firstName,
                last_name: lastName,
                password: password
            })
        }).then(response => {
            if (response.ok) {
                dispatch(authFinish(response.status, email));
            } else {
                response.json().then(errorMessage => {
                    dispatch(authFail(errorMessage, "signup"));
                });
            }
        })
    }
}

export const authTwoFactorCode = (code) => {
    return dispatch => {
        const tokens = JSON.parse(localStorage.getItem('authTokens'));
        const access_token = tokens ? tokens["access"] : JSON.parse(localStorage.getItem('twoFactorToken'));

        if (access_token) {
            fetch(`http://127.0.0.1:8000/api/verify_two_factor_code/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                })
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {setSuccessAuth(data, dispatch)});
                    dispatch(verifyTwoFactorCodeSuccess())
                } else {
                    response.json().then(error => {dispatch(verifyTwoFacCodeFail(error['detail']))});
                }
            })
        } else {
            dispatch(authFail("Authentication credentials were not provided.", "signin"));
        }
    }
}
