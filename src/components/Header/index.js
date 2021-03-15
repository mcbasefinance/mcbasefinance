import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Nav, Navbar, Button } from "react-bootstrap";

import { NavLink, Link } from "react-router-dom";

import config from "../../config";
import { NotificationManager } from "react-notifications";
import { isMobile } from "react-device-detect";
import { connector } from "../../mcbase/web3";
import { setAddress, setNetworkId, setError } from "../../redux/actions";
import { web3 } from "../../mcbase/web3";

import logo from "../../mcbase_logo.png";
import "./header.css";

function Header() {
  const dispatch = useDispatch();
  const address = useSelector((state) => state.authUser.address);
  const networkId = useSelector((state) => state.authUser.networkId);

  const onConnectClick = async () => {
    if (typeof window.ethereum === "undefined") {
      NotificationManager.warning("Please install MetaMask!");
      return;
    }
    try {
      const netId = `${await web3.eth.net.getId()}`;
      if (netId !== config.networkId) {
        if (config.networkId === "56")
          NotificationManager.warning("Please select main net to proceed!");
        else if (config.networkId === "97")
          NotificationManager.warning("Please select test net to proceed!");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts[0]) {
        dispatch(setNetworkId(netId));
        dispatch(setAddress(accounts[0]));
      }
    } catch (error) {
      // NotificationManager.warning('Something went wrong while connect wallet');
    }
  };

  return (
    <Navbar collapseOnSelect expand="lg">
      <Navbar.Brand href="/">
        <img src={logo} className="logo" alt="McBase Logo" />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto menu-bar">
          <Link
            to={{
              pathname:
                "https://mcbase-finance.medium.com/mcbase-bsc-a-supersized-rebasing-cryptocurrency-on-binance-smart-chain-4213a2f329f1",
            }}
            target="_blank"
            className="mainMenuItem"
          >
            About
          </Link>

          <NavLink
            to="/dashboard"
            className="mainMenuItem"
            activeStyle={{
              color: "#fff",
            }}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/sharebox"
            className="mainMenuItem"
            activeStyle={{
              color: "#fff",
            }}
          >
            Sharebox
          </NavLink>

          <NavLink
            to="/dollar_menu"
            className="mainMenuItem"
            activeStyle={{
              color: "#fff",
            }}
          >
            Dollar Menu
          </NavLink>

          <NavLink
            to="/mcflurry"
            className="mainMenuItem"
            activeStyle={{
              color: "#fff",
            }}
          >
            McFlurry
          </NavLink>

          <NavLink
            to="/franchise"
            className="mainMenuItem"
            activeStyle={{
              color: "#fff",
            }}
          >
            Franchise
          </NavLink>

          <NavLink
            to="/thruvaults"
            className="mainMenuItem"
            activeStyle={{
              color: "#fff",
            }}
          >
            Drive-Thru Vaults
          </NavLink>
        </Nav>
        <Nav>
          <Nav.Link href="#">
            {address === null ? (
              <div
                className="walletConnectButton"
                onClick={() => onConnectClick()}
              >
                Connect Wallet
              </div>
            ) : (
              <div
                className="walletConnectButton"
                onClick={(e) => {
                  window.open(
                    `https://bscscan.com/address/${address}`,
                    "_blank"
                  );
                }}
              >
                {`${address.substring(0, 7)}...${address.substring(
                  address.length - 5,
                  address.length
                )}`}
              </div>
            )}
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Header;
