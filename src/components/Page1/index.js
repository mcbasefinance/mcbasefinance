import React from 'react';
import './page1.css';


function Page({ children }) {
    return (
        <div className="page1">
            {children}
        </div>
    );
}

export default Page;