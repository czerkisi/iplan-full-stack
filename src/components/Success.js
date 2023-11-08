import React from 'react';
import './Auth.css';

class Success extends React.Component {
    render() {
        return (
            <span className={'success'}>{this.props.message}</span>
        );
    }
}

export default Success;