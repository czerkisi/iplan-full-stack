import './App.css';
import "bootstrap/dist/css/bootstrap.min.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./components/LoginPage"
import LandingPage from "./components/LandingPage";
import SignUpPage from "./components/SignUpPage";
import React from "react";

class App extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            signedUp: false,
        }
    }

    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage/>} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default App;
