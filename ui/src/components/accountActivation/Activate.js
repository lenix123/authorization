import React, {useEffect, useState, Fragment} from "react";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import {connect} from "react-redux";
import {authSuccess} from "../../store/auth/actions";
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";


function Activate(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const params = useParams();
    const navigate = useNavigate();
    useEffect(() => {
        if (params.uid && params.token) {
            const {uid, token} = params;
            fetch(`http://127.0.0.1:8000/api/accounts/activate/${uid}/${token}/`, {
                method: 'GET',
            }).then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        props.authSuccess(data);
                        localStorage.setItem('authTokens', JSON.stringify(data));
                        setIsLoading(false);
                        navigate("/", {replace: true});
                    })
                } else {
                    setIsLoading(false);
                    setErrorMessage("Something wrong with your url!")
                }
            })
        }
    }, [params])

    const notification = errorMessage ?
        <Fragment>
            <Alert severity="error" sx={{width: 1}}>
                {errorMessage}
            </Alert>
            <Link sx={{mt: 2}} component={RouterLink} to="/">Home</Link>
        </Fragment> : "";

    return(
        <div>
            <Container maxWidth="xs">
                <Box sx={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    {isLoading ? (
                        <Fragment>
                            <p style={{fontSize: 22, textAlign: "center"}}>
                                Activating your email. It may take a few moments...
                            </p>
                            <CircularProgress sx={{mt: 2}}/>
                        </Fragment>
                    ) : notification
                    }
                </Box>
            </Container>
        </div>
    )
}

const mapDispatchToProps = {
    authSuccess
}

export default connect(null, mapDispatchToProps)(Activate);