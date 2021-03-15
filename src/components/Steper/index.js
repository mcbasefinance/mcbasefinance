import React, { useState } from "react";
import RangeSlider from "react-bootstrap-range-slider";

import "./index.css";

const Step = ({ value, index, side, onChangePercentHandler }) => {
  const [val, setVal] = React.useState(0);
  const setPercentValue = (value) => {
    setVal(value);
    onChangePercentHandler({ value, index, side });
  };

  return (
    <div>
      <RangeSlider
        value={val}
        onChange={(e) => setPercentValue(e.target.value)}
        step={1}
        size="sm"
        tooltip="off"
        variant="danger"
      />
      <div className="metrics">
        <span className="percent0">0%</span>
        <span className="percent25">25%</span>
        <span className="percent50">50%</span>
        <span className="percent75">75%</span>
        <span className="percent100">100%</span>
      </div>
    </div>
  );
};

export default Step;
