import {updateObject} from "../../utility";
import {RESET_SECURITY_NOTIFICATION, SET_SECURITY_ERROR, SET_SECURITY_SUCCESS, START_TWO_FACTOR_AUTH_SETUP,
    RESET_TWO_FACTOR_AUTH_SETUP} from "./actions";

const defaultState = {
    errorTxt: "",
    status: null,
    actionType: "",
    secretUrl: "",
    otpSecret: "",
}

export const securityReducer = (state=defaultState, action) => {
    switch (action.type) {
        case SET_SECURITY_SUCCESS:
            return updateObject(state, {
                status: action.payload.status,
                actionType: action.payload.actionType,
                errorTxt: ""
            })
        case SET_SECURITY_ERROR:
            return updateObject(state, {
                status: action.payload.status,
                actionType: action.payload.actionType,
                errorTxt: action.payload.errorTxt
            })
        case RESET_SECURITY_NOTIFICATION:
            return updateObject(state, {
                status: null,
                errorTxt: "",
                actionType: ""
        })
        case START_TWO_FACTOR_AUTH_SETUP:
            return updateObject(state, {
                actionType: "startTwoFactorAuth",
                status: null,
                errorTxt: "",
                secretUrl: action.payload.secretUrl,
                otpSecret: action.payload.otpSecret
            })
        case RESET_TWO_FACTOR_AUTH_SETUP:
            return updateObject(state, {
                actionType: "",
                secretUrl: "",
                otpSecret: "",
            })
        default:
            return state;
    }
}