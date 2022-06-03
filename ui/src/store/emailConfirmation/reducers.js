import {updateObject} from "../utility";
import {EMAIL_SENDING_START, EMAIL_SENDING_SUCCESS, EMAIL_SENDING_FAIL, RESET_NOTIFICATION} from "./actions";

// notification.type should correspond with mui alerts severity
const defaultState = {
    isSending: false,
    notification: {
        type: "",
        text: ""
    }
}

const sendingStart = (state, action) => {
    return updateObject(state, {
        isSending: true,
        notification: {
            type: "",
            text: ""
        }
    })
}

const sendingFail = (state, action) => {
    return updateObject(state, {
        isSending: false,
        notification: {
            type: "warning",
            text: action.errorText
        }
    })
}

const sendingSuccess = (state, action) => {
    return updateObject(state, {
        isSending: false,
        notification: {
            type: "success",
            text: action.successText
        }
    })
}

const resetNotification = (state, action) => {
    return updateObject(state, {
        isSending: false,
        notification: {
            type: "",
            text: ""
        }
    })
}

export const emailSendingReducer = (state=defaultState, action) => {
    switch (action.type) {
        case EMAIL_SENDING_START: return sendingStart(state, action);
        case EMAIL_SENDING_SUCCESS: return sendingSuccess(state, action);
        case EMAIL_SENDING_FAIL: return sendingFail(state, action);
        case RESET_NOTIFICATION: return resetNotification(state, action);
        default:
            return state;
    }
}