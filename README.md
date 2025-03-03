# PixelMint
A decentralized platform for minting pixel art NFTs on the Stacks blockchain.

## Features
- Mint pixel art NFTs with customizable metadata
- Set pixel art dimensions and color data
- Transfer NFTs between addresses
- Query NFT metadata and ownership
- Limited edition minting with max supply

## Setup and Installation
1. Clone the repository
2. Install Clarinet (if not already installed)
3. Run `clarinet check` to verify the contract
4. Run `clarinet test` to run the test suite

## Usage Examples
```clarity
;; Mint a new pixel art NFT
(contract-call? .pixel-mint mint-pixel-art 
  u32 ;; width
  u32 ;; height
  0x4a5b3c... ;; pixel data in hex
  "My Pixel Art" ;; name
  "First pixel art piece" ;; description
)

;; Transfer an NFT
(contract-call? .pixel-mint transfer u1 tx-sender 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG)

;; Get NFT metadata
(contract-call? .pixel-mint get-token-metadata u1)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
- SIP-009 NFT trait interface
