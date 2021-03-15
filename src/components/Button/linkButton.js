import React from 'react';
import './button.css';


function LinkButton({ children, href, onClickHandler }) {
    return (
        <a className="linkButton" href={href} target='_blank' rel="noreferrer">{children}</a>
    );
}

export default LinkButton;