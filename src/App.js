import React, { Component } from "react";
import { connect } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { setAddress, setNetworkId, setError } from "./redux/actions";
import Layout from "./layout";
import MCBASEStats from "./views/MCBASEStats";
import Sharebox from "./views/Sharebox";
import DollarMenu from "./views/DollarMenu";
import McFlurry from "./views/McFlurry";
import Franchise from "./views/Franchise";
import ThruVaults from "./views/ThruVaults";

import { providerUrl, Web3, connector } from "./mcbase/web3";
import { NotificationContainer } from "react-notifications";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

class App extends Component {
  constructor(props) {
    super(props);

    if (connector.connected) {
      this.props.setAddressRequest(connector._accounts[0]);
      this.props.setNetworkIdRequest(connector._chainId.toString(10));
    } else {
      window.web3 = null;
      // modern broswers
      if (typeof window.ethereum !== "undefined") {
        window.web3 = new Web3(window.ethereum);
        window.web3.eth.net.getId((err, netId) => {
          this.handleNetworkChanged(`${netId}`);
          window.ethereum
            .request({ method: "eth_accounts" })
            .then((accounts) => {
              if (accounts[0]) {
                this.props.setAddressRequest(accounts[0]);
              }
            });
          window.ethereum.on("accountsChanged", (accounts) =>
            this.handleAddressChanged(accounts)
          );
          window.ethereum.on("networkChanged", (networkId) =>
            this.handleNetworkChanged(networkId)
          );
        });
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.web3 = null;
      }
    }
  }

  handleAddressChanged = (accounts) => {
    if (typeof window.ethereum !== "undefined") {
      // window.location.reload(false);
      this.props.setAddressRequest(window.ethereum.selectedAddress);
    }
  };

  handleNetworkChanged = (networkId) => {
    this.props.setNetworkIdRequest(networkId);
    switch (networkId) {
      case "56":
        if (providerUrl.includes("bsc-dataseed.binance.org")) {
          this.props.setErrorRequest(false);
        } else {
          this.props.setErrorRequest(true);
        }
        break;
      case "97":
        if (providerUrl.includes("data-seed-prebsc-1-s1.binance.org:8545")) {
          this.props.setErrorRequest(false);
        } else {
          this.props.setErrorRequest(true);
        }
        break;
      default:
        this.props.setErrorRequest(true);
    }
  };

  render() {
    return (
      <Router>
        <Layout>
          <Switch>
            <Route path="/dashboard" component={MCBASEStats} exact />
            <Route path="/sharebox" component={Sharebox} exact />
            <Route path="/dollar_menu" component={DollarMenu} exact />
            <Route path="/mcflurry" component={McFlurry} exact />
            <Route path="/franchise" component={Franchise} exact />
            <Route path="/thruvaults" component={ThruVaults} exact />
            <Redirect from="/" to="/dashboard" />
          </Switch>

          <NotificationContainer />
        </Layout>
      </Router>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setAddressRequest: (address) => dispatch(setAddress(address)),
    setNetworkIdRequest: (networkId) => dispatch(setNetworkId(networkId)),
    setErrorRequest: (error) => dispatch(setError(error)),
  };
};

export default connect(null, mapDispatchToProps)(App);
