import React, { useCallback, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import moment from "moment";

import { sendTransaction } from "../../../mcbase/metamask";

import useAllowance from "../../../hooks/useAllowance"
import useTokenBalance from "../../../hooks/useTokenBalance"
import useApprove from "../../../hooks/useApprove"
import useVaultsDeposit from "../../../hooks/useVaultsDeposit"
import useVaultsWithdraw from "../../../hooks/useVaultsWithdraw"
import useStrategyHarvest from "../../../hooks/useStrategyHarvest"

import config from "../../../config";

import { Row, Col, Card } from "react-bootstrap";
import { NotificationManager } from "react-notifications";
import Step from "../../../components/Steper";
import Input from "../../../components/Input";

import "react-notifications/lib/notifications.css";

import icon_expand from "../../../assets/images/icon_expand.png";
import icon_collapse from "../../../assets/images/icon_collapse.png";

import Accordion from "react-bootstrap/Accordion";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import AccordionContext from "react-bootstrap/AccordionContext";

import "../index.css";


const VaultForm = ({ vaultData, index, totalValue, apy, dpy }) => {

    BigNumber.config({
        DECIMAL_PLACES: 18,
        FORMAT: {
            // string to prepend
            prefix: "",
            // decimal separator
            decimalSeparator: ".",
            // grouping separator of the integer part
            groupSeparator: ",",
            // primary grouping size of the integer part
            groupSize: 3,
        },
    });

    const [tokenVal, setTokenVal] = useState(0)
    const [vaultTokenVal, setVaultTokenVal] = useState(0)
    const [tokenSliderVal, setTokenSliderVal] = useState(0)
    const [vaultTokenSliderVal, setVaultTokenSliderVal] = useState(0)

    const tokenBalance = useTokenBalance(vaultData.tokenContract)
    const vaultTokenBalance = useTokenBalance(vaultData.vaultContract)

    const [pendingTx, setPendingTx] = useState(false)

    const allowance = useAllowance(vaultData.tokenContract, vaultData.vaultContract)

    const { onApprove } = useApprove(vaultData.tokenContract, vaultData.vaultContract)
    const { onDeposit } = useVaultsDeposit(vaultData.vaultContract)
    const { onWithdraw } = useVaultsWithdraw(vaultData.vaultContract)
    const { onHarvest } = useStrategyHarvest(vaultData.strategyContract)


    function ContextAwareToggle({ children, eventKey, callback }) {
        const currentEventKey = useContext(AccordionContext);

        const decoratedOnClick = useAccordionToggle(
            eventKey,
            () => callback && callback(eventKey)
        );

        const isCurrentEventKey = currentEventKey === eventKey;

        return (
            <button
                type="button"
                // style={{ backgroundColor: isCurrentEventKey ? "pink" : "lavender" }}
                onClick={decoratedOnClick}
                className="toggle"
            >
                <img src={isCurrentEventKey ? icon_collapse : icon_expand} />
            </button>
        );
    }

    const onChangePercentHandler = (payload) => {
        if (payload.side === "left") {
            setTokenSliderVal(payload.value)
            setTokenVal(tokenBalance.times(new BigNumber(payload.value)).div(100).toNumber())
        } else {
            setVaultTokenSliderVal(payload.value)
            setVaultTokenVal(vaultTokenBalance.times(new BigNumber(payload.value)).div(100).toNumber())
        }
    };

    return (
        <Card key={index}>
            <Card.Header>
                <Row className="d-flex justify-content-between">
                    <div className="icon">
                        <img src={vaultData.logo} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Row>
                            <Col className="title-panel">
                                <div className="title">{vaultData.title}</div>
                                <div className="uses">{vaultData.uses}</div>
                            </Col>
                            <Col className="">
                                <div className="value d-flex justify-content-center">
                                    {tokenBalance.toFormat(2)}
                                </div>
                                <div className="uses d-flex justify-content-center">
                                    Balance
                            </div>
                            </Col>
                            <Col>
                                <div className="value d-flex justify-content-center">
                                    {vaultTokenBalance.toFormat(2)}
                                </div>
                                <div className="uses d-flex justify-content-center">
                                    Deposited
                            </div>
                            </Col>
                            <Col>
                                <div className="value d-flex justify-content-center">
                                    {apy.toFormat(2)}%
                                </div>
                                <div className="uses d-flex justify-content-center">
                                    APY
                            </div>
                            </Col>
                            <Col>
                                <div className="value d-flex justify-content-center">
                                    {dpy.toFormat(2)}%
                                </div>
                                <div className="uses d-flex justify-content-center">
                                    Daily
                            </div>
                            </Col>
                            <Col>
                                <div className="value d-flex justify-content-center">
                                    ${totalValue.toFormat(2)}
                                </div>
                                <div className="uses d-flex justify-content-center">
                                    TVL
                            </div>
                            </Col>
                        </Row>
                    </div>
                    <ContextAwareToggle
                        eventKey={index + 1}
                    ></ContextAwareToggle>
                </Row>
            </Card.Header>
            <Accordion.Collapse eventKey={index + 1}>
                <Card.Body>
                    <Row>
                        <Col xs={5} className="col-12 col-lg-5 mb-5">
                            <div className="fe-balance-desc">
                                Balance: {tokenBalance.toFormat(4)} {vaultData.symbol}
                            </div>
                            <div>
                                <Input
                                    value={tokenVal}
                                    name=""
                                    onChangeHandler={() => { }}
                                    className="input-balance"
                                />
                            </div>
                            <div className="div-steper">
                                <Step
                                    value={tokenSliderVal}
                                    index={index}
                                    side="left"
                                    onChangePercentHandler={onChangePercentHandler}
                                ></Step>
                            </div>
                        </Col>
                        <Col xs={5} className="col-12 col-lg-5 mb-5">
                            <div className="fe-balance-desc">
                                Balance: {vaultTokenBalance.toFormat(4)} {vaultData.vaultSymbol}
                            </div>
                            <div>
                                <Input
                                    value={vaultTokenVal}
                                    name=""
                                    onChangeHandler={() => { }}
                                    className="input-balance"
                                />
                            </div>
                            <div className="div-steper">
                                <Step
                                    value={vaultTokenSliderVal}
                                    index={index}
                                    side="right"
                                    onChangePercentHandler={onChangePercentHandler}
                                ></Step>
                            </div>
                        </Col>
                        <Col xs={2} className="empty"></Col>
                    </Row>
                    <Row className="btn-row">
                        <Col xs={5} className="col-12 col-lg-5 mb-2">
                            <div className="">
                                {!allowance.toNumber() ?
                                    (
                                        <button className="btn-red"
                                            onClick={async () => {
                                                setPendingTx(true)
                                                try {
                                                    await onApprove()
                                                } catch (error) {
                                                    // console.log('error :>> ', error);
                                                }
                                                setPendingTx(false)
                                            }}
                                        >
                                            APPROVE
                                        </button>
                                    ) :
                                    (
                                        <div className="d-flex justify-content-between">
                                            <button className="btn-red"
                                                onClick={async () => {
                                                    setPendingTx(true)
                                                    try {
                                                        await onDeposit(tokenVal, false)
                                                        setPendingTx(false)
                                                    } catch (error) {
                                                        // console.log('error :>> ', error);
                                                    }
                                                    setPendingTx(false)
                                                }}
                                            >
                                                DEPOSIT
                                            </button>
                                            <button className="btn-red"
                                                onClick={async () => {
                                                    setPendingTx(true)
                                                    try {
                                                        await onDeposit('', true)
                                                        setPendingTx(false)
                                                    } catch (error) {
                                                        // console.log('error :>> ', error);
                                                    }
                                                    setPendingTx(false)
                                                }}
                                            >
                                                DEPOSIT ALL
                                            </button>
                                        </div>
                                    )}
                            </div>
                        </Col>
                        <Col xs={5} className="col-12 col-lg-5 mb-2">
                            <div className="d-flex justify-content-between">
                                <button className="btn-red-outline"
                                    onClick={async () => {
                                        setPendingTx(true)
                                        try {
                                            await onWithdraw(vaultTokenVal, false)
                                        } catch (error) {
                                            // console.log('error :>> ', error);
                                        }
                                        setPendingTx(false)
                                    }}
                                >
                                    WITHDRAW
                                </button>
                                <button className="btn-red-outline"
                                    onClick={async () => {
                                        setPendingTx(true)
                                        try {
                                            await onWithdraw('', true)
                                        } catch (error) {
                                            // console.log('error :>> ', error);
                                        }
                                        setPendingTx(false)
                                    }}
                                >
                                    WITHDRAW ALL
                                </button>
                            </div>
                        </Col>
                        <Col className="empty">
                            <button className="btn-black"
                                onClick={async () => {
                                    setPendingTx(true)
                                    try {
                                        await onHarvest()
                                    } catch (error) {
                                        // console.log('error :>> ', error);
                                    }
                                    setPendingTx(false)
                                }}
                            >
                                HARVEST
                            </button>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="fe-desc">
                            {"There is a 0.05% withdraw fee to prevent pool hopping"}
                        </Col>
                    </Row>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

export default VaultForm;
