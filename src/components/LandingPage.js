import React from "react";

class LandingPage extends React.Component {
    render() {
        return (
            <div className="Auth-form-container">
                <div className="Auth-form">
                    <div className="Auth-form-content">
                        <h1 className="Auth-form-title">Welcome to iPlan</h1>
                        <div className="btn-container">
                            <a href="/login">
                                <button className={"btn btn-primary"}>Log In</button>
                            </a>
                            <a href="/signup">
                                <button className={"btn btn-primary"}>Sign Up</button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default LandingPage;
