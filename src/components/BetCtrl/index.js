import React from 'react';
import {Row, Col} from 'react-bootstrap';
import Input from '../Input';
import LabelButton from '../Button/labelButton';
import './betctrl.css';


function BetCtrl({label, name, balance, currentVal, onChangeHandler}) {
    
    const onMax = (e) => {
        let event = {
            target : {
                name: name,
                value: balance
            }
        };
        onChangeHandler(event);
    }

    return (
        <Row className='mt-2 mb-2'>
            <Col xs={8} className="text-left">
                <span className="numberSpan">{label}</span>
            </Col>
            <Col xs={4} className='text-right'>
                <LabelButton onClickHandler={onMax}>Max</LabelButton>
            </Col>
            <Col sm={12} className='mt-2'>
                <Input name={name} value={currentVal} onChangeHandler={onChangeHandler}/>
            </Col>
        </Row>
    );
}

export default BetCtrl;