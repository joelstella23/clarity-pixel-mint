;; PixelMint - Pixel Art NFT Platform

;; Implements SIP-009 NFT interface
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-dimensions (err u101))
(define-constant err-token-not-found (err u102))
(define-constant err-not-token-owner (err u103))
(define-constant max-supply u1000)

;; Data variables
(define-data-var last-token-id uint u0)
(define-data-var total-supply uint u0)

;; NFT token
(define-non-fungible-token pixel-art uint)

;; Token metadata map
(define-map token-metadata uint 
  {
    width: uint,
    height: uint,
    pixel-data: (buff 4096),
    name: (string-ascii 64),
    description: (string-ascii 256),
    creator: principal
  }
)

;; Mint new pixel art NFT
(define-public (mint-pixel-art (width uint) (height uint) (pixel-data (buff 4096)) (name (string-ascii 64)) (description (string-ascii 256)))
  (let
    (
      (token-id (+ (var-get last-token-id) u1))
      (total (var-get total-supply))
    )
    (asserts! (<= width u256) err-invalid-dimensions)
    (asserts! (<= height u256) err-invalid-dimensions)
    (asserts! (< total max-supply) (err u104))
    
    (try! (nft-mint? pixel-art token-id tx-sender))
    (map-set token-metadata token-id
      {
        width: width,
        height: height,
        pixel-data: pixel-data,
        name: name,
        description: description,
        creator: tx-sender
      }
    )
    (var-set last-token-id token-id)
    (var-set total-supply (+ total u1))
    (ok token-id)
  )
)

;; SIP-009 transfer function
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? pixel-art token-id sender recipient)
  )
)

;; Get token metadata
(define-read-only (get-token-metadata (token-id uint))
  (match (map-get? token-metadata token-id)
    metadata (ok metadata)
    err-token-not-found
  )
)

;; Get token owner
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? pixel-art token-id))
)

;; SIP-009 required functions
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok none)
)
