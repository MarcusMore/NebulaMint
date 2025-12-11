// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import "../contracts/NFTLikes.sol";

contract DeployLikesScript is Script {
    function run() public {
        vm.startBroadcast();
        
        NFTLikes likesContract = new NFTLikes();
        
        console.log("NFTLikes contract deployed at:", address(likesContract));
        
        vm.stopBroadcast();
    }
}

