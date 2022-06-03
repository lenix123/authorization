import React from "react";
import {useLocation, Navigate} from "react-router-dom";

function RequireAuth(props) {
    const location = useLocation();
    const tokens = localStorage.getItem('authTokens');

    const Component = tokens ? props.children : <Navigate to="/signin"
                                                          state={{from: location}}
                                                          replace />
    return (
        Component
    );
}

export default RequireAuth;