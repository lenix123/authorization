import React, {createRef, useEffect, useState} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import stringToColor from "../../header/colorGenerator";
import {TextValidator, ValidatorForm} from "react-material-ui-form-validator";
import Button from "@mui/material/Button";
import Grid from '@mui/material/Grid';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {connect} from "react-redux";
import {deleteAccount, deleteUser, resetProfileError, updateProfileData} from "../../../store/userProfile/actions";
import {logout} from "../../../store/auth/actions";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import Link from "@mui/material/Link";


function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 56,
      height: 56,
      fontSize: 30,
    },
    children: `${name[0]}`,
  };
}


function EditProfile(props) {
    const {personalInfo, updateProfileData, actionType, deleteUser, status, logout, resetProfileError} = props;
    const [firstName, changeFirstName] = useState(personalInfo.first_name);
    const [lastName, changeLastName] = useState(personalInfo.last_name);
    const [email, changeEmail] = useState(personalInfo.email);
    const [isFirstNameChanged, setIsFirstNameChanged] = useState(false);
    const [isLastNameChanged, setIsLastNameChanged] = useState(false);

    useEffect(() => {
        setIsFirstNameChanged(firstName !== personalInfo.first_name);
    }, [firstName, personalInfo])

    useEffect(() => {
        setIsLastNameChanged(firstName !== personalInfo.first_name);
    }, [lastName, personalInfo])

    const navigate = useNavigate();
    useEffect(() => {
        if (actionType === "deleteUser") {
            if (status === 204) {
                props.deleteAccount();
                logout();
                navigate("/", {replace: true});
            }
            return () => {
                resetProfileError();
            }
        }
    }, [actionType, status])

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isFirstNameChanged || isLastNameChanged) {
            let newProfileInfo = {};
            if (isFirstNameChanged) {
                newProfileInfo.first_name = firstName;
            }
            if (isLastNameChanged) {
                newProfileInfo.last_name = lastName;
            }
            updateProfileData(newProfileInfo)
        }
    };

    const [openAlert, setOpenAlert] = React.useState(false);
    const handleOpenAlert = (event) => {
        event.preventDefault();
        setOpenAlert(true);
    }

    const handleDelete = (event) => {
        event.preventDefault();
        deleteUser();
    }

    const handleClose = () => {
        setOpenAlert(false);
    };

    const firstNameRef = createRef();
    const lastNameRef = createRef();
    const emailRef = createRef();
    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "firstName") {
            firstNameRef.current.validate(value);
        } else if (name === "lastName") {
            lastNameRef.current.validate(value);
        } else if (name === "email") {
            emailRef.current.validate(value);
        }
    }

    const isProfileChanged = isFirstNameChanged || isLastNameChanged;
    return (
        <Box sx={{
            display: "flex",
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 7
        }}>
            <Typography variant="h4" component="div" sx={{marginBottom: 1}}>
                Personal Info
            </Typography>
            <Avatar {...stringAvatar(personalInfo.first_name)} />
            <Box sx={{marginTop: 4, width: "55%"}}>
                <ValidatorForm component="form" onSubmit={handleSubmit} instantValidate={false}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextValidator
                                ref={firstNameRef}
                                margin="normal"
                                label="First Name"
                                fullWidth
                                onBlur={handleBlur}
                                value={firstName}
                                onChange={e => changeFirstName(e.target.value)}
                                name="firstName"
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextValidator
                                ref={lastNameRef}
                                margin="normal"
                                label="Last Name"
                                fullWidth
                                onBlur={handleBlur}
                                value={lastName}
                                onChange={e => changeLastName(e.target.value)}
                                name="lastName"
                                validators={['required']}
                                errorMessages={['this field is required']}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextValidator
                                ref={emailRef}
                                onBlur={handleBlur}
                                value={email}
                                onChange={e => changeEmail(e.target.value)}
                                fullWidth
                                id="email"
                                label="Email Address"
                                disabled
                                name="email"
                                autoComplete="email"
                                validators={['required', 'isEmail']}
                                errorMessages={['this field is required', 'email is not valid']}
                            />
                            <Link component={RouterLink}
                                  to="/userprofile/emails"
                                  underline="none"
                                  variant="subtitle1"
                                  sx={{mt: 0.8, ml: 0.5}}
                            >
                                Change email
                            </Link>
                        </Grid>
                    </Grid>
                    <Box sx={{display: "flex", justifyContent: "space-between"}}>
                        <Button
                            startIcon={<DeleteIcon />}
                            variant="contained"
                            onClick={handleOpenAlert}
                            color="error"
                            sx={{ mt: 2, mb: 2 }}
                        >
                            Delete
                        </Button>
                        <Dialog
                            open={openAlert}
                            onClose={handleClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                                Delete your account?
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    You are about to delete this account.
                                    You will not have an access to this account anymore.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button onClick={handleDelete}
                                        color="error"
                                        variant="contained"
                                        disableElevation
                                >
                                    Delete
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Button
                            startIcon={<SaveIcon />}
                            type="submit"
                            disabled={!isProfileChanged}
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }}
                        >
                            Save
                        </Button>
                    </Box>
                </ValidatorForm>
            </Box>
        </Box>
    )
}

const mapStateToProps = (state) => {
    return {
        personalInfo: state.account.personalInfo,
        status: state.account.status,
        actionType: state.account.actionType,
    }
}

const mapDispatchToProps = {
    updateProfileData,
    deleteUser,
    deleteAccount,
    logout,
    resetProfileError
}

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile);