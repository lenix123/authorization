export const EMAIL_SENDING_START = "EMAIL_SENDING_START";
export const EMAIL_SENDING_FAIL = "EMAIL_CONFIRMATION_FAIL";
export const EMAIL_SENDING_SUCCESS = "EMAIL_CONFIRMATION_SUCCESS";
export const RESET_NOTIFICATION = "RESET_NOTIFICATION";

export const sendingStart = () => {
    return {
        type: EMAIL_SENDING_START,
    }
}

export const sendingFail = errorText => {
    return {
        type: EMAIL_SENDING_FAIL,
        errorText: errorText
    }
}

export const sendingSuccess = successText => {
    return {
        type: EMAIL_SENDING_SUCCESS,
        successText: successText
    }
}

export const resetNotification = () => {
    return {
        type: RESET_NOTIFICATION,
    }
}

export const sendEmailConfirmation = (action, email) => {
    return dispatch => {
        dispatch(sendingStart());
        fetch(`http://127.0.0.1:8000/api/${action}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email: email})
        }).then(response => {
            if (response.ok) {
                response.json().then(successText => {
                    dispatch(sendingSuccess(successText[0]));
                })
            } else {
                response.json().then(errorText => {
                    dispatch(sendingFail(errorText[0]));
                })
            }
        })
    }
}