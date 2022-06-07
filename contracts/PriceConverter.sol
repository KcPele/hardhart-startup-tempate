// SPDX-License-Identifier: MIT

pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

//creating a library
//they only use internal, no state variable
library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        //address 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        //    AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);

        (, int256 price, , , ) = priceFeed.latestRoundData();
        return uint256(price * 1e10);
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface version = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
        return version.version();
    }

    function getConvertionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethAmount * ethPrice) / 1e18;
        return ethAmountInUsd;
    }
}
