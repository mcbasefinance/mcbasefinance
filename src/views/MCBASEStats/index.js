import React, { useCallback, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { sendTransaction } from '../../mcbase/metamask';
import Countdown, { zeroPad, CountdownRenderProps } from 'react-countdown';

import {
    getTotalSupply,
    getBalance,
    getMcBaseRebaseLag,
    getMcBaseSupersizeRate,
    getMcBasePriceInUSD,
    getMcBaseAveragePriceInUSD,
    getMcBaseEpochCycle,
    getMcBaseLastEpochTime,
    totalStaked,
    getLpPrice

} from '../../mcbase/utils';

import {
    mcbaseTokenContract,
    mcbaseBnbLPTokenContract,
    mcbaseBusdLPTokenContract,
    mcbaseCakeLPTokenContract,
    mcbaseShareboxGeyserContract,
    mcbaseDollarGeyserContract,
    mcbaseFlurryGeyserContract,
    mcbaseFranchiseGeyserContract
} from '../../mcbase/contracts';

import useBlock from '../../hooks/useBlock';
import useWBNBPrice from '../../hooks/useWBNBPrice';
import useMcBasePrice from '../../hooks/useMcBasePrice';

import config from '../../config';

import { Row, Col } from 'react-bootstrap'
import { NotificationManager } from 'react-notifications';
import Page1 from '../../components/Page1'
import PageHeader from '../../components/PageHeader'
import Form1 from '../../components/Form1'
import Button from '../../components/Button'
import LinkButton from '../../components/Button/linkButton.js'

import 'react-notifications/lib/notifications.css';

import hamburger from '../../assets/images/hamburger.svg';
import fries from '../../assets/images/fries.svg';


function Stats() {
    const address = useSelector(state => state.authUser.address);
    const networkId = useSelector(state => state.authUser.networkId);

    BigNumber.config({
        DECIMAL_PLACES: 18,
        FORMAT: {
            // string to prepend
            prefix: '',
            // decimal separator
            decimalSeparator: '.',
            // grouping separator of the integer part
            groupSeparator: ',',
            // primary grouping size of the integer part
            groupSize: 3,
        }
    });

    const block = useBlock()
    const bnbPrice = useWBNBPrice()
    const mcbasePrice = useMcBasePrice()

    const [progress, setProgress] = useState(false);
    const [totalSupply, setTotalSupply] = useState(new BigNumber(0));
    const [circulatingSupply, setCirculatingSupply] = useState(new BigNumber(0));
    const [rebaseLag, setRebaseLag] = useState(5);
    const [supersizeRate, setSupersizeRate] = useState(new BigNumber(0));
    const [circulatingMCap, setCirculatingMCap] = useState(new BigNumber(0));
    const [tokenAveragePriceInUSD, setTokenAveragePriceInUSD] = useState(new BigNumber(0));
    const [timeToSupersize, setTimeToSupersize] = useState(0);
    const [totalTVL, setTotalTVL] = useState(new BigNumber(0));
    const [live, setLive] = useState(false);

    useEffect(() => {
        let isSubscribed = true
        async function fetchAllData(firstFlag = false) {
            if(!isSubscribed)
                return;
                
            const mcbaseBnbLpPrice = await getLpPrice(mcbaseBnbLPTokenContract, 'WBNB', true, bnbPrice, mcbasePrice)
            const mcbaseBusdLpPrice = await getLpPrice(mcbaseBusdLPTokenContract, 'MCBASE', true, bnbPrice, mcbasePrice)
            const mcbaseCakeLpPrice = await getLpPrice(mcbaseCakeLPTokenContract, 'MCBASE', false, bnbPrice, mcbasePrice)

            let totalSupply = await getTotalSupply(mcbaseTokenContract.contract);
            let selfLockedBalance = await getBalance(mcbaseTokenContract.contract, mcbaseTokenContract.address);
            let timeLockedBalance = await getBalance(mcbaseTokenContract.contract, config.contractOwner.mcbaseTimelockAddress);
            let rewardPool1Balance = await getBalance(mcbaseTokenContract.contract, config.contractOwner.shareboxRewardPool);
            let rewardPool2Balance = await getBalance(mcbaseTokenContract.contract, config.contractOwner.dollarRewardPool);
            let rewardPool3Balance = await getBalance(mcbaseTokenContract.contract, config.contractOwner.flurryRewardPool);
            let deployerBalance = await getBalance(mcbaseTokenContract.contract, config.contractOwner.mcbaseDeployerAddress);

            let circulatingSupply = totalSupply
                .minus(selfLockedBalance)
                .minus(timeLockedBalance)
                .minus(rewardPool1Balance)
                .minus(rewardPool2Balance)
                .minus(rewardPool3Balance)
                .minus(deployerBalance);

            setTotalSupply(totalSupply);
            setCirculatingSupply(circulatingSupply);

            setRebaseLag(await getMcBaseRebaseLag(mcbaseTokenContract));

            let supersizeInterval = await getMcBaseEpochCycle(mcbaseTokenContract);
            let lastSupersize = await getMcBaseLastEpochTime(mcbaseTokenContract);
            let currentTimeStamp = moment().unix();

            if (lastSupersize == 0) {
                setLive(false);
                setTimeToSupersize(0);
            }
            else {
                setLive(true);
                setSupersizeRate(await getMcBaseSupersizeRate(mcbaseTokenContract));
                setTokenAveragePriceInUSD(await getMcBaseAveragePriceInUSD(mcbaseTokenContract));
                setCirculatingMCap(circulatingSupply.times(mcbasePrice));
                if (lastSupersize + supersizeInterval > currentTimeStamp)
                    setTimeToSupersize((lastSupersize + supersizeInterval) * 1000);
                else
                    setTimeToSupersize(0);
            }

            let totalShareboxStakedAmount = await totalStaked(mcbaseShareboxGeyserContract);
            let bnbLpTvl = totalShareboxStakedAmount.times(mcbaseBnbLpPrice);

            let totalDollarStakedAmount = await totalStaked(mcbaseDollarGeyserContract);
            let busdLpTvl = totalDollarStakedAmount.times(mcbaseBusdLpPrice);

            let totalFlurryStakedAmount = await totalStaked(mcbaseFlurryGeyserContract);
            let cakeLpTvl = totalFlurryStakedAmount.times(mcbaseCakeLpPrice);

            let totalFranchiseStakedAmount = await totalStaked(mcbaseFranchiseGeyserContract);
            let franchiseTvl = totalFranchiseStakedAmount.times(mcbaseBnbLpPrice);

            setTotalTVL(bnbLpTvl.plus(busdLpTvl).plus(cakeLpTvl).plus(franchiseTvl));

        }

        if (address &&
            mcbaseTokenContract &&
            mcbaseBnbLPTokenContract &&
            mcbaseBusdLPTokenContract &&
            mcbaseCakeLPTokenContract) {
            fetchAllData(true);
        }

        return () => isSubscribed = false

    }, [block,
        address,
        mcbaseTokenContract,
        mcbaseBnbLPTokenContract,
        mcbaseBusdLPTokenContract,
        mcbaseCakeLPTokenContract])

    const renderer = (countdownProps) => {
        const { days, hours, minutes, seconds } = countdownProps

        return (
            <span style={{ width: '100%' }}>
                { seconds > 0 ?
                    (<div>{hours} Hours&nbsp;&nbsp;&nbsp;{minutes + 1} Minutes</div>) :
                    (<div>{hours} Hours&nbsp;&nbsp;&nbsp;{minutes} Minutes</div>)
                }
            </span>
        )
    }

    const transactionDone = () => {
        setProgress(false);
    }

    const transactionError = (err) => {
        setProgress(false);
    }

    const onSupersize = async (event) => {
        if (address == null || progress || timeToSupersize > 0)
            return;

        const encodedABI = mcbaseTokenContract.contract.methods.Supersize().encodeABI();
        await sendTransaction(address, mcbaseTokenContract.address, encodedABI, '0x61A80', transactionDone, transactionError);
    }

    return (
        <Page1>

            <PageHeader
                title='McBase: A Supersized Rebasing Cryptocurrency'
                content=''
            />

            {/* <ClockLoader
                css={override}
                size={150}
                color={"#ffff00"}
                loading={progress}
            /> */}

            { networkId === config.networkId ?
                (
                    <Row className="justify-content-center">
                        <Col xs={12} className="text-white">
                            <p>McBase provides a simple and delicious means of evaluating the purchasing power of any cryptocurrency relative to the price of the world’s most famous processed beef product: The Big Mac.</p>
                            <p>Every 12 hours, the supply will expand or contract to reach the target price of a $5.66. You can earn additional McBase rewards by staking through the Geysers.</p>
                        </Col>
                        <Col xs={12} className="mt-4">
                            <Form1
                                title='McBase'
                                subtitle='STATS'
                            >
                                <img className="leftSideImage1" src={hamburger} />
                                <Row className="justify-content-center align-items-center">
                                    <Col xs={12} xl={2}></Col>
                                    <Col xs={12} xl={8}>
                                        <Row>
                                            <Col xs={6}>
                                                <strong>Price Target:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">$5.66</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Current Price:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">${mcbasePrice.toFormat(2)}</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Circulating Marketcap:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">${circulatingMCap.toFormat(2)}</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>12hr TWAP Price:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">${tokenAveragePriceInUSD.toFormat(2)}</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Circulating / Total Supply:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan"> {circulatingSupply.toFormat(2)} / {totalSupply.toFormat(2)} MCBASE</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Rebase Lag:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">{rebaseLag}</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Next Supersize %:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">{supersizeRate.div(new BigNumber(rebaseLag)).div(100).toFormat(2)}%</span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Next Supersize in:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">
                                                    {timeToSupersize > 0 ?
                                                        <Countdown
                                                            date={timeToSupersize}
                                                            renderer={renderer}
                                                        /> :
                                                        '0 Minutes'}
                                                </span>
                                            </Col>
                                            <Col xs={6}>
                                                <strong>Total TVL:</strong>
                                            </Col>
                                            <Col xs={6}>
                                                <span className="numberSpan">${totalTVL.toFormat(2)}</span>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xs={12} lg={2}></Col>
                                </Row>
                                <Row className="justify-content-center align-items-center mt-3">
                                    <Col xs={0} xl={1}></Col>
                                    <Col xs={6} xl={4}>
                                        <LinkButton href="https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xcd6de21c28b352e1f7fa2966ac24edca68115159" color="red">BUY NOW</LinkButton>
                                    </Col>
                                    <Col xs={6} xl={3}>
                                        {live && timeToSupersize === 0 ?
                                            (<Button onClickHandler={onSupersize}>SUPERSIZE</Button>) :
                                            (<Button onClickHandler={onSupersize} color="grey">SUPERSIZE</Button>)
                                        }
                                    </Col>
                                </Row>
                                <Row className="justify-content-center align-items-center mt-3">
                                    <Col xs={12} xl={8}>
                                        * The “Supersize” function is available for anyone to call once every 12 hours. It activates the rebase which expands or contracts the supply to bring the price back to peg. The rebase lag allows this to happen smoothly with less volatility.
                                    </Col>
                                </Row>
                                <img className="rightSideImage1" src={fries} />
                            </Form1>
                        </Col>
                    </Row>
                ) :
                (
                    <>
                        <Row>
                            <Col xs={12}>
                                <Form1
                                    title='Warning'
                                >
                                    <Row>
                                        <Col xs={12} className='pt-3'>
                                            <span>Unable to connect {config.networkId === '56' ? 'Main' : 'Test'} BSC Network.</span><br />
                                            <span>Please change your MetaMask network.</span>
                                        </Col>
                                    </Row>
                                </Form1>
                            </Col>
                        </Row>
                    </>
                )
            }
        </Page1>
    );

}

export default Stats;