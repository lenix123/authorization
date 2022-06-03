import React, {useState, createRef} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {TextValidator, ValidatorForm} from "react-material-ui-form-validator";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import {Link as RouterLink} from "react-router-dom";


export default function ChangeEmail(props) {
    const {changeEmail, email} = props;
    const [newEmail, changeNewEmail] = useState("");
    const [password, changePassword] = useState("");

    const newEmailRef = createRef();
    const passwordRef = createRef();
    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "newEmail") {
            newEmailRef.current.validate(value);
        } else if (name === "password") {
            passwordRef.current.validate(value);
        }
    }

    const handleChangeEmail = (e) => {
        e.preventDefault();
        changeEmail(newEmail, password);
    }

    return (
        <Box sx={{mb: 3}}>
            <Typography variant="h6" component="div" sx={{marginBottom: 1}}>
                Change primary email
            </Typography>
            <ValidatorForm component="form" onSubmit={handleChangeEmail} instantValidate={false}>
                <TextValidator
                    ref={newEmailRef}
                    onBlur={handleBlur}
                    value={newEmail}
                    onChange={e => changeNewEmail(e.target.value)}
                    sx={{mt: 1, mb: 1}}
                    size="small"
                    fullWidth
                    label="New Email Address"
                    name="newEmail"
                    autoComplete="email"
                    validators={['required', 'isEmail']}
                    errorMessages={['this field is required', 'email is not valid']}
                />
                <TextValidator
                    ref={passwordRef}
                    onBlur={handleBlur}
                    value={password}
                    onChange={e => changePassword(e.target.value)}
                    sx={{mt: 1, mb: 2}}
                    fullWidth
                    size="small"
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="email"
                    validators={['required']}
                    errorMessages={['this field is required']}
                />
                <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <Link component={RouterLink}
                          to="/password_reset"
                          state={{email: email}}
                          underline="none"
                          variant="subtitle1"
                          sx={{mt: 0.5, ml: 0.5}}>
                        Forgot password?
                    </Link>
                    <Button variant="contained"
                            type="submit"
                    >
                        Change Email
                    </Button>
                </Box>
            </ValidatorForm>
        </Box>
    )
}