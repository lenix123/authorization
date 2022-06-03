import React, {createRef, useEffect, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {TextValidator, ValidatorForm} from "react-material-ui-form-validator";
import Link from "@mui/material/Link";
import {Link as RouterLink} from "react-router-dom";
import Button from "@mui/material/Button";

export default function ChangePassword(props) {
    const [oldPassword, changeOldPassword] = useState("");
    const [newPassword, changeNewPassword] = useState("");
    const [confirmNewPass, changeConfirmNewPass] = useState("");
    const {changeUserPassword, actionType, email} = props

    useEffect(() => {
        if (!ValidatorForm.hasValidationRule('isPasswordMatch')) {
            ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
                return value === newPassword;
            });
            return () => {
                ValidatorForm.removeValidationRule('isPasswordMatch');
            }
        }
    }, [newPassword])

    useEffect(() => {
        // after a request reset values
        if (actionType === "changeUserPassword") {
            changeOldPassword("");
            changeNewPassword("");
            changeConfirmNewPass("");
        }
    }, [actionType]);

    const oldPasswordRef = createRef();
    const newPasswordRef = createRef();
    const confirmNewPassRef = createRef();
    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "oldPassword") {
            oldPasswordRef.current.validate(value);
        } else if (name === "newPassword") {
            newPasswordRef.current.validate(value);
        } else if (name === "confirmNewPass") {
            confirmNewPassRef.current.validate(value);
        }
    }

    const handleChangePassword = (e) => {
        e.preventDefault();
        changeUserPassword(oldPassword, newPassword, confirmNewPass);
    }

    return (
        <Box sx={{mb: 3}}>
            <Typography variant="h6" component="div" sx={{marginBottom: 1}}>
                Change Password
            </Typography>
            <ValidatorForm component="form" onSubmit={handleChangePassword} instantValidate={false}>
                <TextValidator
                    ref={oldPasswordRef}
                    onBlur={handleBlur}
                    value={oldPassword}
                    onChange={e => changeOldPassword(e.target.value)}
                    sx={{mt: 1, mb: 1}}
                    size="small"
                    fullWidth
                    label="Old Password"
                    name="oldPassword"
                    type="password"
                    validators={['required']}
                    errorMessages={['this field is required']}
                />
                <TextValidator
                    ref={newPasswordRef}
                    onBlur={handleBlur}
                    value={newPassword}
                    onChange={e => changeNewPassword(e.target.value)}
                    sx={{mt: 1, mb: 1}}
                    fullWidth
                    size="small"
                    label="New Password"
                    name="newPassword"
                    type="password"
                    validators={['required']}
                    errorMessages={['this field is required']}
                />
                <TextValidator
                    ref={confirmNewPassRef}
                    onBlur={handleBlur}
                    value={confirmNewPass}
                    onChange={e => changeConfirmNewPass(e.target.value)}
                    sx={{mt: 1, mb: 2}}
                    fullWidth
                    size="small"
                    label="Confirm New Password"
                    name="confirmNewPass"
                    type="password"
                    validators={['isPasswordMatch', 'required']}
                    errorMessages={['password mismatch', 'this field is required']}
                />
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Link component={RouterLink}
                          to="/password_reset"
                          underline="none"
                          state={{email: email}}
                          variant="subtitle1"
                          sx={{mt: 0.5, ml: 0.5}}>
                        I forgot my password
                    </Link>
                    <Button variant="contained"
                            type="submit"
                    >
                        Change Password
                    </Button>
                </Box>
            </ValidatorForm>
        </Box>
    )
}