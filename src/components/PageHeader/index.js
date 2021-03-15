import React from 'react';
import './pageheader.css';


function PageHeader({title, link, linkURL, content}) {
    return (
        <div className="pageheader">
            <h2>{title} <a href={linkURL} target='_blank' rel="noreferrer" style={{color: '#5CC6D5'}}>{link}</a></h2>
            <span className='content'>{content}</span>
        </div>
    );
}

export default PageHeader;