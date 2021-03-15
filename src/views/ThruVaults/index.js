import React, { useCallback, useState, useEffect, useContext } from "react";
import { useSelector } from "react-redux";
import BigNumber from "bignumber.js";
import config from "../../config";

import { Row, Col, Card } from "react-bootstrap";
import Page1 from "../../components/Page1";
import PageHeader from "../../components/PageHeader";
import Form1 from "../../components/Form1";

import { vaults } from "../../mcbase/contracts"

import useVaultsTVL from "../../hooks/useVaultsTVL"

import VaultForm from "./components/VaultForm"
import Accordion from "react-bootstrap/Accordion";
import "./index.css";

function ThruVaults() {
  const networkId = useSelector((state) => state.authUser.networkId);
  const totalValues = useVaultsTVL(vaults)

  return (
    <Page1>
      <PageHeader
        title="Earn Compounding Yield In The Drive-Thru Vaults"
        content=""
      />

      {networkId === config.networkId ? (
        <Row className="justify-content-center">
          <Col xs={12} className="text-white">
            <p>
              Stake your tokens in the McBase Drive-Thru Vaults to earn
              compounding yield on your holdings. A portion of vault fees will
              be sold for BNB and distirbuted to McBase Franchise owners (LP
              stakers). 
              <a
                href="https://mcbase-finance.medium.com/mcbase-drive-thru-vaults-a-deep-d-r-ive-ac0d076ac10b"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline", color: "white" }}
              >
              Read more
              </a>
              {" "}about how the McBase vaults work
            </p>
          </Col>
          <Col xs={12}>
            <Accordion defaultActiveKey="0">
              {vaults && vaults.map((item, key) => {
                return (
                  <VaultForm
                    key={`vaultsform_${key}`}
                    index={key}
                    vaultData={item}
                    totalValue={totalValues.length > 0 ? totalValues[key].tvl : new BigNumber(0)}
                    apy={totalValues.length > 0 ? totalValues[key].apy : new BigNumber(0)}
                    dpy={totalValues.length > 0 ? totalValues[key].dpy : new BigNumber(0)}
                  />
                )
              })}
            </Accordion>
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

export default ThruVaults;
