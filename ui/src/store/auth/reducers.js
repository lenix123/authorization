import {updateObject} from "../utility";
import {AUTH_FAIL, AUTH_LOGOUT, AUTH_START, AUTH_SUCCESS, RESET_ERROR, AUTH_FINISH, DELETE_TWO_FACTOR_TOKEN,
    INVALID_TWO_FACTOR_CODE, RESET_TWO_FACTOR_ERROR, TWO_FACTOR_AUTH_REQUIRED, TWO_FACTOR_CODE_VERIFIED} from "./actions";

const defaultState = {
    isAuthenticated: false,
    userName: "",
    authTokens: null,
    isLoading: false,
    error: null,
    status: null,
    validatedEmail: "",
    isTwoFactorAuthRequired: false,
    isTwoFactorCodeVerified: false,
    twoFactorError: "",
    actionType: ""
}

const authStart = (state, action) => {
    return updateObject(state, {
        error: null,
        isLoading: true
    });
}

const authSuccess = (state, action) => {
    return updateObject(state, {
        isAuthenticated: true,
        authTokens: action.payload.authTokens,
        userName: action.payload.userName,
        error: null,
        isLoading: false,
        status: 200,
    });
}

const twoFactorAuthRequired = (state, action) => {
    return updateObject(state, {
        status: action.payload.status,
        isTwoFactorAuthRequired: true,
        error: null,
        isLoading: false,
    })
}

// Finish auth without tokens
const authFinish = (state, action) => {
    return updateObject(state, {
        isLoading: false,
        status: action.payload.status,
        validatedEmail: action.payload.validatedEmail,
        actionType: "signup"
    })
}

const authFail = (state, action) => {
    return updateObject(state, {
        error: action.payload.error,
        isLoading: false,
        actionType: action.payload.actionType
    });
}

const resetError = (state, action) => {
    return updateObject(state, {
        error: null,
        status: null,
        actionType: ""
    });
}

const authLogout = (state, action) => {
    return updateObject(state, {
        isAuthenticated: false,
        userName: "",
        authTokens: null,
        status: null,
        validatedEmail: "",
        isLoading: false,
        error: null,
        actionType: ""
    });
}

const verifyTwoFacCodeFail = (state, action) => {
    return updateObject(state, {
        twoFactorError: action.payload,
    })
}

const verifyTwoFactorCodeSuccess = (state, action) => {
    return updateObject(state, {
        twoFactorError: null,
        isTwoFactorCodeVerified: true
    })
}

const resetTwoFacError = (state, action) => {
    return updateObject(state, {
        twoFactorError: "",
        isTwoFactorCodeVerified: false
    })
}

const deleteTwoFactorCode = (state, action) => {
    localStorage.removeItem('twoFactorToken');
    return updateObject(state, {
        status: null,
        isTwoFactorAuthRequired: false,
        twoFactorError: ""
    })
}

export const authReducer = (state=defaultState, action) => {
    switch (action.type) {
        case AUTH_START: return authStart(state, action);
        case AUTH_SUCCESS: return authSuccess(state, action);
        case AUTH_FAIL: return authFail(state, action);
        case AUTH_LOGOUT: return authLogout(state, action);
        case RESET_ERROR: return resetError(state, action);
        case AUTH_FINISH: return authFinish(state, action);
        case INVALID_TWO_FACTOR_CODE: return verifyTwoFacCodeFail(state, action);
        case TWO_FACTOR_CODE_VERIFIED: return verifyTwoFactorCodeSuccess(state, action);
        case RESET_TWO_FACTOR_ERROR: return resetTwoFacError(state, action);
        case TWO_FACTOR_AUTH_REQUIRED: return twoFactorAuthRequired(state, action);
        case DELETE_TWO_FACTOR_TOKEN: return deleteTwoFactorCode(state, action);
        default:
            return state;
    }
}