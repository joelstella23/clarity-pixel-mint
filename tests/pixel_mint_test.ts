import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test minting pixel art NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    const pixelData = '0x0000ff'; // Simple blue pixel
    
    let block = chain.mineBlock([
      Tx.contractCall('pixel-mint', 'mint-pixel-art', [
        types.uint(32),
        types.uint(32),
        types.buff(pixelData),
        types.ascii("Test Art"),
        types.ascii("Test Description")
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    // Verify metadata
    let metadata = chain.callReadOnlyFn(
      'pixel-mint',
      'get-token-metadata',
      [types.uint(1)],
      deployer.address
    );
    
    metadata.result.expectOk().expectTuple();
  }
});

Clarinet.test({
  name: "Test NFT transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // First mint an NFT
    let block = chain.mineBlock([
      Tx.contractCall('pixel-mint', 'mint-pixel-art', [
        types.uint(32),
        types.uint(32),
        types.buff('0x0000ff'),
        types.ascii("Test Art"),
        types.ascii("Test Description")
      ], deployer.address)
    ]);
    
    // Transfer the NFT
    block = chain.mineBlock([
      Tx.contractCall('pixel-mint', 'transfer', [
        types.uint(1),
        types.principal(deployer.address),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify new owner
    let owner = chain.callReadOnlyFn(
      'pixel-mint',
      'get-owner',
      [types.uint(1)],
      deployer.address
    );
    
    owner.result.expectOk().expectSome().expectPrincipal(wallet1.address);
  }
});

Clarinet.test({
  name: "Test invalid operations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Test invalid dimensions
    let block = chain.mineBlock([
      Tx.contractCall('pixel-mint', 'mint-pixel-art', [
        types.uint(257), // Too large
        types.uint(32),
        types.buff('0x0000ff'),
        types.ascii("Test Art"),
        types.ascii("Test Description")
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(101);
    
    // Test unauthorized transfer
    block = chain.mineBlock([
      Tx.contractCall('pixel-mint', 'transfer', [
        types.uint(1),
        types.principal(deployer.address),
        types.principal(wallet1.address)
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectErr().expectUint(103);
  }
});
