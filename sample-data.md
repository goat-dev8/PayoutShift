# PayoutShift Test Data

## Sample CSV for Testing

### Basic CSV Format
Save this as `test-recipients.csv`:

```csv
name,handle,amount,amountCurrency,settleCoin,settleNetwork,settleAddress
Alice Developer,@alice_dev,50,USD,ETH,ethereum,0x742d35Cc6634C0532925a3b844Bc576e30E3F1B1
Bob Designer,@bob_design,75,USD,SOL,solana,7cVfgArCheMR6Cs4t6vz5rfnqd56vZq4ndqcP89tmWcc
Charlie Manager,@charlie_mgr,100,USD,BTC,bitcoin,bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq
Diana Writer,@diana_writes,25,USD,USDT,ethereum,0x8B3392483BA26D65E331dB86D4F430E9B3814E5c
Evan Analyst,@evan_data,150,USD,MATIC,polygon,0x2C8B0A84B3D2e9F6a4E1d8c7B5A3F0E9D8C7B6A5
Fiona Developer,@fiona_code,200,USD,ETH,arbitrum,0x1234567890AbCdEf1234567890aBcDeF12345678
```

### CSV Format Explanation
- **name**: Display name for the recipient
- **handle**: Social handle or identifier (optional)
- **amount**: Amount in the specified currency
- **amountCurrency**: Currency code (USD, EUR, or crypto ticker)
- **settleCoin**: The cryptocurrency the recipient will receive
- **settleNetwork**: The blockchain network for settlement
- **settleAddress**: The recipient's wallet address

### Valid Network Examples
| Coin | Network | Address Format |
|------|---------|----------------|
| ETH | ethereum | 0x... (42 chars) |
| ETH | arbitrum | 0x... (42 chars) |
| ETH | optimism | 0x... (42 chars) |
| ETH | base | 0x... (42 chars) |
| BTC | bitcoin | bc1q... or 1... or 3... |
| SOL | solana | Base58 (32-44 chars) |
| USDT | ethereum | 0x... (42 chars) |
| USDT | tron | T... (34 chars) |
| XRP | ripple | r... + memo |
| MATIC | polygon | 0x... (42 chars) |
