import React, {createRef, useEffect, useState} from "react";
import {Link as RouterLink, useNavigate, useParams} from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import {TextValidator, ValidatorForm} from "react-material-ui-form-validator";
import Button from "@mui/material/Button";
import {connect} from "react-redux";
import {sendingSuccess} from "../../store/emailConfirmation/actions";

function ResetPasswordConfirm(props) {
    const [password, changePassword] = useState("");
    const [confirmPassword, changeConfirmPassword] = useState("");

    useEffect(() => {
        if (!ValidatorForm.hasValidationRule('isPasswordMatch')) {
            ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
                return value === password;
            });
            return () => {
                ValidatorForm.removeValidationRule('isPasswordMatch');
            }
        }
    }, [password])

    const params = useParams();
    const navigate = useNavigate();
    const handleSubmit = (event) => {
        event.preventDefault();
        if (params.uid && params.token) {
            const {uid, token} = params
            fetch(`http://127.0.0.1:8000/api/accounts/password_reset_confirm/${uid}/${token}/`, {
                method: 'POST',
                body: JSON.stringify ({
                    new_password: password,
                    confirm_password: confirmPassword
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
            }).then(response => {
                if (response.status === 201) {
                    props.sendingSuccess("Your password was changed")
                    navigate("/signin", {replace: true});
                } else {
                    console.log("Something wrong with your url!")
                }
            })
        }
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "password") {
            passwordRef.current.validate(value);
        } else if (name === "confirmPassword") {
            confirmPasswordRef.current.validate(value);
        }
    }

    const passwordRef = createRef();
    const confirmPasswordRef = createRef();
    return (
        <Box sx={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <Avatar sx={{ marginBottom: 3, bgcolor: 'secondary.main', width: 60, height: 60 }}>
                <LockOutlinedIcon fontSize="large"/>
            </Avatar>
            <Typography component="h1" variant="h5" sx={{marginBottom: 2}}>
                Set a new password
            </Typography>
            <Container component="main" maxWidth="xs">
                <Box sx={{
                    padding: 3,
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                }}
                >
                    <Typography variant='subtitle1'>
                        Set a new password for your account
                    </Typography>
                    <ValidatorForm component="form" onSubmit={handleSubmit} instantValidate={false}>
                        <TextValidator
                            ref={passwordRef}
                            margin="normal"
                            label="New password"
                            fullWidth
                            onBlur={handleBlur}
                            value={password}
                            onChange={e => changePassword(e.target.value)}
                            name="password"
                            type="password"
                            autoFocus={true}
                            validators={['required']}
                            errorMessages={['this field is required']}
                        />
                        <TextValidator
                            ref={confirmPasswordRef}
                            margin="normal"
                            label="Confirm new password"
                            fullWidth
                            onBlur={handleBlur}
                            value={confirmPassword}
                            onChange={e => changeConfirmPassword(e.target.value)}
                            name="confirmPassword"
                            type="password"
                            validators={['isPasswordMatch', 'required']}
                            errorMessages={['password mismatch', 'this field is required']}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }}
                        >
                            Set a new password
                        </Button>
                    </ValidatorForm>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Link component={RouterLink} to="/signin" replace>
                            Cancel
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    )
}

const mapDispatchToProps = {
    sendingSuccess
}

export default connect(null, mapDispatchToProps)(ResetPasswordConfirm);