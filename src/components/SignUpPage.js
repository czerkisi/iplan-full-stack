import React, { Component } from "react";
import './Auth.css';
import Error from "./Error.js";
import { SERVER_ENDPOINT } from "./ServerEndpoint";
import { Link, Navigate } from "react-router-dom";

class SignUpPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            username: "",
            password: "",
            confirmPassword: "",
            errors: {},
            error: null,
            signedUp: false,
        };
    }

    componentDidMount() {
        if (this.state.redirectToLogin) {
            window.location.href = "/login";
        }
    }

    async signup(event) {
        console.log('signing up');
        event.preventDefault(); // prevent the default form submission behavior

        let errors = {};

        // Name validation
        if (!this.state.name) {
            errors.name = "Name is required";
        }

        // Email validation
        if (!this.state.email) {
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(this.state.email)) {
            errors.email = "Email is invalid";
        }

        // Username validation
        if (!this.state.username) {
            errors.username = "Username is required";
        }

        // Password validation
        if (!this.state.password) {
            errors.password = "Password is required";
        } else if (this.state.password.length < 6) {
            errors.password = "Password must be at least 6 characters long";
        }

        // Confirm password validation
        if (!this.state.confirmPassword) {
            errors.confirmPassword = "Confirm password is required";
        } else if (this.state.password !== this.state.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        this.setState({
            errors: errors
        });

        if (Object.keys(errors).length === 0) {
            const response = await fetch(`${SERVER_ENDPOINT}/createUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password,
                }),
            });
            const responseJSON = await response.json();
            if ("error" in responseJSON) {
                this.setState({
                    error: responseJSON.error
                });
            } else {
                console.log('true dat');
                this.setState({
                    signedUp: true
                });
            }
        }
        console.log('ending');
    }

    render() {
        if (this.state.signedUp) {
            return <Navigate to={"/login?signedUp=true"} replace={true}></Navigate>
        }
        const {name, email, username, password, confirmPassword, errors, error} = this.state;
        return (
            <div className="Auth-form-container">
                <form className="Auth-form">
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign Up</h3>
                        <div className="Auth-form-subtitle">
                            <span>Already have an account? </span>
                            <Link to="/signin">Sign in here</Link>
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="name">Name</label>
                            <input type="text" className={`form-control mt-1 ${errors.name ? 'is-invalid' : ''}`}
                                   placeholder="Enter your full name" value={name}
                                   onChange={(event) => this.setState({ name: event.target.value })}/>
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="email">Email</label>
                            <input type="email" className={`form-control mt-1 ${errors.email ? 'is-invalid' : ''}`}
                                   placeholder="Enter your email" value={email}
                                   onChange={(event) => this.setState({ email: event.target.value })}/>
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="username">Username</label>
                            <input type="text" className={`form-control mt-1 ${errors.username ? 'is-invalid' : ''}`}
                                   placeholder="Enter your username" value={username}
                                   onChange={(event) => this.setState({ username: event.target.value })}/>
                            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="password">Password</label>
                            <input type="password"
                                   className={`form-control mt-1 ${errors.password ? 'is-invalid' : ''}`}
                                   placeholder="Enter a password" value={password}
                                   onChange={(event) => this.setState({ password: event.target.value })}/>
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input type="password"
                                   className={`form-control mt-1 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                   placeholder="Confirm your password" value={confirmPassword}
                                   onChange={(event) => this.setState({ confirmPassword: event.target.value })}/>
                            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button className="btn btn-primary" onClick={event => this.signup(event)}>Sign Up</button>
                        </div>
                        {error && <Error message={error}/>}
                    </div>
                </form>
            </div>
        );
    }
}

export default SignUpPage;