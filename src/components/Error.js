import React from "react";
import "./Auth.css";

class Error extends React.Component {
    render() {
        return (
            <div className="error">
                <p>{this.props.message}</p>
            </div>
        );
    }
}

export default Error;
