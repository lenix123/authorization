import React, {useState, createRef} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {TextValidator, ValidatorForm} from "react-material-ui-form-validator";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";


export default function RecoveryEmail(props) {
    const {personalInfo, setRecoveryEmail} = props;
    const {is_recovery_email_verified, recovery_email} = personalInfo;
    const [addEmail, changeAddEmail] = useState("");

    const addEmailRef = createRef();
    const handleBlur = (event) => {
        const { name, value } = event.target;
        if (name === "addEmail") {
            addEmailRef.current.validate(value);
        }
    }

    const handleAddEmail = (e) => {
        e.preventDefault();
        setRecoveryEmail(addEmail);
    }

    const [openDialog, setOpenDialog] = React.useState(false);
    const handleOpenDialog = (event) => {
        event.preventDefault();
        setOpenDialog(true);
    }

    const handleDeleteRecovery = (event) => {
        event.preventDefault();
        setRecoveryEmail("");
    }

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    let RecoveryEmailComponent;
    if (recovery_email && is_recovery_email_verified) {
        RecoveryEmailComponent =
            <Box>
                <Alert variant="outlined" severity="success" action={
                    <Tooltip title="Delete">
                        <IconButton onClick={handleOpenDialog}>
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                }>
                    Your recovery email is&nbsp;
                    <span style={{textDecoration: "underline"}}>{recovery_email}</span>.
                </Alert>
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        Delete recovery email {recovery_email}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            You are about to delete your recovery email.
                            You will not receive notifications on this email address.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleDeleteRecovery}
                                autoFocus
                                color="error"
                                variant="contained"
                                disableElevation
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
    } else if (recovery_email && !is_recovery_email_verified) {
        RecoveryEmailComponent =
            <Alert variant="outlined" severity="warning" action={
                <Button color="inherit" size="small" onClick={handleDeleteRecovery}>
                    UNDO
                </Button>
            }>
                We sent an email with further instructions on&nbsp;
                <span style={{textDecoration: "underline"}}>{recovery_email}</span>.
                Please confirm that you have an access to this email account.
            </Alert>
    } else {
        RecoveryEmailComponent =
            <ValidatorForm component="form" onSubmit={handleAddEmail} instantValidate={false}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={9}>
                        <TextValidator
                            ref={addEmailRef}
                            onBlur={handleBlur}
                            value={addEmail}
                            onChange={e => changeAddEmail(e.target.value)}
                            size="small"
                            fullWidth
                            label="Email Address"
                            name="addEmail"
                            autoComplete="email"
                            validators={['required', 'isEmail']}
                            errorMessages={['this field is required', 'email is not valid']}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button variant="contained"
                                fullWidth
                                type="submit"
                        >
                            Add
                        </Button>
                    </Grid>
                </Grid>
            </ValidatorForm>
    }

    return (
        <Box>
            <Typography variant="h6" component="div" sx={{mt: 3}}>
                Add recovery email
            </Typography>
            <Typography variant="body2" component="div" sx={{mb: 2, mt: 1, color: "#3c4043"}}>
                The address where we can contact you if there’s unusual activity in your account or if you get
                locked out.
            </Typography>
            {personalInfo && RecoveryEmailComponent}
        </Box>
    )
}