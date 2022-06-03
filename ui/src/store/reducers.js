import { combineReducers } from "redux";
import { authReducer } from "./auth/reducers";
import {emailSendingReducer} from "./emailConfirmation/reducers";
import {accountReducer} from "./userProfile/reducers";
import {securityReducer} from "./userProfile/Security/reducers";

export default combineReducers({
    auth: authReducer,
    emailSending: emailSendingReducer,
    account: accountReducer,
    security: securityReducer,
})