// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract Counter {
    uint256 public number;
    event NumberChanged(uint256 newNumber);

    function setNumber(uint256 newNumber) public {
        number = newNumber;
        emit NumberChanged(number);
    }

    function increment() public {
        number++;
        emit NumberChanged(number);
    }

    function decrement() public {
        number--;
        emit NumberChanged(number);
    }

    function reset() public {
        number = 0;
        emit NumberChanged(number);
    }

    function getnumber() public view returns (uint256) {
        return number;
    }
}
