import {updateObject} from "../utility";
import {SET_PROFILE_INFO, SET_PROFILE_ERROR, RESET_PROFILE_ERROR, DELETE_ACCOUNT, SET_USER_EMAIL} from "./actions";

const defaultState = {
    personalInfo: {},
    errorTxt: null,
    status: null,
    actionType: "",
}

const setProfileInfo = (state, action) => {
    return updateObject(state, {
        personalInfo: action.payload.personalInfo,
        status: 200,
        actionType: action.payload.actionType
    });
}

const setProfileError = (state, action) => {
    return updateObject(state, {
        errorTxt: action.payload.errorTxt,
        status: action.payload.status,
        actionType: action.payload.actionType
    });
}

const resetProfileError = (state, action) => {
    return updateObject(state, {
        errorTxt: null,
        status: null,
        actionType: ""
    })
}

const deleteAccount = (state, action) => {
    return updateObject(state, {
        personalInfo: {},
        errorTxt: null,
        status: null,
    })
}

const setUserEmail = (state, action) => {
    let personalInfo = state.personalInfo;
    personalInfo["email"] = action.payload;
    return updateObject(state, {
        personalInfo: personalInfo,
        status: 200,
        actionType: "changeEmail"
    })
}

export const accountReducer = (state=defaultState, action) => {
    switch (action.type) {
        case SET_PROFILE_INFO: return setProfileInfo(state, action);
        case SET_PROFILE_ERROR: return setProfileError(state, action);
        case RESET_PROFILE_ERROR: return resetProfileError(state, action);
        case DELETE_ACCOUNT: return deleteAccount(state, action);
        case SET_USER_EMAIL: return setUserEmail(state, action);
        default:
            return state;
    }
}