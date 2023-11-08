import React from "react";
import './Auth.css';
import Error from "./Error";
import Success from "./Success"
import { SERVER_ENDPOINT } from "./ServerEndpoint";
import queryString from 'query-string';
import {Navigate} from "react-router-dom";

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        const query = queryString.parse(window.location.search);

        this.state = {
            username: '',
            password: '',
            newAccount: query.signedUp,
            loggedIn: false
        };
    }
    login = async (event) => {
        console.log('logging in');
        event.preventDefault(); // prevent the default form submission behavior
        const response = await fetch(`${SERVER_ENDPOINT}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        });

        let status;
        try {
            const responseJSON = await response.json();
            if ("error" in responseJSON){
                status = responseJSON.error;
            } else {
                status = '';
                this.setState({
                    loggedIn: true
                });
            }
        } catch (error){
            status = 'Unknown Server Occurred';
        }
        this.setState({ error: status })
    };

    updateUsername(username) {
        this.setState({
            username: username
        });
    }

    updatePassword(password) {
        this.setState({
            password: password
        })
    }

    render(){
        if (this.state.loggedIn) {
            return <Navigate to={"/login?signedUp=true"} replace={true}></Navigate>
        }
        return (
            <div className="Auth-form-container">
                {this.state.newAccount && <Success message={'Your new account was successfully created'}></Success>}
                <form className="Auth-form">
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign In</h3>
                        {!this.state.newAccount &&
                            <div className="Auth-form-subtitle">
                                <span>Don't have an account? </span>
                                <a href="/signup">Sign up here</a>
                            </div>
                        }
                        <div className="form-group mt-3">
                            <label>Username</label>
                            <input type="text" className="form-control mt-1" placeholder="Enter username" onChange={(event) => this.updateUsername(event.target.value)}/>
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input type="password" className="form-control mt-1" placeholder="Enter password" onChange={(event) => this.updatePassword(event.target.value)}/>
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button className="btn btn-primary" onClick={event => this.login(event)}>Sign In</button>
                        </div>
                        {this.state.error && <Error message={this.state.error}></Error>}
                    </div>
                </form>
            </div>
        )
    }
}

export default LoginPage;