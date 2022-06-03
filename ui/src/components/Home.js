import React from "react";
import Header from "./header/Header";
import {connect} from "react-redux";
import {updateTokens} from "../store/auth/actions";

function Home(props) {
    return (
        <div>
            <Header />
        </div>
    )
}

const mapDispatchToProps = {
    updateTokens
}

export default connect(null, mapDispatchToProps)(Home);