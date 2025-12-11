// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script} from "forge-std/Script.sol";
import {ImageNFT} from "../contracts/ImageNFT.sol";

contract DeployScript is Script {
    function run() external returns (address) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        ImageNFT nft = new ImageNFT(
            "Arc Image NFTs",
            "AINFT",
            "https://ipfs.io/ipfs/",
            0
        );
        
        vm.stopBroadcast();
        return address(nft);
    }
}

