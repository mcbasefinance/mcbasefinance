import React from 'react';
import './footer.css';

import pancakeSVG from '../../assets/images/psc.png';
import telegramSVG from '../../assets/images/telegram.svg';
import ethscanSVG from '../../assets/images/etherscan.svg';
import mediumSVG from '../../assets/images/medium.svg';
import twitterVG from '../../assets/images/twitter.png';

function Footer() {

    return (
        <div className='footer'>
            <ul>
                <li><a href='https://exchange.pancakeswap.finance/#/swap?outputCurrency=0xcd6de21c28b352e1f7fa2966ac24edca68115159' target='_blank' rel="noreferrer"><img src={pancakeSVG} width={28}/></a></li>
                <li><a href='https://t.me/mcbasebsc' target='_blank' rel="noreferrer"><img src={telegramSVG}/></a></li>
                <li><a href='https://mcbase-finance.medium.com/mcbase-bsc-a-supersized-rebasing-cryptocurrency-on-binance-smart-chain-4213a2f329f1' target='_blank' rel="noreferrer"><img src={mediumSVG}/></a></li>
                <li><a href='https://bscscan.com/token/0xcd6de21c28b352e1f7fa2966ac24edca68115159' target='_blank' rel="noreferrer"><img src={ethscanSVG}/></a></li>
                <li><a href='https://twitter.com/Mcbase_Finance' target='_blank' rel="noreferrer"><img src={twitterVG} width={30}/></a></li>
            </ul>
        </div>
    );

}

export default Footer;