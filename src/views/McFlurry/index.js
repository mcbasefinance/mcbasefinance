import React, { useCallback, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import moment from "moment";

import { sendTransaction } from "../../mcbase/metamask";

import {
  mcbaseTokenContract,
  mcbaseCakeLPTokenContract,
  mcbaseFlurryGeyserContract,
} from "../../mcbase/contracts";

import Countdown, { zeroPad, CountdownRenderProps } from "react-countdown";

import {
  checkAllowance,
  getBalance,
  getLpPrice,

  getMcBaseEpochCycle,
  getMcBaseLastEpochTime,

  totalStaked,
  totalStakedFor,
  getUserReward,
  getUserFirstStakeTime,
  getTotalSecUnlockPriceInUSD,

  bnMultipledByDecimals
} from "../../mcbase/utils";

import useBlock from '../../hooks/useBlock';
import useWBNBPrice from '../../hooks/useWBNBPrice';
import useMcBasePrice from '../../hooks/useMcBasePrice';

import config from "../../config";

import { Row, Col } from "react-bootstrap";
import { NotificationManager } from "react-notifications";
import Page1 from "../../components/Page1";
import PageHeader from "../../components/PageHeader";
import Form1 from "../../components/Form1";
import Button from "../../components/Button";
import BetCtrl from "../../components/BetCtrl";

import "react-notifications/lib/notifications.css";

import milk from "../../assets/images/milk.svg";
import cake from "../../assets/images/cake.svg";

function McFlurry() {
  const address = useSelector((state) => state.authUser.address);
  const networkId = useSelector((state) => state.authUser.networkId);

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

  const [values, setValues] = useState({
    stakeAmount: "0",
    unstakeAmount: "0",
    claimAmount: "0",
  });

  const block = useBlock()
  const bnbPrice = useWBNBPrice()
  const mcbasePrice = useMcBasePrice()

  const [progress, setProgress] = useState(false);
  const [tokenBalance, setTokenBalnace] = useState(new BigNumber(0));
  const [myTotalStakedAmount, setMyTotalStaked] = useState(new BigNumber(0));
  const [allowAmount, setAllowAmount] = useState(new BigNumber(0));
  const [rewardAmount, setRewardAmount] = useState(new BigNumber(0));
  const [rewardAmountIn30Days, setRewardAmountIn30Days] = useState(
    new BigNumber(0)
  );
  const [totalTVL, setTotalTVL] = useState(new BigNumber(0));
  const [totalSecUnlockPriceInUSD, setTotalSecUnlockPriceInUSD] = useState(
    new BigNumber(0)
  );
  const [multiplier, setMultiplier] = useState(new BigNumber(1));
  const [apy, setAPY] = useState(new BigNumber(0));
  const [timeToSupersize, setTimeToSupersize] = useState(0);
  const [timerID, setTimerID] = useState(0);

  useEffect(() => {
    let isSubscribed = true
    async function fetchAllData(firstFlag = false) {
      if (!isSubscribed)
        return;

      let currentTime = moment().unix();

      setAllowAmount(
        await checkAllowance(
          mcbaseCakeLPTokenContract.contract,
          address,
          mcbaseFlurryGeyserContract.address
        )
      );

      setTokenBalnace(await getBalance(mcbaseCakeLPTokenContract.contract, address));
      setMyTotalStaked(await totalStakedFor(mcbaseFlurryGeyserContract, address));
      setRewardAmount(await getUserReward(mcbaseFlurryGeyserContract, address, currentTime));
      setRewardAmountIn30Days(
        await getUserReward(mcbaseFlurryGeyserContract, address, currentTime + 2592000)
      );

      const mcbaseCakeLpPrice = await getLpPrice(mcbaseCakeLPTokenContract, 'MCBASE', false, bnbPrice, mcbasePrice)
      let totalStakedAmount = await totalStaked(mcbaseFlurryGeyserContract);
      setTotalTVL(totalStakedAmount.times(mcbaseCakeLpPrice));
      setTotalSecUnlockPriceInUSD(
        await getTotalSecUnlockPriceInUSD(mcbaseFlurryGeyserContract, mcbasePrice, currentTime)
      );

      let supersizeInterval = await getMcBaseEpochCycle(mcbaseTokenContract);
      let lastSupersize = await getMcBaseLastEpochTime(mcbaseTokenContract);
      let currentTimeStamp = moment().unix();

      if (lastSupersize == 0) {
        setTimeToSupersize(0);
      } else {
        if (lastSupersize + supersizeInterval > currentTimeStamp)
          setTimeToSupersize((lastSupersize + supersizeInterval) * 1000);
        else setTimeToSupersize(0);
      }

      let firstStakeTime = await getUserFirstStakeTime(mcbaseFlurryGeyserContract, address);
      if (firstStakeTime > 0) {
        let passedDays = new BigNumber(moment().unix())
          .minus(firstStakeTime)
          .div(86400);
        setMultiplier(new BigNumber(1).plus(passedDays.div(15)));
      } else {
        setMultiplier(new BigNumber(1));
      }
    }
    if (address &&
      mcbaseTokenContract &&
      mcbaseCakeLPTokenContract &&
      mcbaseFlurryGeyserContract) {
      fetchAllData(true);
    }

    return () => isSubscribed = false
  }, [block,
    address,
    mcbaseTokenContract,
    mcbaseCakeLPTokenContract,
    mcbaseFlurryGeyserContract])

  const renderer = (countdownProps) => {
    const { days, hours, minutes, seconds } = countdownProps;

    return (
      <span style={{ width: "100%" }}>
        {seconds > 0 ? (
          <div>
            {hours} Hours&nbsp;&nbsp;&nbsp;{minutes + 1} Minutes
          </div>
        ) : (
            <div>
              {hours} Hours&nbsp;&nbsp;&nbsp;{minutes} Minutes
            </div>
          )}
      </span>
    );
  };

  useEffect(() => {
    if (
      totalTVL.isGreaterThan(0) &&
      totalSecUnlockPriceInUSD.isGreaterThan(0)
    ) {
      let apy = new BigNumber(1)
        .plus(totalSecUnlockPriceInUSD.times(31536000).div(totalTVL))
        .times(100);
      setAPY(apy);
    } else {
      setAPY(new BigNumber(0));
    }
  }, [totalTVL, totalSecUnlockPriceInUSD]);

  const onChangeHandler = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const transactionDone = () => {
    setValues({
      stakeAmount: "0",
      unstakeAmount: "0",
      claimAmount: "0",
    });
    setProgress(false);
  };

  const transactionError = (err) => {
    setProgress(false);
  };

  const onStake = async (event) => {
    if (address == null || progress) return;

    const stakeAmount = new BigNumber(values.stakeAmount.replace(",", ""));

    if (stakeAmount.isGreaterThan(tokenBalance)) {
      NotificationManager.warning(
        `The maximum amount you can stake is ${tokenBalance.toFormat(2)}.`
      );
      return;
    }

    if (stakeAmount.isLessThanOrEqualTo(0)) {
      NotificationManager.warning(`Stake amount should be greater than 0.`);
      return;
    }

    setProgress(true);

    const stakeAmountBN = bnMultipledByDecimals(stakeAmount);
    const encodedABI = mcbaseFlurryGeyserContract.contract.methods
      .stake(stakeAmountBN.toString(10))
      .encodeABI();

    await sendTransaction(
      address,
      mcbaseFlurryGeyserContract.address,
      encodedABI,
      "0x61A80",
      transactionDone,
      transactionError
    );
  };

  const onApprove = async (event) => {
    if (address == null || progress) return;

    setProgress(true);

    const maxAmount = new BigNumber(1)
      .multipliedBy(new BigNumber(2).pow(256))
      .minus(1);
    const encodedABI = mcbaseCakeLPTokenContract.contract.methods
      .approve(mcbaseFlurryGeyserContract.address, maxAmount.toString(10))
      .encodeABI();

    await sendTransaction(
      address,
      mcbaseCakeLPTokenContract.address,
      encodedABI,
      "0x61A80",
      transactionDone,
      transactionError
    );
  };

  const onEndStake = async (event) => {
    if (address == null || progress) return;

    setProgress(true);

    const encodedABI = mcbaseFlurryGeyserContract.contract.methods
      .unstake(bnMultipledByDecimals(myTotalStakedAmount).toString(10))
      .encodeABI();
    await sendTransaction(
      address,
      mcbaseFlurryGeyserContract.address,
      encodedABI,
      "0x61A80",
      transactionDone,
      transactionError
    );
  };

  return (
    <Page1>
      <PageHeader
        title="Earn More MCBASE Through The McFlurry Geyser"
        content=""
      />

      {networkId === config.networkId ? (
        <Row className="justify-content-center">
          <Col xs={12} className="text-white">
            <p>
              Deposit{" "}
              <strong>
                <a
                  href="https://exchange.pancakeswap.finance/#/add/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82/0xcd6de21c28b352e1f7fa2966ac24edca68115159"
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", color: "white" }}
                >
                  MCBASE-CAKE CAKE-LP
                </a>
              </strong>{" "}
              tokens into the McFlurry geyser to <br />
              earn more MCBASE with juicy reward mulitpliers{" "}
              <a
                href=""
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline", color: "white" }}
              >
                (learn more)
              </a>
            </p>
          </Col>
          <Col xs={12}>
            <Form1 title="McFlurry" subtitle="Geyser">
              <img className="leftSideImage4" src={milk} />
              <Row className="justify-content-center align-items-center">
                <Col xs={12} lg={3}></Col>
                <Col xs={12} lg={7}>
                  <Row>
                    <Col xs={6}>
                      <strong>Your Balance:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        {tokenBalance.toFormat(2)} MCBASE-CAKE
                      </span>
                    </Col>
                    <Col xs={6}>
                      <strong>Staking:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        {myTotalStakedAmount.toFormat(2)} MCBASE-CAKE
                      </span>
                    </Col>
                    <Col xs={6}>
                      <strong>Current Rewards:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        {rewardAmount.toFormat(4)} MCBASE
                      </span>
                    </Col>
                    <Col xs={6}>
                      <strong>Estimated Rewards:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        {rewardAmountIn30Days.toFormat(4)} MCBASE in 30 Days
                      </span>
                    </Col>
                    <Col xs={6}>
                      <strong>Reward Multiplier:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        {multiplier.toFixed(1)}x
                      </span>
                    </Col>
                    <Col xs={6}>
                      <strong>APY:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">{apy.toFormat(2)}%</span>
                    </Col>
                    <Col xs={6}>
                      <strong>McFlurry TVL:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        ${totalTVL.toFormat(2)}
                      </span>
                    </Col>
                    <Col xs={6}>
                      <strong>Next Supersize in:</strong>
                    </Col>
                    <Col xs={6}>
                      <span className="numberSpan">
                        {timeToSupersize > 0 ? (
                          <Countdown
                            date={timeToSupersize}
                            renderer={renderer}
                          />
                        ) : (
                            "0 Minutes"
                          )}
                      </span>
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} lg={2}></Col>
              </Row>
              <Row className="mt-3">
                <Col xs={0} xl={3} className="text-center"></Col>
                <Col xs={12} xl={6} className="text-center">
                  <BetCtrl
                    label="Stake"
                    name="stakeAmount"
                    balance={tokenBalance.toFormat(18)}
                    currentVal={values.stakeAmount}
                    onChangeHandler={onChangeHandler}
                  />
                </Col>
                <Col xs={3} className="text-center"></Col>
              </Row>
              <Row>
                <Col xs={3} xl={3} className="text-center"></Col>
                <Col xs={12} xl={6} className="text-center mt-3">
                  {allowAmount.isEqualTo(0) ? (
                    <Button onClickHandler={onApprove} color="red">Approve</Button>
                  ) : (
                      <Button onClickHandler={onStake} color="red">STAKE</Button>
                    )}
                </Col>
              </Row>
              <Row className="mt-3">
                <Col xs={0} xl={3} className="text-center"></Col>
                <Col xs={12} xl={6} className="text-center">
                  <Button onClickHandler={onEndStake}>
                    Exit: Unstake And Claim
                  </Button>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col xs={12} className="text-center">
                  <p>
                    * The longer you stake without unstaking, the higher your
                    reward multiplier
                  </p>
                </Col>
              </Row>
              <img className="rightSideImage4" src={cake} />
            </Form1>
          </Col>
        </Row>
      ) : (
          <>
            <Row>
              <Col xs={12}>
                <Form1 title="Warning">
                  <Row>
                    <Col xs={12} className="pt-3">
                      <span>
                        Unable to connect{" "}
                        {config.networkId === "56" ? "Main" : "Test"} BSC Network.
                    </span>
                      <br />
                      <span>Please change your MetaMask network.</span>
                    </Col>
                  </Row>
                </Form1>
              </Col>
            </Row>
          </>
        )}
    </Page1>
  );
}

export default McFlurry;
