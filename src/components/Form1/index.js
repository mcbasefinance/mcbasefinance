import React from 'react';
import './form1.css';


function Form1({ title, subtitle, children }) {
    return (
        <div className="form1">
            <h3>{title}</h3>
            <h3>{subtitle}</h3>
            {children}
        </div>
    );
}

export default Form1;