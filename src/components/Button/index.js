import React from 'react';
import './button.css';


function Button({ children, onClickHandler, color }) {
    return (
        <>
            {color === 'orange' ?
                (
                    <div className="obutton" onClick={(e) => onClickHandler(e)}>
                        {children}
                    </div>
                ) :
                color === 'red' ?
                    (
                        <div className="rbutton" onClick={(e) => onClickHandler(e)}>
                            {children}
                        </div>
                    ) :
                    color === 'grey' ?
                        (
                            <div className="gbutton" onClick={(e) => onClickHandler(e)}>
                                {children}
                            </div>
                        )
                        :
                        (
                            <div className="wbutton" onClick={(e) => onClickHandler(e)}>
                                {children}
                            </div>
                        )
            }
        </>
    );
}

export default Button;