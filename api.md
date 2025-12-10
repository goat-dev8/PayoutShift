# Getting Started
slug: /

Leverage SideShift's trading infrastructure to add fast, direct-to-wallet shifts to your project. Our API lets you request quotes, create shifts, and support 200+ assets across multiple networks.

## 1. Create an Account

1. A SideShift.ai account is automatically created in two ways:

   - When creating a shift on the site
   - When visiting the [account page](https://sideshift.ai/account)

2. Copy your **Private Key** – used as `x-sideshift-secret`.
   :::warning
   Never share your Private Key with anyone. It grants full access to your account and should be kept secret.
   :::

3. Copy your **Account ID** – passed as `affiliateId`.

```bash title=".env"
SIDESHIFT_SECRET=YOUR_ACCOUNT_SECRET #REPLACE WITH YOUR SIDESHIFT ACCOUNT SECRET
AFFILIATE_ID=YQMi62XMb #REPLACE WITH YOUR SIDESHIFT ACCOUNT ID
```

## 2. Request a Quote

```
curl -L 'https://sideshift.ai/api/v2/quotes' \
-H 'Content-Type: application/json' \
-H 'x-sideshift-secret: $SIDESHIFT_SECRET' \
-d '{
  "depositCoin": "eth",
  "depositNetwork": "arbitrum",
  "settleCoin": "eth",
  "settleNetwork": "mainnet",
  "depositAmount": "0.14364577",
  "settleAmount": null,
  "affiliateId": "$AFFILIATE_ID"
}'
```

Save the returned `id` as `QUOTE_ID`.

## 3. Create a Fixed Shift

```
curl -L 'https://sideshift.ai/api/v2/shifts/fixed' \
-H 'Content-Type: application/json' \
-H 'x-sideshift-secret: $SIDESHIFT_SECRET' \
-d '{
  "settleAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
  "affiliateId": "$AFFILIATE_ID",
  "quoteId": "QUOTE_ID"
}'
```

Display the `depositAddress` to your user and poll `/v2/shifts/{shiftId}` to monitor the shift's status.

## Relevant Resources

- [How to create a SideShift.ai account and backup your private key?](https://help.sideshift.ai/en/articles/8974541-how-to-create-a-sideshift-ai-account-and-backup-your-private-key)
- [How to recover/restore my account?](https://help.sideshift.ai/en/articles/4667810-how-do-i-recover-restore-my-account)

# Monetization

:::info
Integrators earn a default 0.5% commission on all shifts, configurable from 0% to 2% using the `commissionRate` parameter. Users of integrations shift at competitive rates; the commission is included in the exchange rate, not added on top.
:::

## Setup Requirements

To receive commissions, you must include your `Account ID` as the `affiliateId` in all shift creation requests. SideShift.ai uses this to track and attribute shifts to your integration.

## Commission Rate Examples

:::note
**Website rate** : `1 USDC → 0.981 USDT` (includes default 0.5% commission)

*Example figures for illustration only. Live quotes vary.*
:::

| `commissionRate` | Relative to website | Example user rate        |
|------------------|---------------------|---------------------------|
| `0%`             | **0.5% better**     | `1 USDC → 0.986 USDT`     |
| `0.5%`           | **same**            | `1 USDC → 0.981 USDT`     |
| `1%`             | **0.5% worse**      | `1 USDC → 0.976 USDT`     |
| `2%`             | **1.5% worse**      | `1 USDC → 0.966 USDT`     |

## Commission Payouts

- **Automatic payouts**: Available once you configure your payout settings
- **Supported coins**: Receive payouts in any supported coin on our listed networks
- **Payout schedules**: Threshold-based triggers (e.g., when reaching 5,000 USD, 20,000 USD)

## Dashboard Management

Through the [dashboard](https://sideshift.ai/dashboard) page, you can:

- View your commission summary and earnings history
- Download CSV reports of your earned commissions
- Configure automatic payout settings:
  - Payout wallet address
  - Preferred payout coin
  - Payout amount thresholds

## Relevant Resources

- [How to withdraw XAI commissions?](https://help.sideshift.ai/en/articles/4559672-how-do-i-withdraw-my-xai-balance)

# Permissions

SideShift.ai is not available in certain jurisdictions. Learn [more](https://help.sideshift.ai/en/articles/2874595-why-am-i-blocked-from-using-sideshift-ai).

Integrators are advised to use the [`/v2/permissions`](/endpoints/v2/permissions) endpoint to determine if the user is allowed to use SideShift.ai.

### Proxying User Requests

SideShift.ai does not allow proxying user requests. This means that the user should either directly interact with the SideShift.ai REST API, or if the API requests are sent from the integration's own server, the `x-user-ip` header must be set to the end-user's IP address.

### The x-user-ip Header

The `x-user-ip` header helps SideShift.ai identify the original source of the request, which is important for security reasons and ensuring that the service is not being used by users in restricted countries. It’s crucial that this header is set correctly by integrations to prevent any issues with using the API.

# Shift

To trade with SideShift.ai, users must first create a shift. A shift can be of type fixed or variable rate.

### Fixed rate

- These shifts lock in the exchange rate for 15 minutes, including all fees. The rate is secured once the quote is created using the [`/v2/quotes`](/endpoints/v2/requestquote) endpoint. After 15 minutes, the quote and the shift expire, and any deposit made to the shift is refunded. To create a fixed-rate shift, first request a quote, then create the shift via the [`/v2/shifts/fixed`](/endpoints/v2/createfixedshift) endpoint.

![Fixed Rate Flow](/img/fixed-rate-flow.svg)

### Variable rate

- These shifts don’t lock in the rate until the user makes a deposit, at which point network fees are included in the rate calculation. They remain valid for seven days and can be requested in one step using the [`/v2/shifts/variable`](/endpoints/v2/createvariableshift) endpoint.

![Variable Rate Flow](/img/variable-rate-flow.svg)

:::tip

For integrations that allow their users to input an amount before creating either a fixed or variable rate shift, the [`/v2/pair`](/endpoints/v2/pair) endpoint can be used to accurately estimate the impact of [network fees](/api-intro/network-fees) on the rate for the specified pair. This can be done by setting the input amount as the optional `amount` query parameter.

When integrations are unaware of the exact amount their users will send for a variable rate shift, they can choose to present on their application either:

- `settleCoinNetworkFee`, denominated in `settle coin`
- `networkFeeUsd`, denominated in `USD`

Both represent the estimated sum of network fees that will be charged for the shift.

:::

# Deposits

A deposit is a transaction a user makes to a shift to receive the equivalent amount in the coin they select.

## Minimum and Maximum Deposit Range

The Minimum Deposit Range has a default value of 3 USD and is determined after incorporating the network fees. The Maximum Deposit Range is always set by SideShift.ai and varies from coin to coin.

For more detailed information to help if the amount sent is outside the deposit range, please check out:

- [Under-Minimum Shift Deposit](https://help.sideshift.ai/en/articles/3735849-i-sent-below-the-minimum-amount-for-my-shift-what-can-i-do)
- [Over-Maximum Shift Deposit](https://help.sideshift.ai/en/articles/3825201-i-sent-over-the-maximum-amount-for-my-shift-what-can-i-do)

## Determining the Minimum Deposit Range

Here’s how to calculate the `Minimum Deposit Range`, assuming the network fee is 20 USD:

```
Minimum Deposit = (1 / 0.2) * network fee
Minimum Deposit = (1 / 0.2) * 20
Minimum Deposit = 100
```

In this scenario, we compare the calculated value of 100 USD to the default minimum deposit, assuming a default minimum deposit of 3 USD, to determine the `Minimum Deposit Range`. The `Minimum Deposit Range` is the higher of these two values, which in this case is 100 USD.

## Deposit status

| Status       | Name                       | Remarks                                                                                                                                                                                                                                                                                               |
| ------------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `waiting`    | Waiting for deposit        | No deposit detected for the shift                                                                                                                                                                                                                                                                     |
| `pending`    | Detected                   | SideShift.ai has detected the deposit and is waiting for one block confirmation for most coins and two confirmations for Litecoin, Dash, and Doge. The rate is locked in.                                                                                                                             |
| `processing` | Confirmed                  | The deposit has been confirmed in the blockchain and is being processed by SideShift.ai                                                                                                                                                                                                               |
| `review`     | Under human review         | The deposit cannot be automatically processed. After human review it can be settled or refunded.                                                                                                                                                                                                      |
| `settling`   | Settlement in progress     | SideShift.ai has created the transaction which settles the deposit and it's waiting for 1 confirmation.                                                                                                                                                                                               |
| `settled`    | Settlement completed       | Settlement transaction has received 1 block confirmation                                                                                                                                                                                                                                              |
| `refund`     | Queued for refund          | A refund address is required. If it was not provided when the shift was created, the user can enter it at [https://sideshift.ai/orders/SHIFT_ID](https://sideshift.ai/orders/SHIFT_ID) or it can be set via the [`/v2/shifts/{shiftId}/set-refund-address`](/endpoints/v2/setrefundaddress) endpoint. |
| `refunding`  | Refund in progress         | Refund transaction created, waiting for 1 confirmation into the blockchain.                                                                                                                                                                                                                           |
| `refunded`   | Refund completed           | Refund transaction has received 1 block confirmation.                                                                                                                                                                                                                                                 |
| `expired`    | Shift expired              | The created shift has reached the end of its validity period without receiving any deposits.                                                                                                                                                                                                          |
| `multiple`   | Multiple deposits detected | Use the `deposits` array in the endpoint response for data about each deposit                                                                                                                                                                                                                         |

## Handling Multiple Deposits

### Fixed Shifts

Only the first valid deposit is settled. Any additional deposits that are received after the first deposit are refunded to the user.

### Variable Shifts

The shift can receive and process multiple deposits individually. Deposits are not merged; each one is handled based on its own specific conditions and the prevailing market rates at the time of processing.

:::note
It is not desirable for users to make multiple deposits to the same shift, and integrators should avoid encouraging this behavior.
:::

## Deposits within EVM networks

For supported EVM networks, SideShift.ai uses a deposit address, which is a smart contract for tokens, for each created shift. When a balance is detected on this contract, the system performs a sweep operation. This operation sends the funds from the deposit address to SideShift.ai's main address. The sweeper transaction is then detected as a "deposit".

:::note
For EVM networks, TRON, Aptos, Sui, NEAR, and Algorand, the `depositHash` returned in the API represents the sweep transaction hash.
:::

Occasionally, this sweeper transaction isn't broadcasted to the network, which triggers another attempt to sweep the funds from the deposit address. In this case, another deposit is created with `pending` status that will be processed, while the first deposit remains in `pending` status.

## Deposit address lifecycle

- `depositAddress` stays assigned to a shift for 60 days (40 days for EVM token deposit addresses).
- Once unassigned, the field becomes `null`, and the address can later be assigned to other shifts. Never send funds to an address from an expired shift.
- Persist the address when the shift is created and always treat it as nullable when parsing the [`/v2/shifts/{shiftId}`](/endpoints/v2/shift) and [`/v2/shifts`](/endpoints/v2/bulkshifts) responses.

## Deposit Issues

Sometimes deposits will not be automatically processed for various reasons as summarized in the table below. The `issue` field will have a value when `status` is `review` or `refund`. If `status` is `multiple` and one of the deposits are in `review` or `refund` status, this deposit object will have an `issue` field.

| Issue                | Remarks                                                                                        | Resolution                             |
| -------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| `amount over max`    | User sent over the maximum amount.                                                             | Processed or refund after human review |
| `amount under min`   | User sent below the minimum amount.                                                            | Processed or refund after human review |
| `refund required`    | The shift will be refunded after a refund address is provided                                  | Refund after an address is provided    |
| `incorrect amount`   | User sent the incorrect amount for a fixed rate shift.                                         | Processed or refund after human review |
| `order expired`      | The shift has already expired when SideShift.ai detected the deposit                           | Processed or refund after human review |
| `max 1 deposit`      | Fixed rate shifts can have maximum one deposit                                                 | Refund after an address is provided    |
| `too many deposits`  | More than 5 deposits have been made to a variable rate shift                                   | Refund after an address is provided    |
| `review`             | Shift is under human review and will be processed or refunded                                  | Processed or refund after human review |
| `coin unavailable`   | Either the deposit or settle method is currently not available for shifts.                     | Refund after human review              |
| `rate drift`         | The rate changed too much between the time the quote was created and the deposit was detected. | Processed or refund after human review |
| `duplicate`          | The deposit is a duplicate of another deposit.                                                 | Refund after human review              |
| `low effective rate` | The effective rate is too low as the network fees would consume too high % of the shift value  | Refund after an address is provided    |

## Deposit Rejection Rules

#### Below Minimum Rejection

`Applies to:` Variable rate shifts

`Rule:` Deposits below the minimum amount might be settled if the coin for settlement has low network fees. If the network fees are high (e.g., BTC), the deposit will remain rejected.

#### Incorrect Amount Rejection

`Applies to:` Fixed rate shifts

`Rule:` Deposits with an incorrect amount will be auto-refunded if the coin for refund has low network fees and the refund address has been set. Otherwise, the refund address will be requested. If the network fees are high, the deposit will remain rejected for review. Incorrect amount deposits with a slightly different value might be settled.

# Refunds

SideShift.ai may have to refund the user’s deposit for multiple reasons mentioned in [Deposit Issues](/api-intro/deposits#deposit-issues).

Refunds are processed automatically if a `refundAddress` is set when creating shifts. This applies to both fixed rate shifts via the [`/v2/shifts/fixed`](/endpoints/v2/createfixedshift) endpoint and variable rate shifts via the [`/v2/shifts/variable`](/endpoints/v2/createvariableshift) endpoint.

For coins that require a memo, the `refundMemo` is optional but can be included.

If a `refundAddress` is not initially provided, it can be set using the [`/v2/shifts/shiftId/set-refund-address`](/endpoints/v2/setrefundaddress) endpoint or users can enter it manually at https://sideshift.ai/orders/{shiftId}. Additionally, this endpoint can be utilized by integrations to prompt users to set the refund address on their respective websites or apps.

:::tip

Replace `{shiftId}` with the actual shiftId, e.g., ed06bbaccdbade5feca7.

:::

# Terminology

**deposit**\[Amount\]\[Address\]\[Memo\]\[Coin\]\[Network\]\[Tx\]: Refers to data about the coin the user is shifting **from**. For example, in a shift from BTC to ETH:

- `depositCoin`: the ticker of the coin the user needs to send to SideShift.ai, e.g. `btc`
- `depositNetwork`: the id of the `depositCoin` network, e.g. `bitcoin` or `mainnet`
- `depositAmount`: the amount of BTC the user needs to deposit
- `depositAddress`: the address the user needs to send the BTC to
- `depositMemo`: The memo that the user needs to include when sending to the deposit address for some coins, e.g., XRP, XLM, ATOM, and KAVA

**settle**\[Amount\]\[Address\]\[Memo\]\[Coin\]\[Network\]\[Rate\]\[Tx\]: Refers to data about the coin the user is shifting **to**. For example:

- `settleCoin`: the ticker of the coin SideShift.ai will send the user, e.g. `eth`
- `settleNetwork`: the ID of the network of the `settleCoin`, e.g. `ethereum` or `optimism`
- `settleAmount`: the amount of ETH SideShift.ai will send
- `settleRate`: the rate at which the coins are exchanged. For example, if a user sends 0.1 BTC and receives 1 ETH, the `settleRate` is 10
- `settleAddress`: The address SideShift.ai will send the ETH to
- `settleTx`: details of the transaction SideShift.ai sent to the user
- `settleMemo`: SideShift supports sending coins to addresses that require a memo on some chains, such as XRP, XLM, ATOM, KAVA, and ALGO

See the [`/v2/coins`](/endpoints/v2/coins) endpoint for a full list of coins and their respective networks supported by SideShift.ai.

# Shift Integration Guide

## Integrating Fixed and Variable Shifts

### Best Practices

1. Set up environment variables for sensitive data:

   ```env
   SIDESHIFT_SECRET=your_account_private_key
   AFFILIATE_ID=your_affiliate_id
   API_BASE_URL=https://sideshift.ai/api/v2
   ```

   :::warning
   Never share your Private Key with anyone. It grants full access to your account and should be kept secret.
   :::

2. Error handling and monitoring:
   - Implement a logging system
   - Monitor API response times
   - Track failed requests

### Fixed Shift

**Request a Quote:** The first step is to request a quote using the [`/v2/quotes`](/endpoints/v2/requestquote) endpoint. This will provide you with a `quoteId` that you will use in the next step. Always include the `x-sideshift-secret` header, and if the request originates from the integration's server, the end user’s IP address should be forwarded in the `x-user-ip` header.

```bash title="Example of a quote request"
curl -L -X POST 'https://sideshift.ai/api/v2/quotes' \
-H 'Content-Type: application/json' \
-H 'x-sideshift-secret: ACCOUNT_PRIVATE_KEY' \
-H 'x-user-ip: END_USER_IP_ADDRESS' \
--data-raw '{
    "affiliateId": "ACCOUNT_AFFILIATE_ID",
    "depositCoin": "BTC",
    "depositNetwork": "bitcoin",
    "settleCoin": "ETH",
    "settleNetwork": "ethereum",
    "depositAmount": "0.01"
}'
```

**Implementation notes:**

- Store the returned `quoteId`
- Implement quote expiration handling
- Add error handling for network issues

**Create a Fixed Shift**: After obtaining the `quoteId`, you can create a fixed rate shift using the [`/v2/shifts/fixed`](/endpoints/v2/createfixedshift) endpoint. The `affiliateId` used in this step must match the one used to request the quote.

```bash title="Example of creating a fixed shift"
curl -L -X POST 'https://sideshift.ai/api/v2/shifts/fixed' \
-H 'x-sideshift-secret: ACCOUNT_PRIVATE_KEY' \
-H 'x-user-ip: END_USER_IP_ADDRESS' \
--data-raw '{
    "settleAddress": "SETTLE_ADDRESS",
    "affiliateId": "ACCOUNT_AFFILIATE_ID",
    "quoteId": "QUOTE_ID"
}'
```

**Implementation notes:**

- Validate quote hasn't expired
- Implement proper error handling
- Start status monitoring after creation

### Variable Shift

**Create a Variable Shift:** To create a variable shift, use the [`/v2/shifts/variable`](/endpoints/v2/createvariableshift) endpoint with the required parameters. Always include the `x-sideshift-secret` header, and if the request originates from the integration's server, the end user’s IP address should be forwarded in the `x-user-ip` header.

```bash title="Example of creating a variable shift"
curl -L -X POST 'https://sideshift.ai/api/v2/shifts/variable' \
-H 'Content-Type: application/json' \
-H 'x-sideshift-secret: ACCOUNT_PRIVATE_KEY' \
-H 'x-user-ip: END_USER_IP_ADDRESS' \
--data-raw '{
    "settleAddress": "SETTLE_ADDRESS",
    "affiliateId": "ACCOUNT_AFFILIATE_ID",
    "depositCoin": "BTC",
    "depositNetwork": "bitcoin",
    "settleCoin": "ETH",
    "settleNetwork": "ethereum",
}'
```

**Implementation notes:**

- Display min/max deposit ranges
- Show real-time rate updates
- Implement proper error handling
- Start status monitoring

**Monitor Status:**

- Poll the shift status every few seconds using the [`/v2/shifts/{shiftId}`](/endpoints/v2/shift) endpoint
- Handle all possible status states
- Implement proper UI feedback for each status

## Key Integration Guidelines:

### User Permissions

The [`/v2/permissions`](/endpoints/v2/permissions) endpoint can be used to determine if the user is allowed to use SideShift.ai. This endpoint can be called before any shift creation.

### Deposit

For fixed rate shifts, a deposit of exactly the amount of `depositAmount` must be made before the `expiresAt` timestamp, otherwise the deposit will be refunded. For variable rate shifts, the user can send any amount within the minimum and maximum deposit ranges. The exchange rate will be determined when the user's deposit is received.

### Set Refund Address (Optional)

`refundAddress` and `refundMemo` are optional. If they aren’t defined, the user will be prompted to enter a refund address manually on the SideShift.ai order page if the shift needs to be refunded. Alternatively, the [`/v2/shifts/{shiftId}/set-refund-address`](/endpoints/v2/setrefundaddress) endpoint can be used to set the refund address if the shift has a `refund` status.

### Handle Memos (Optional)

For shifts that return a `depositMemo`, the deposit transaction must include this memo; otherwise, the deposit might be lost. For shifts settling in coins where the network is included in the `networksWithMemo` array in the [`/v2/coins`](/endpoints/v2/coins) endpoint, integrations can specify a `settleMemo` field.

### Receive Settlement

Once the deposit is confirmed in the blockchain, SideShift.ai will process the shift and send the settled amount to the `settleAddress`.

## Live Demo App

Try out this [Demo App](https://rest-api-demo-app.netlify.app/).

# Receiving support

In case something goes wrong with the user's shift, they can receive support from SideShift.ai through the following methods:

1. **Email Support:** Users can send an email to [help@sideshift.ai](mailto:help@sideshift.ai) to receive support. To ensure a faster resolution, users should include their shift ID in the support email. The shift ID is returned when creating a shift using the [`/v2/shifts/fixed`](/endpoints/v2/createfixedshift) or [`/v2/shifts/variable`](/endpoints/v2/createvariableshift) endpoint. It's recommended for integrations to pre-populate the email template with the user's shift ID.
2. **Support Chat:** Users can access support by clicking on the chat icon at SideShift.ai and providing their shift ID. Similarly, integrations can leverage the SideShift.ai support chat to offer a seamless support experience to their users. It's recommended for integrations to include a link directing users to the SideShift.ai support chat. To initiate a support chat session with a pre-filled shift ID, integrations can use the following as reference: [https://sideshift.ai/orders/4c3839c16640704410b0?openSupport=true](https://sideshift.ai/orders/4c3839c16640704410b0?openSupport=true)

# Endpoints

## V2 vs V1 API

SideShift.ai strongly advises integrators to use the new V2 API version. It handles multi-network coins much more efficiently and uses easier to understand terminology. V1 API is deprecated and will not be developed further. The documentation for V1 will remain here to support already existing integrations, who are also strongly encouraged to make the switch to V2.

# Coins

Returns the list of coins and their respective networks available on SideShift.ai.

The fields `fixedOnly`, `variableOnly`, `depositOffline`, `settleOffline` will return `false` if `false` for every network. `true` for single network assets and an array of networks for mixed.

<div>
  <div>
        <div> OK </div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <li>
                        <div
                          style={{
                            fontSize: "var(--ifm-code-font-size)",
                            opacity: "0.6",
                            marginLeft: "-.5rem",
                            paddingBottom: ".5rem",
                          }}
                        >
                          Array [
                        </div>
                      </li>
                      <SchemaItem
                        collapsible={false}
                        name={"networks"}
                        required={true}
                        schemaName={"string[]"}
                        qualifierMessage={undefined}
                        schema={{ type: "array", items: { type: "string" } }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"coin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"name"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"hasMemo"}
                        required={true}
                        schemaName={"boolean"}
                        qualifierMessage={undefined}
                        schema={{"type":"boolean","deprecated":true}}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"fixedOnly"}
                        required={true}
                        schemaName={"string[] or boolean"}
                        qualifierMessage={undefined}
                        schema={{ type: "array", items: { type: "string" } }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"variableOnly"}
                        required={true}
                        schemaName={"string[] or boolean"}
                        qualifierMessage={undefined}
                        schema={{ type: "array", items: { type: "string" } }}
                      ></SchemaItem>
                        <div
                          data-collapsed={true}
                          open={true}
                          style={{}}
                          className={"openapi-markdown__details"}
                        >
                          <summary style={{}}>
                            <span className={"openapi-schema__container"}>
                              <strong className={"openapi-schema__property"}>
                                tokenDetails
                              </strong>
                              <span className={"openapi-schema__name"}>
                                {" "}
                                object(s)
                              </span>
                            </span>
                          </summary>
                          <div style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={true}
                              className={"schemaItem"}
                            >
                              <div
                                data-collapsed={true}
                                open={true}
                                style={{}}
                                className={"openapi-markdown__details"}
                              >
                                <summary style={{}}>
                                  <span className={"openapi-schema__container"}>
                                    <strong
                                      className={"openapi-schema__property"}
                                    >
                                      network
                                    </strong>
                                    <span className={"openapi-schema__name"}>
                                      {" "}
                                      object
                                    </span>
                                  </span>
                                </summary>
                                <div style={{ marginLeft: "1rem" }}>
                                  <SchemaItem
                                    collapsible={false}
                                    name={"contractAddress"}
                                    required={true}
                                    schemaName={"string"}
                                    qualifierMessage={undefined}
                                    schema={{ type: "string" }}
                                  ></SchemaItem>
                                  <SchemaItem
                                    collapsible={false}
                                    name={"decimals"}
                                    required={true}
                                    schemaName={"number"}
                                    qualifierMessage={undefined}
                                    schema={{
                                      type: "integer",
                                      format: "number",
                                    }}
                                  ></SchemaItem>
                                </div>
                              </div>
                          </div>
                        </div>
                      <SchemaItem
                        collapsible={false}
                        name={"networksWithMemo"}
                        required={true}
                        schemaName={"string[]"}
                        qualifierMessage={undefined}
                        schema={{ type: "array", items: { type: "string" } }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositOffline"}
                        required={false}
                        schemaName={"string[] or boolean"}
                        qualifierMessage={undefined}
                        schema={{ type: "array", items: { type: "string" } }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleOffline"}
                        required={false}
                        schemaName={"string[] or boolean"}
                        qualifierMessage={undefined}
                        schema={{ type: "array", items: { type: "string" } }}
                      ></SchemaItem>
                      <li>
                        <div
                          style={{
                            fontSize: "var(--ifm-code-font-size)",
                            opacity: "0.6",
                            marginLeft: "-.5rem",
                          }}
                        >
                          ]
                        </div>
                      </li>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={
                      '[\n  {\n    "networks": [\n      "liquid",\n      "polygon",\n      "optimism",\n      "avax",\n      "bsc",\n      "ethereum",\n      "ton",\n      "aptos",\n      "arbitrum",\n      "solana",\n      "tron"\n    ],\n    "coin": "USDT",\n    "name": "Tether",\n    "hasMemo": false,\n    "fixedOnly": false,\n    "variableOnly": false,\n    "tokenDetails": {\n      "polygon": {\n        "contractAddress": "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",\n        "decimals": 6\n      },\n      "optimism": {\n        "contractAddress": "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",\n        "decimals": 6\n      },\n      "avax": {\n        "contractAddress": "0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7",\n        "decimals": 6\n      },\n      "bsc": {\n        "contractAddress": "0x55d398326f99059fF775485246999027B3197955",\n        "decimals": 18\n      },\n      "ethereum": {\n        "contractAddress": "0xdac17f958d2ee523a2206206994597c13d831ec7",\n        "decimals": 6\n      },\n      "ton": {\n        "contractAddress": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",\n        "decimals": 6\n      },\n      "aptos": {\n        "contractAddress": "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",\n        "decimals": 6\n      },\n      "arbitrum": {\n        "contractAddress": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",\n        "decimals": 6\n      },\n      "solana": {\n        "contractAddress": "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",\n        "decimals": 6\n      },\n      "tron": {\n        "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",\n        "decimals": 6\n      }\n    },\n    "networksWithMemo": [\n      "ton"\n    ],\n    "depositOffline": false,\n    "settleOffline": false\n  }\n]'
                    }
                    language={"json"}
                  ></ResponseSamples>
        </div>

  </div>
</div>

HTTP Status Codes:
Default:
- default

# Coin icon

<h1 className={"openapi__heading"}>Coin icon</h1>

<MethodEndpoint
  method={"get"}
  path={"/coins/icon/{coin-network}"}
></MethodEndpoint>

Returns the icon of the coin in svg or png format.

The coin can be `coin-network` or if `network` is omitted, it will default to the `mainnet`. E.g `btc-bitcoin`, `btc-mainnet` or `btc` all return the BTC on chain logo. `btc-liquid` return the Liquid BTC logo.

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Path Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "coin-network",
          in: "path",
          required: true,
          schema: { type: "string" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<div>
  <div>
        <div>OK</div>
        <div>
            <TabItem
              label={"image/svg+xml or image/png"}
              value={"image/svg+xml or image/png"}
            >
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"image/svg+xml or image/png"}
                        required={true}
                        qualifierMessage={undefined}
                        schema={{ type: "image/svg+xml" }}
                      ></SchemaItem>
                    </ul>
                  </details>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
                      <g fill="none" fill-rule="evenodd">
                        <circle cx="16" cy="16" r="16" fill="#F7931A" />
                        <path
                          fill="#FFF"
                          fill-rule="nonzero"
                          d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
                        />
                      </g>
                    </svg>
                  </div>
        </div>
        <div>Bad Request</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Method USDT/ripple not found"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
2xx Success:
- 200: OK

4xx Client Errors:
- 400: Bad Request

# Permissions

<h1 className={"openapi__heading"}>Permissions</h1>

Returns whether or not the user is allowed to create shifts on SideShift.ai. Learn [more](https://help.sideshift.ai/en/articles/2874595-why-am-i-blocked-from-using-sideshift-ai).

:::info
SideShift.ai does not allow proxying user requests. This means that the user should either directly interact with the SideShift.ai REST API, or if the API requests are sent from the integration's own server, the x-user-ip header must be set to the end-user IP address.
:::

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-user-ip",
          in: "header",
          description: "end-user IP address for integrations API requests",
          required: false,
          style: "simple",
          schema: { type: "string", example: "1.2.3.4" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>

<div>
  <div>
        <div>OK</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"createShift"}
                        required={true}
                        schemaName={"boolean"}
                        qualifierMessage={undefined}
                        schema={{ type: "boolean" }}
                      ></SchemaItem>
                    </ul>
                  </details>
                  <div>Allowed</div>
                  <ResponseSamples
                    responseExample={`{
    "createShift": true
}`}
                    language={"json"}
                  ></ResponseSamples>
                  <div>Restricted</div>
                  <ResponseSamples
                    responseExample={`{
    "createShift": false
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Forbidden</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Access denied. See https://sideshift.ai/access-denied"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
Default:
- default

# Pair

<h1 className={"openapi__heading"}>Pair</h1>

Returns the minimum and maximum deposit amount and the rate for a pair of coins.

`from` and `to` can be `coin-network` or if `network` is omitted, it will default to the `mainnet`. E.g `eth-ethereum`, `eth-mainnet` or `eth` all refer to ETH on the Ethereum network. `eth-arbitrum` refers to ETH on Arbitrum network.

The rate is determined after incorporating network fees. Without specifying an `amount`, the system will assume a deposit value of `500 USD`. This can be adjusted by adding the `amount` query parameter.

<details style={{ marginBottom: "1rem" }} data-collapsed={false} open={false}>
  <summary style={{}}>
    <strong>Rate Example Computations</strong>
  </summary>

- BTC price: 30000 USD
- USDT price: 1 USD
- depositCoin: USDT
- depositNetwork: ethereum
- settleCoin: BTC
- USDT receiving fee: 10 USD
- BTC sending fee: 5 USD
- Default deposit amount: 500 USD

```
/pair/usdt-eth/btc

Without specifying the amount at the endpoint, we can calculate the rate as follows:

Rate X = ( default deposit amount - (USDT receiving fee + BTC sending fee) / default deposit amount) / BTC price
Rate X = 0.000032333333333
```

```
/pair/usdt-eth/btc?amount=10000

With a specified amount at the endpoint, such as 10000, we can calculate the rate as follows:

Rate Y = ( specified amount - (USDT receiving fee + BTC sending fee) / specified amount) / BTC price
Rate Y = 0.000033283333333

With a specified amount of 10000, the rate is higher. This is because the 15 USD combined network fee has a reduced impact on larger shifts, making it less significant in the overall cost of the 500 USD shift.
```

</details>

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

:::info
Use the same `commissionRate` in this endpoint as when creating the shift/quote to get an accurate rate information.
:::

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Path Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "from",
          in: "path",
          description: "",
          required: true,
          schema: { type: "string" },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "to",
          in: "path",
          description: "",
          required: true,
          schema: { type: "string" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Query Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "affiliateId",
          in: "query",
          description: "",
          required: true,
          style: "form",
          explode: true,
          schema: { type: "string", example: "YQMi62XMb" },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "amount",
          in: "query",
          description: "",
          required: false,
          style: "form",
          explode: true,
          schema: { type: "number", format: "number", example: 0.1 },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "commissionRate",
          in: "query",
          description: "",
          required: false,
          style: "form",
          explode: true,
          schema: { type: "string", example: "0.02" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<div>
  <div>
        <div>OK</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"min"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"max"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"rate"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={
                      '{\n  "min": "0.0.00010771",\n  "max": "1.43608988",\n  "rate": "17.298009817772",\n  "depositCoin": "BTC",\n  "settleCoin": "ETH",\n  "depositNetwork": "bitcoin",\n  "settleNetwork": "ethereum"\n}'
                    }
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Bad Request</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Cannot shift between the same coin network pair"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Internal Server Error</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Shift unavailable"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Invalid coin"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Invalid network"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Amount is above the maximum of 30000 USDT"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Amount is below the minimum of 3 USDT"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
Default:
- default

# Pairs

<h1 className={"openapi__heading"}>Pairs</h1>

Returns the minimum and maximum deposit amount and the rate for every possible pair of coins listed in the query string.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

:::info
Use the same `commissionRate` in this endpoint as when creating the shift/quote to get an accurate rate information.
:::

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Query Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "pairs",
          in: "query",
          description: "btc-mainnet,usdc-bsc,bch,eth",
          required: true,
          style: "form",
          explode: true,
          schema: {
            type: "string",
            example: "btc-mainnet,usdc-bsc,bch,bch-smartbch",
          },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "affiliateId",
          in: "query",
          description: "",
          required: true,
          style: "form",
          explode: true,
          schema: { type: "string", example: "YQMi62XMb" },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "commissionRate",
          in: "query",
          description: "",
          required: false,
          style: "form",
          explode: true,
          schema: { type: "string", example: "0.02" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<div>
  <div>
        <div>OK</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <li>
                        <div
                          style={{
                            fontSize: "var(--ifm-code-font-size)",
                            opacity: "0.6",
                            marginLeft: "-.5rem",
                            paddingBottom: ".5rem",
                          }}
                        >
                          Array [
                        </div>
                      </li>
                      <SchemaItem
                        collapsible={false}
                        name={"depositCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"min"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"max"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"rate"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <li>
                        <div
                          style={{
                            fontSize: "var(--ifm-code-font-size)",
                            opacity: "0.6",
                            marginLeft: "-.5rem",
                          }}
                        >
                          ]
                        </div>
                      </li>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={
                      '[\n  {\n    "depositCoin": "BTC",\n    "settleCoin": "ETH",\n    "depositNetwork": "bitcoin",\n    "settleNetwork": "ethereum",\n    "min": "0.00010753",\n    "max": "1.43368044",\n    "rate": "17.291251441744"\n  },\n  {\n    "depositCoin": "ETH",\n    "settleCoin": "BTC",\n    "depositNetwork": "ethereum",\n    "settleNetwork": "bitcoin",\n    "min": "0.013802779514",\n    "max": "25.27981596",\n    "rate": "0.055429074413"\n  }\n]'
                    }
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Internal Server Error</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Rate unavailable"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
      "message": "Duplicate coin"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Invalid coin"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Invalid network"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
Default:
- default

# Shift

<h1 className={"openapi__heading"}>Shift</h1>

Returns the shift data for single shift. For bulk retrieval, use [`/v2/shifts?ids=shiftId1,shiftId2`](/endpoints/v2/bulkshifts).

For shift that has `multiple` as status, the `deposits` array in the API response holds all deposits associated with a shift.

- **Fixed Shifts**: The array will show multiple deposits, but only the first deposit is settled. Subsequent deposits are refunded.
- **Variable Shifts**: Multiple deposits are listed and processed individually according to the current market rates and conditions.

:::note
It is not desirable for users to make multiple deposits to the same shift, and integrators should avoid encouraging this behavior.
:::

`depositAddress` is unassigned from a shift after 60 days (40 days for EVM token deposit addresses). Once unassigned, the field becomes `null`, and the address may be assigned to other shifts. Persist the value when the shift is created if it needs to be shown later, and never send funds to addresses from expired shifts.

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Path Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "shiftId",
          in: "path",
          description: "",
          required: true,
          schema: {
            type: "string",
            example: "f173118220f1461841da", // This is just an example shiftId, you can replace it if needed
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>

    <div>OK</div>
      <TabItem
        label={"application/json"}
        value={"application/json"}
        className={"openapi-tabs__tab-item"}
      >
          <TabItem
            label={"Schema"}
            value={"Schema"}
            className={"openapi-tabs__tab-item"}
          >
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Fixed Shift Single Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"quoteId"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAmount"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAmount"}
                  required={false}
                  qualifierMessage={
                    "required if shift's status is settled or expired"
                  }
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"externalId"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={"integration’s own ID"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"updatedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositReceivedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"rate"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"issue"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Variable Shift Single Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAmount"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAmount"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={"required if shift's status is settled"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"externalId"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={"integration's own ID"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"updatedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositReceivedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"rate"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoinNetworkFee"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                  qualifierMessage={
                    "only available when shift is expired or not yet settled"
                  }
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Fixed Shift Multiple Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"quoteId"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={true}
                  name={"deposits"}
                  required={true}
                  schemaName={"array of objects"}
                  schema={{ type: "array" }}
                >
                  <div>
                    <strong>deposits</strong>
                    <span style={{ opacity: "0.6" }}> objects[]</span>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"updatedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositHash"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleHash"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositReceivedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositAmount"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"rate"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"status"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                    </ul>
                  </div>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Variable Shift Multiple Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={true}
                  name={"deposits"}
                  required={true}
                  schemaName={"array of objects"}
                  schema={{ type: "array" }}
                >
                  <div>
                    <strong>deposits</strong>
                    <span style={{ opacity: "0.6" }}> objects[]</span>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"updatedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositHash"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleHash"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositReceivedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositAmount"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"rate"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"status"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                    </ul>
                  </div>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Settled Fixed Shift</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "dda3867168da23927b62",
    "createdAt": "2022-06-14T11:29:11.661Z",
    "depositCoin": "BTC",
    "settleCoin": "BCH",
    "depositNetwork": "bitcoin",
    "settleNetwork": "bitcoincash",
    "depositAddress": "19dENFt4wVwos6xtgwStA6n8bbA57WCS58",
    "settleAddress": "bitcoincash:qplfzeasde8cedsd4wq5zwnlp2qwtl7j25rf69kwkr",
    "depositMin": "0.0013171",
    "depositMax": "0.0013171",
    "refundAddress": "19dENFt4wVwos6xtgwStA6n8bbA57WCS58",
    "type": "fixed",
    "quoteId": "459abd73-71cd-40ac-b4b0-58b90386ce53",
    "depositAmount": "0.0013171",
    "settleAmount": "0.2293151",
    "expiresAt": "2022-06-14T11:44:09.386Z",
    "status": "settled",
    "updatedAt": "2022-06-14T11:31:26.068Z",
    "depositHash": "e23491d7125c0ed36182a12b6eddeda0bed466a2239a6bd1f8838fe30dd38a96",
    "settleHash": "d1cc670a82903aaf0de38dabde519b0c1e07b123456b3e5cd0f43e9d014cd4a7",
    "depositReceivedAt": "2022-06-14T11:29:29.114Z",
    "rate": "174.106066357908"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Settled Variable Shift</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "f173118220f1461841da",
    "createdAt": "2022-06-14T10:58:44.868Z",
    "depositCoin": "LTC",
    "settleCoin": "BTC",
    "depositNetwork": "litecoin",
    "settleNetwork": "bitcoin",
    "depositAddress": "MRHrYyu9H5dFXvqHcUMfY3h7Nsyt1dhR5T",
    "settleAddress": "3213dAuUQB9CFK1s9vUJLSmhTxdHPSCRne",
    "depositMin": "0.28164145",
    "depositMax": "902.69693964",
    "type": "variable",
    "depositAmount": "1.34673526",
    "settleAmount": "0.00256814",
    "expiresAt": "2022-06-21T10:58:44.818Z",
    "status": "settled",
    "updatedAt": "2022-06-14T11:00:16.437Z",
    "depositHash": "f3140b39b1e5ab28332ffc6108bf469907ecf4b339001179d277ac38aa08d732",
    "settleHash": "4d079bdb671716563796706e383aa3d9135b123f8f238ae1e39c836fe89f87a6",
    "depositReceivedAt": "2022-06-14T10:59:17.182Z",
    "rate": "0.001906937522"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Refund</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "3907c0c08d9791ed1fc1",
    "createdAt": "2024-05-24T23:40:35.726Z",
    "depositCoin": "BNB",
    "settleCoin": "USDT",
    "depositNetwork": "bsc",
    "settleNetwork": "bsc",
    "depositAddress": "0x9Ee1119931c1C0C1aCF49c82E8D68532E665e066",
    "settleAddress": "0xF189eD5F2102402B5E8BD03936b009030f5732c7",
    "depositMin": "0.0167",
    "depositMax": "0.0167",
    "type": "fixed",
    "quoteId": "46a272bb-0234-4429-ac30-135dc9a92477",
    "depositAmount": "0.01",
    "expiresAt": "2024-05-24T23:55:27.526Z",
    "status": "refund",
    "averageShiftSeconds": "24.435887",
    "updatedAt": "2024-05-24T23:41:44.181Z",
    "depositHash": "0x9b56e915677ab1bfb678d9ad6846cd724c538496cb199a4045032745f719a88a",
    "depositReceivedAt": "2024-05-24T23:41:32.305Z",
    "rate": "586.537938323353",
    "issue": "incorrect amount"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Refunded</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "6821efcf996558f0053e",
    "createdAt": "2023-09-28T06:23:26.609Z",
    "depositCoin": "BNB",
    "settleCoin": "USDT",
    "depositNetwork": "bsc",
    "settleNetwork": "bsc",
    "depositAddress": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    "settleAddress": "0xd1a8ADC8ca3a58ABbbD206Ed803EC1F13384ba3c",
    "depositMin": "0.01459649",
    "depositMax": "0.01459649",
    "refundAddress": "0xd1a8ADC8ca3a58ABbbD206Ed803EC1F13384ba3c",
    "type": "fixed",
    "quoteId": "2d2d6cff-2a64-47e4-8add-8cbd368cc894",
    "depositAmount": "0.01559649",
    "expiresAt": "2023-09-28T06:35:02.326Z",
    "status": "refunded",
    "averageShiftSeconds": "59.761047",
    "updatedAt": "2023-09-28T06:29:32.829Z",
    "depositHash": "0x1477d3601be826e033301196d2eb6abdd16a28584805dae8bc1ced07d0444caa",
    "settleHash": "0xccf5021fcadd7ca624ae89a2a16ba70c28f39ff3beafddb2dfaa0adcde427d4b",
    "depositReceivedAt": "2023-09-28T06:26:14.406Z",
    "rate": "205.528863445938"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Expired Fixed Shift</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "890f45d6068d5340c1bd",
    "createdAt": "2023-10-17T01:06:59.148Z",
    "depositCoin": "BUSD",
    "settleCoin": "BNB",
    "depositNetwork": "bsc",
    "settleNetwork": "bsc",
    "depositAddress": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
    "settleAddress": "0xd1a8ADC8ca3a58ABbbD206Ed803EC1F13384ba3c",
    "depositMin": "3",
    "depositMax": "3",
    "type": "fixed",
    "quoteId": "227d3cbd-15de-4581-80ac-17241b5410da",
    "depositAmount": "3",
    "settleAmount": "0.01370241",
    "expiresAt": "2023-10-17T01:14:16.692Z",
    "status": "expired",
    "averageShiftSeconds": "61.12102",
    "rate": "0.00456747"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Expired Variable Shift</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "dbb127698bb29fb5a8cd",
    "createdAt": "2024-01-31T04:07:11.664Z",
    "depositCoin": "USDT",
    "settleCoin": "USDT",
    "depositNetwork": "bsc",
    "settleNetwork": "ethereum",
    "depositAddress": "0xc1117a7BC4be7E788F16F600Dd8e223d1ED5525B",
    "settleAddress": "0x7Ac93c0198bF5E28894696cF25e9581e46A6550a",
    "depositMin": "31.44",
    "depositMax": "40000",
    "type": "variable",
    "expiresAt": "2024-01-31T04:12:23.440Z",
    "status": "expired",
    "averageShiftSeconds": "45.815665",
    "settleCoinNetworkFee": "3.0000"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Multiple</strong>
              </summary>
              <ResponseSamples
                responseExample={`{
    "id": "fa2e733e13d08d323bsd",
    "createdAt": "2023-10-17T08:35:58.836Z",
    "depositCoin": "ETH",
    "settleCoin": "BNB",
    "depositNetwork": "ethereum",
    "settleNetwork": "bsc",
    "depositAddress": "0xf584314e9a924Cf590A62E903466A14E54a81874",
    "settleAddress": "0x2b35e5bDd11c1d1F3D7e2D5a91bc3A1641de9a0c",
    "depositMin": "0.001892087919",
    "depositMax": "8.368070030783",
    "type": "variable",
    "expiresAt": "2023-10-24T08:35:58.835Z",
    "status": "multiple",
    "deposits": [
        {
            "updatedAt": "2023-10-17T08:37:38.018Z",
            "depositHash": "0x21aa7c3335d5f8f0ea66830c9dbbec669218e2ebf4a52db73f7ad3cbafe3cd17",
            "depositReceivedAt": "2023-10-17T08:37:36.219Z",
            "depositAmount": "0.001",
            "status": "pending"
        },
        {
            "updatedAt": "2023-10-17T08:40:55.092Z",
            "depositHash": "0x9be372c850f482bee08695b217af364eb7a0467b3a4955f3fd99d568da2a9A03",
            "settleHash": "0x918b876f19a9c2130a2ba00c7311f460d8997cca387e3d9836d57d6dcb38d4c1",
            "depositReceivedAt": "2023-10-17T08:39:41.346Z",
            "depositAmount": "0.001",
            "settleAmount": "0.00620308",
            "rate": "6.20308",
            "status": "settled"
        }
    ],
    "averageShiftSeconds": "60.882891"
}`}
                language={"json"}
              ></ResponseSamples>
            </details>
    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
      "message": "Order not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Bulkshifts

<h1 className={"openapi__heading"}>Bulk shifts</h1>

Returns the shift data for every `shiftId` listed in the query string.

`depositAddress` is unassigned from a shift after 60 days (40 days for EVM token deposit addresses). Once unassigned, the field becomes `null`, and the address may be assigned to other shifts. Persist the value when the shift is created if it needs to be shown later, and never send funds to addresses from expired shifts.

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Query Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "ids",
          in: "query",
          description: "f173118220f1461841da,dda3867168da23927b62",
          required: true,
          style: "form",
          explode: true,
          schema: {
            type: "string",
            example: "f173118220f1461841da,dda3867168da23927b62",
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>

    <div>Ok</div>
    <div>
      <TabItem
        label={"application/json"}
        value={"application/json"}
        className={"openapi-tabs__tab-item"}
      >
          <TabItem
            label={"Schema"}
            value={"Schema"}
            className={"openapi-tabs__tab-item"}
          >
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Fixed Shift Single Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"quoteId"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAmount"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAmount"}
                  required={false}
                  qualifierMessage={
                    "required if shift's status is settled or expired"
                  }
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"externalId"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={"integration's own ID"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"updatedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositReceivedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"rate"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Variable Shift Single Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAmount"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAmount"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={"required if shift's status is settled"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"externalId"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={"integration's own ID"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"updatedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleHash"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositReceivedAt"}
                  required={false}
                  schemaName={"string"}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"rate"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                  qualifierMessage={
                    "required if shift's status is settled or refunded"
                  }
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoinNetworkFee"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                  qualifierMessage={
                    "only available when shift is expired or not yet settled"
                  }
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Fixed Shift Multiple Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"quoteId"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={true}
                  name={"deposits"}
                  required={true}
                  schemaName={"array of objects"}
                  schema={{ type: "array" }}
                >
                  <div>
                    <strong>deposits</strong>
                    <span style={{ opacity: "0.6" }}> objects[]</span>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"updatedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositHash"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleHash"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositReceivedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositAmount"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"rate"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"status"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                    </ul>
                  </div>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
              </ul>
            </details>
            <details
              style={{}}
              className={"openapi-markdown__details response"}
              data-collapsed={false}
              open={false}
            >
              <summary
                style={{}}
                className={"openapi-markdown__details-summary-response"}
              >
                <strong>Variable Shift Multiple Deposit</strong>
              </summary>
              <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
              <ul style={{ marginLeft: "1rem" }}>
                <SchemaItem
                  collapsible={false}
                  name={"id"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"createdAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleCoin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleNetwork"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"settleAddress"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMin"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"depositMax"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundAddress"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"refundMemo"}
                  required={false}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"type"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"expiresAt"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={false}
                  name={"status"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
                <SchemaItem
                  collapsible={true}
                  name={"deposits"}
                  required={true}
                  schemaName={"array of objects"}
                  schema={{ type: "array" }}
                >
                  <div>
                    <strong>deposits</strong>
                    <span style={{ opacity: "0.6" }}> objects[]</span>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"updatedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositHash"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleHash"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositReceivedAt"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositAmount"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"rate"}
                        required={false}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"status"}
                        required={true}
                        schemaName={"string"}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                    </ul>
                  </div>
                <SchemaItem
                  collapsible={false}
                  name={"averageShiftSeconds"}
                  required={true}
                  schemaName={"string"}
                  schema={{ type: "string" }}
                ></SchemaItem>
              </ul>
            </details>
<ResponseSamples
    responseExample={`[
    {
        "id": "f173118220f1461841da",
        "createdAt": "2022-06-14T10:58:44.868Z",
        "depositCoin": "LTC",
        "settleCoin": "BTC",
        "depositNetwork": "litecoin",
        "settleNetwork": "bitcoin",
        "depositAddress": "MRHrYyu9H5dFXvqHcUMfY3h7Nsyt1dhR5T",
        "settleAddress": "3213dAuUQB9CFK1s9vUJLSmhTxdHPSCRne",
        "depositMin": "0.28164145",
        "depositMax": "902.69693964",
        "type": "variable",
        "depositAmount": "1.34673526",
        "settleAmount": "0.00256814",
        "expiresAt": "2022-06-21T10:58:44.818Z",
        "status": "settled",
        "updatedAt": "2022-06-14T11:00:16.437Z",
        "depositHash": "f3140b39b1e5ab28332ffc6108bf469907ecf4b339001179d277ac38aa08d732",
        "settleHash": "4d079bdb671716563796706e383aa3d9135b123f8f238ae1e39c836fe89f87a6",
        "depositReceivedAt": "2022-06-14T10:59:17.182Z",
        "rate": "0.001906937522"
    },
    {
        "id": "dbb127698bb29fb5a8cd",
        "createdAt": "2024-01-31T04:07:11.664Z",
        "depositCoin": "USDT",
        "settleCoin": "USDT",
        "depositNetwork": "bsc",
        "settleNetwork": "ethereum",
        "depositAddress": "0xc1117a7BC4be7E788F16F600Dd8e223d1ED5525B",
        "settleAddress": "0x7Ac93c0198bF5E28894696cF25e9581e46A6550a",
        "depositMin": "31.44",
        "depositMax": "40000",
        "type": "variable",
        "expiresAt": "2024-01-31T04:12:23.440Z",
        "status": "expired",
        "averageShiftSeconds": "45.815665",
        "settleCoinNetworkFee": "3.0000"
    },
    {
        "id": "dda3867168da23927b62",
        "createdAt": "2022-06-14T11:29:11.661Z",
        "depositCoin": "BTC",
        "settleCoin": "BCH",
        "depositNetwork": "bitcoin",
        "settleNetwork": "bitcoincash",
        "depositAddress": "19dENFt4wVwos6xtgwStA6n8bbA57WCS58",
        "settleAddress": "bitcoincash:qplfzeasde8cedsd4wq5zwnlp2qwtl7j25rf69kwkr",
        "depositMin": "0.0013171",
        "depositMax": "0.0013171",
        "refundAddress": "19dENFt4wVwos6xtgwStA6n8bbA57WCS58",
        "type": "fixed",
        "quoteId": "459abd73-71cd-40ac-b4b0-58b90386ce53",
        "depositAmount": "0.0013171",
        "settleAmount": "0.2293151",
        "expiresAt": "2022-06-14T11:44:09.386Z",
        "status": "settled",
        "updatedAt": "2022-06-14T11:31:26.068Z",
        "depositHash": "e23491d7125c0ed36182a12b6eddeda0bed466a2239a6bd1f8838fe30dd38a96",
        "settleHash": "d1cc670a82903aaf0de38dabde519b0c1e07b123456b3e5cd0f43e9d014cd4a7",
        "depositReceivedAt": "2022-06-14T11:29:29.114Z",
        "rate": "174.106066357908"
    },
    {
        "id": "6821efcf996558f0053e",
        "createdAt": "2023-09-28T06:23:26.609Z",
        "depositCoin": "BNB",
        "settleCoin": "USDT",
        "depositNetwork": "bsc",
        "settleNetwork": "bsc",
        "depositAddress": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        "settleAddress": "0xd1a8ADC8ca3a58ABbbD206Ed803EC1F13384ba3c",
        "depositMin": "0.01459649",
        "depositMax": "0.01459649",
        "refundAddress": "0xd1a8ADC8ca3a58ABbbD206Ed803EC1F13384ba3c",
        "type": "fixed",
        "quoteId": "2d2d6cff-2a64-47e4-8add-8cbd368cc894",
        "depositAmount": "0.01559649",
        "expiresAt": "2023-09-28T06:35:02.326Z",
        "status": "refunded",
        "averageShiftSeconds": "59.761047",
        "updatedAt": "2023-09-28T06:29:32.829Z",
        "depositHash": "0x1477d3601be826e033301196d2eb6abdd16a28584805dae8bc1ced07d0444caa",
        "settleHash": "0xccf5021fcadd7ca624ae89a2a16ba70c28f39ff3beafddb2dfaa0adcde427d4b",
        "depositReceivedAt": "2023-09-28T06:26:14.406Z",
        "rate": "205.528863445938"
    },
    {
        "id": "890f45d6068d5340c1bd",
        "createdAt": "2023-10-17T01:06:59.148Z",
        "depositCoin": "BUSD",
        "settleCoin": "BNB",
        "depositNetwork": "bsc",
        "settleNetwork": "bsc",
        "depositAddress": "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
        "settleAddress": "0xd1a8ADC8ca3a58ABbbD206Ed803EC1F13384ba3c",
        "depositMin": "3",
        "depositMax": "3",
        "type": "fixed",
        "quoteId": "227d3cbd-15de-4581-80ac-17241b5410da",
        "depositAmount": "3",
        "settleAmount": "0.01370241",
        "expiresAt": "2023-10-17T01:14:16.692Z",
        "status": "expired",
        "averageShiftSeconds": "61.12102",
        "rate": "0.00456747"
    },
    {
        "id": "fa2e733e13d08d323bsd",
        "createdAt": "2023-10-17T08:35:58.836Z",
        "depositCoin": "ETH",
        "settleCoin": "BNB",
        "depositNetwork": "ethereum",
        "settleNetwork": "bsc",
        "depositAddress": "0xf584314e9a924Cf590A62E903466A14E54a81874",
        "settleAddress": "0x2b35e5bDd11c1d1F3D7e2D5a91bc3A1641de9a0c",
        "depositMin": "0.001892087919",
        "depositMax": "8.368070030783",
        "type": "variable",
        "expiresAt": "2023-10-24T08:35:58.835Z",
        "status": "multiple",
        "deposits": [
            {
                "updatedAt": "2023-10-17T08:37:38.018Z",
                "depositHash": "0x21aa7c3335d5f8f0ea66830c9dbbec669218e2ebf4a52db73f7ad3cbafe3cd17",
                "depositReceivedAt": "2023-10-17T08:37:36.219Z",
                "depositAmount": "0.001",
                "status": "pending"
            },
            {
                "updatedAt": "2023-10-17T08:40:55.092Z",
                "depositHash": "0x9be372c850f482bee08695b217af364eb7a0467b3a4955f3fd99d568da2a9A03",
                "settleHash": "0x918b876f19a9c2130a2ba00c7311f460d8997cca387e3d9836d57d6dcb38d4c1",
                "depositReceivedAt": "2023-10-17T08:39:41.346Z",
                "depositAmount": "0.001",
                "settleAmount": "0.00620308",
                "rate": "6.20308",
                "status": "settled"
            }
        ],
        "averageShiftSeconds": "60.882891"
    }
]`}
  language={"json"}
></ResponseSamples>
    </div>

    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
      "message": "Order not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Recent shifts

<h1 className={"openapi__heading"}>Recent shifts</h1>

Returns the 10 most recent completed shifts. Use query param `limit` to change the number of recent shifts returned. `limit` must be between 1-100.

:::note
To preserve users privacy, shifts involving privacy coins will return `null` for both deposit and settle amount.
:::

<div>
  <div>
        <div></div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <li>
                        <div
                          style={{
                            fontSize: "var(--ifm-code-font-size)",
                            opacity: "0.6",
                            marginLeft: "-.5rem",
                            paddingBottom: ".5rem",
                          }}
                        >
                          Array [
                        </div>
                      </li>
                      <SchemaItem
                        collapsible={false}
                        name={"createdAt"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"depositAmount"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{ type: "string" }}
                      ></SchemaItem>
                      <li>
                        <div
                          style={{
                            fontSize: "var(--ifm-code-font-size)",
                            opacity: "0.6",
                            marginLeft: "-.5rem",
                          }}
                        >
                          ]
                        </div>
                      </li>
                    </ul>
                  </details>
                  <ResponseSamples
  responseExample={`[
    {
      "createdAt": "2023-10-17T06:48:18.622Z",
      "depositCoin": "ETH",
      "depositNetwork": "ethereum",
      "depositAmount": "0.12612806",
      "settleCoin": "BTC",
      "settleNetwork": "bitcoin",
      "settleAmount": "0.00688094"
    },
    {
      "createdAt": "2023-10-17T06:33:23.326Z",
      "depositCoin": "BTC",
      "depositNetwork": "bitcoin",
      "depositAmount": "0.0004333",
      "settleCoin": "ETH",
      "settleNetwork": "ethereum",
      "settleAmount": "0.00736396"
    },
    {
      "createdAt": "2023-10-17T06:43:35.877Z",
      "depositCoin": "BCH",
      "depositNetwork": "bitcoincash",
      "depositAmount": "1.26662368",
      "settleCoin": "BTC",
      "settleNetwork": "bitcoin",
      "settleAmount": "0.00982187"
    },
    {
      "createdAt": "2023-10-17T06:40:56.819Z",
      "depositCoin": "ETH",
      "depositNetwork": "ethereum",
      "depositAmount": "0.1129051",
      "settleCoin": "SHIB",
      "settleNetwork": "ethereum",
      "settleAmount": "24319792.76339942"
    },
    {
      "createdAt": "2023-10-17T06:29:57.952Z",
      "depositCoin": "BTC",
      "depositNetwork": "lightning",
      "depositAmount": "0.00177454",
      "settleCoin": "TRX",
      "settleNetwork": "tron",
      "settleAmount": "551.217565"
    },
    {
      "createdAt": "2023-10-17T06:30:07.816Z",
      "depositCoin": "MATIC",
      "depositNetwork": "polygon",
      "depositAmount": "18.426196760034415",
      "settleCoin": "ETH",
      "settleNetwork": "ethereum",
      "settleAmount": "0.00592032"
    },
    {
      "createdAt": "2023-10-17T06:25:30.119Z",
      "depositCoin": "ETH",
      "depositNetwork": "ethereum",
      "depositAmount": "0.0056751",
      "settleCoin": "USDT",
      "settleNetwork": "ethereum",
      "settleAmount": "8.072691"
    },
    {
      "createdAt": "2023-10-17T06:25:29.831Z",
      "depositCoin": "SOL",
      "depositNetwork": "solana",
      "depositAmount": "0.32",
      "settleCoin": "APT",
      "settleNetwork": "aptos",
      "settleAmount": "1.48814278"
    },
    {
      "createdAt": "2023-10-17T06:21:52.261Z",
      "depositCoin": "BTC",
      "depositNetwork": "bitcoin",
      "depositAmount": "0.025",
      "settleCoin": "BCH",
      "settleNetwork": "bitcoincash",
      "settleAmount": "3.01195714"
    },
    {
      "createdAt": "2023-10-17T06:16:55.375Z",
      "depositCoin": "BTC",
      "depositNetwork": "bitcoin",
      "depositAmount": "0.0003552",
      "settleCoin": "ETH",
      "settleNetwork": "ethereum",
      "settleAmount": "0.00601536"
    }
  ]`}
  language={"json"}
></ResponseSamples>
        </div>

  </div>
</div>

HTTP Status Codes:
Default:
- default

# XAI stats

<h1 className={"openapi__heading"}>XAI stats</h1>

Returns the statistics about XAI coin, including it's current USD price.

    <div>OK</div>
    <div>
        <TabItem
          label={"application/json"}
          value={"application/json"}
          className={"openapi-tabs__tab-item"}
        >
            <TabItem
              label={"Schema"}
              value={"Schema"}
              className={"openapi-tabs__tab-item"}
            >
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={false}
                    name={"totalSupply"}
                    required={true}
                    schemaName={"number"}
                    schema={{ type: "number" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"circulatingSupply"}
                    required={true}
                    schemaName={"number"}
                    schema={{ type: "number" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"numberOfStakers"}
                    required={true}
                    schemaName={"number"}
                    schema={{ type: "number" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"latestAnnualPercentageYield"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"latestDistributedXai"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"totalStaked"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"averageAnnualPercentageYield"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"totalValueLocked"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"totalValueLockedRatio"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"xaiPriceUsd"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"svxaiPriceUsd"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"svxaiPriceXai"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "totalSupply": 210000000,
    "circulatingSupply": 126684969.93,
    "numberOfStakers": 0,
    "latestAnnualPercentageYield": "11.66",
    "latestDistributedXai": "33862.05",
    "totalStaked": "112136431.9",
    "averageAnnualPercentageYield": "22.95",
    "totalValueLocked": "8467726.7618521220990927948892813218",
    "totalValueLockedRatio": "1.12973961970448057097",
    "xaiPriceUsd": "0.07551271802",
    "svxaiPriceUsd": "0.094023361214",
    "svxaiPriceXai": "1.245132789276"
}`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
2xx Success:
- 200: OK

# Account

<h1 className={"openapi__heading"}>Account</h1>

Returns the data related to an account. To retrieve it, send the account secret in the `x-sideshift-secret` header.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>

    <div>OK</div>
    <div>
        <TabItem
          label={"application/json"}
          value={"application/json"}
          className={"openapi-tabs__tab-item"}
        >
            <TabItem
              label={"Schema"}
              value={"Schema"}
              className={"openapi-tabs__tab-item"}
            >
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={false}
                    name={"id"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"lifetimeStakingRewards"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"unstaking"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"staked"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"available"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"totalBalance"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "id": "YQMi62XMb",
    "lifetimeStakingRewards": "89190.63",
    "unstaking": "0",
    "staked": "1079394.1646",
    "available": "43034.51598382",
    "totalBalance": "1122428.68058382"
}`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Unauthorized</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Account required. Add x-sideshift-secret header"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Account not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Checkout

<Heading
  as={"h1"}
  className={"openapi__heading"}
  children={"Checkout"}
></Heading>

Returns the data of a checkout created using [`/v2/checkout`](/endpoints/v2/createcheckout) endpoint.

<Heading
  id={"request"}
  as={"h2"}
  className={"openapi-tabs__heading"}
  children={"Request"}
></Heading>

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Path Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "checkoutId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "",
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<div>
  <div>
        <div>OK</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"id"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                          description: "unique checkout ID",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"settleCoin"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"settleNetwork"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"settleAddress"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"settleMemo"}
                        required={false}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                          description: "for coins where network is included in networksWithMemo array",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"updatedAt"}
                        required={true}
                        schemaName={"date-time"}
                        schema={{
                          type: "string",
                          format: "date-time",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"createdAt"}
                        required={true}
                        schemaName={"date-time"}
                        schema={{
                          type: "string",
                          format: "date-time",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"affiliateId"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"successUrl"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={false}
                        name={"cancelUrl"}
                        required={true}
                        schemaName={"string"}
                        schema={{
                          type: "string",
                        }}
                      />

                      <SchemaItem
                        collapsible={true}
                        name={"orders"}
                        required={true}
                        schemaName={"array"}
                        schema={{
                          type: "array",
                          items: { type: "object" },
                        }}
                      >
                        <div data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>orders</strong>
                            <span style={{ opacity: "0.6" }}> array</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"id"}
                              required={true}
                              schemaName={"string"}
                              schema={{
                                type: "string",
                                description: "shift/order ID",
                              }}
                            />
                            <SchemaItem
                              collapsible={true}
                              name={"deposits"}
                              required={true}
                              schemaName={"array"}
                              schema={{
                                type: "array",
                                items: { type: "object" },
                              }}
                            >
                              <div data-collapsed={true} open={true}>
                                <summary style={{ textAlign: "left" }}>
                                  <strong>deposits</strong>
                                  <span style={{ opacity: "0.6" }}> array</span>
                                </summary>
                                <ul style={{ marginLeft: "1rem" }}>
                                  <SchemaItem
                                    collapsible={false}
                                    name={"depositHash"}
                                    required={false}
                                    schemaName={"string"}
                                    schema={{
                                    type: "string",
                                    }}
                                  />
                                  <SchemaItem
                                    collapsible={false}
                                    name={"settleHash"}
                                    required={false}
                                    schemaName={"string"}
                                    schema={{
                                    type: "string",
                                    }}
                                  />
                                </ul>
                              </div>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={
                      '{\n  "id": "fdebd5b5-357a-4cfd-b60b-076ae7c62d77",\n  "settleCoin": "BTC",\n  "settleNetwork": "mainnet",\n  "settleAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",\n  "settleAmount": "0.001",\n  "updatedAt": "2024-01-01T00:55:33.222000000Z",\n  "createdAt": "2024-01-01T00:55:33.222000000Z",\n  "affiliateId": "YOUR_ACCOUNT_ID",\n  "successUrl": "https://yourwebshop.com/success",\n  "cancelUrl": "https://yourwebshop.com/cancel",\n  "orders": [\n    {\n      "id": "d2a473f82603e9ccfbb8",\n      "deposits": [\n        {\n          "depositHash": "0x73b277e5df00f57a03cbe6ca318ca79e66398a2f3f9ff414966a7ec281e903c8",\n          "settleHash": "055f7d293ebd4546b446da0eb920c5c427d72647ae58262e53b8a8a574544dd9"\n        }\n      ]\n    }\n  ]\n}'
                    }
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Not Found</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Checkout not found"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
2xx Success:
- 200: Checkout details retrieved successfully.

4xx Client Errors:
- 400: Invalid request.
- 404: Checkout not found.

5xx Server Errors:
- 500: Internal server error.

# Request quote

<h1 className={"openapi__heading"}>Request quote</h1>

For fixed rate shifts, a quote should be requested first.

A quote can be requested for either a `depositAmount` or a `settleAmount`.

When defining non-native tokens like AXS and USDT for `depositCoin` and/or `settleCoin`, the `depositNetwork` and `settleNetwork` fields must also be specified. This also applies to native tokens like ETH that supports multiple networks.

`commissionRate` optional parameter can be used to adjust rates for your users. The default commission rate is 0.5%. Rates below the default offer better rates by reducing affiliate commission, while rates above the default are passed on to the user. The maximum commission rate is 2%.

:::info
Use the same `commissionRate` in the `/v2/pair` and `/v2/pairs` endpoints as when creating the shift/quotes to get an accurate rate information. See [Monetization](/api-intro/monetization) for detailed examples of how commission rates affect rates.
:::

If the API requests are sent from the integration’s own server, the `x-user-ip` header must be set to the end-user IP address; otherwise, the requests will be blocked. See [Permissions](/api-intro/permissions).

After the quote request, a fixed rate shift should be created using the \`id\` returned by the `/v2/quotes` endpoint.

A quote expires after **15 minutes**.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-user-ip",
          in: "header",
          description: "end-user IP address for integrations API requests",
          required: false,
          style: "simple",
          schema: { type: "string", example: "1.2.3.4" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
    <details
      style={{}}
      className={"openapi-markdown__details mime"}
      data-collapsed={false}
      open={true}
    >
      <summary style={{}} className={"openapi-markdown__details-summary-mime"}>
        <h3 className={"openapi-markdown__details-summary-header-body"}>
          Body
        </h3>
      </summary>
      <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
      <ul style={{ marginLeft: "1rem" }}>
        <SchemaItem
          collapsible={false}
          name={"depositCoin"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"depositNetwork"}
          required={false}
          schemaName={"string"}
          qualifierMessage={
            "required for non-native tokens (e.g. AXS, USDT) and multi-network native tokens (e.g. ETH)."
          }
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleCoin"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleNetwork"}
          required={false}
          schemaName={"string"}
          qualifierMessage={
            "required for non-native tokens (e.g. AXS, USDT) and multi-network native tokens (e.g. ETH)."
          }
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"depositAmount"}
          required={true}
          schemaName={"string"}
          qualifierMessage={"if null, settleAmount is required"}
          schema={{ type: "string", nullable: true }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleAmount"}
          required={true}
          schemaName={"string"}
          qualifierMessage={"if null, depositAmount is required"}
          schema={{ type: "string", nullable: true }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"affiliateId"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
      </ul>
    </details>

    <div>OK</div>
    <div>
        <TabItem
          label={"application/json"}
          value={"application/json"}
          className={"openapi-tabs__tab-item"}
        >
            <TabItem
              label={"Schema"}
              value={"Schema"}
              className={"openapi-tabs__tab-item"}
            >
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={false}
                    name={"id"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"createdAt"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string", format: "date-time" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositCoin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleCoin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositNetwork"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleNetwork"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"expiresAt"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string", format: "date-time" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositAmount"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleAmount"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"rate"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"affiliateId"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "id": "c1d79240-0117-4867-afed-9cc4605c53aa",
    "createdAt": "2023-10-17T03:33:21.230Z",
    "depositCoin": "ETH",
    "settleCoin": "ETH",
    "depositNetwork": "arbitrum",
    "settleNetwork": "ethereum",
    "expiresAt": "2023-10-17T03:48:21.230Z",
    "depositAmount": "0.14364577",
    "settleAmount": "0.14078454",
    "rate": "0.980081348723",
    "affiliateId": "YQMi62XMb"
}`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Bad Request</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Bad request"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Bad request: Invalid parameters: depositCoin"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Method ETH/bitcoin not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid \"affiliateId\""
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Commission rate cannot be higher than 0.02"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid parameters: commissionRate: Must be a positive number"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Unauthorized</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Do not use the example affiliateId and x-sideshift-secret header from the documentation. Use your own from https://sideshift.ai/account"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Forbidden</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Access denied. See https://sideshift.ai/access-denied"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Account not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Internal Server Error</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid coin"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid network"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Amount too low. Settle amount is less than or equals to 0"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Amount too low. Minimum deposit amount: 0.00010663."
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Amount too high. Maximum deposit amount: 0.5117083972"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Cannot specify both depositAmount and settleAmount"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Create fixed shift

<h1 className={"openapi__heading"}>Create fixed shift</h1>

After requesting a quote, use the `quoteId` to create a fixed rate shift with the quote. The `affiliateId` must match the one used to request the quote.

For fixed rate shifts, a deposit of exactly the amount of `depositAmount` must be made before the `expiresAt` timestamp, otherwise the deposit will be refunded.

For shifts that return a `depositMemo`, the deposit transaction must include this memo, otherwise the deposit might be lost.

For shifts settling in coins where the network is included in the `networksWithMemo` array in the [`/v2/coins`](/endpoints/v2/coins) endpoint, API users are allowed to specify a `settleMemo` field, for example `"settleMemo": "123343245"`.

`x-sideshift-secret` header is required. It can be obtained from the [account page](https://sideshift.ai/account) under the account secret.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

`refundAddress` and `refundMemo` are optional. If they aren't defined, the user is prompted to enter a refund address manually on the SideShift.ai order page if the shift needs to be refunded.

If the API requests are sent from the integration's own server, the `x-user-ip` header must be set to the end-user IP address; otherwise, the requests will be blocked. See [Permissions](/api-intro/permissions).

`averageShiftSeconds` represents the average time in seconds it takes for SideShift to process a shift once the user's deposit is **confirmed** on the blockchain.

`externalId` is an optional field that can be used to pass an integration's own ID to the API.

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-user-ip",
          in: "header",
          description: "end-user IP address for integrations API requests",
          required: false,
          style: "simple",
          schema: { type: "string", example: "1.2.3.4" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
    <details
      style={{}}
      className={"openapi-markdown__details mime"}
      data-collapsed={false}
      open={true}
    >
      <summary style={{}} className={"openapi-markdown__details-summary-mime"}>
        <h3 className={"openapi-markdown__details-summary-header-body"}>
          Body
        </h3>
      </summary>
      <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
      <ul style={{ marginLeft: "1rem" }}>
        <SchemaItem
          collapsible={false}
          name={"settleAddress"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleMemo"}
          required={false}
          schemaName={"string"}
          qualifierMessage={
            "for coins where network is included in networksWithMemo array"
          }
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"affiliateId"}
          required={true}
          schemaName={"string"}
          qualifierMessage={"affiliateId used to request the quote"}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"quoteId"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"refundAddress"}
          required={false}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"refundMemo"}
          required={false}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"externalId"}
          required={false}
          schemaName={"string"}
          qualifierMessage={"integration's own ID"}
          schema={{ type: "string" }}
        ></SchemaItem>
      </ul>
    </details>

    <div>OK</div>
    <div>
        <TabItem
          label={"application/json"}
          value={"application/json"}
          className={"openapi-tabs__tab-item"}
        >
            <TabItem
              label={"Schema"}
              value={"Schema"}
              className={"openapi-tabs__tab-item"}
            >
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={false}
                    name={"id"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"createdAt"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositCoin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleCoin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositNetwork"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleNetwork"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositAddress"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositMemo"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleAddress"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleMemo"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositMin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositMax"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"refundAddress"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"refundMemo"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"type"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"quoteId"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositAmount"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleAmount"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"expiresAt"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"status"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"averageShiftSeconds"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"externalId"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"rate"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "id": "8c9ba87d02a801a2f254",
    "createdAt": "2023-10-17T04:32:00.855Z",
    "depositCoin": "ETH",
    "settleCoin": "ETH",
    "depositNetwork": "arbitrum",
    "settleNetwork": "ethereum",
    "depositAddress": "0xa20916158958168ff5668bF90C3753EcD333b0A2",
    "settleAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "depositMin": "1",
    "depositMax": "1",
    "refundAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "type": "fixed",
    "quoteId": "75cb6e56-a81b-45a9-8ab4-1f95bf92246g",
    "depositAmount": "1",
    "settleAmount": "0.98088036",
    "expiresAt": "2023-10-17T04:36:47.050Z",
    "status": "waiting",
    "averageShiftSeconds": "44.526343",
    "externalId": "integration-1234"
    "rate": "0.98088036"
}`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Bad Request</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Bad request: Invalid parameters: quoteId"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Quote has different affiliateId than input."
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid receiving address"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid refundDestination"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid externalId"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Unauthorized</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Do not use the example affiliateId and x-sideshift-secret header from the documentation. Use your own from https://sideshift.ai/account"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Forbidden</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Access denied. See https://sideshift.ai/access-denied"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Account not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Internal Server Error</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Quote has already been accepted. Request a new quote.",
        "orderId": "8c9ba87d02a801a2f254"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Internal Server Error"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Create variable shift

<h1 className={"openapi__heading"}>Create variable shift</h1>

For variable rate shifts, the settlement rate is determined when the user's deposit is received.

For shifts that return a `depositMemo`, the deposit transaction must include this memo, otherwise the deposit might be lost.

For shifts settling in coins where the network is included in the `networksWithMemo` array in the [`/v2/coins`](/endpoints/v2/coins), integrations can specify a `settleMemo` field, for example `"settleMemo": "123343245"`.

When defining non-native tokens like AXS and USDT for `depositCoin` and/or `settleCoin`, the `depositNetwork` and `settleNetwork` fields must also be specified. This also applies to native tokens like ETH that supports multiple networks.

`x-sideshift-secret` header is required. It can be obtained from the [account page](https://sideshift.ai/account) under the account secret.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

`refundAddress` and `refundMemo`are optional, if not defined, user will be prompted to enter a refund address manually on the SideShift.ai order page if the shift needs to be refunded.

`commissionRate` optional parameter can be used to adjust rates for your users. The default commission rate is 0.5%. Rates below the default offer better rates by reducing affiliate commission, while rates above the default are passed on to the user. The maximum commission rate is 2%.

:::info
Use the same `commissionRate` in the `/v2/pair` and `/v2/pairs` endpoints as when creating the shift/quotes to get an accurate rate information. See [Monetization](/api-intro/monetization) for detailed examples of how commission rates affect rates.
:::

If the API requests are sent from the integration’s own server, the `x-user-ip` header must be set to the end-user IP address; otherwise, the requests will be blocked. See [Permissions](/api-intro/permissions).

`averageShiftSeconds` represents the average time in seconds it takes for SideShift to process a shift once the user’s deposit is **confirmed** on the blockchain.

`settleCoinNetworkFee` represents the estimated sum of [network fees](/api-intro/network-fees) charged for the shift denominated in settle coin.

`networkFeeUsd` represents the estimated sum of [network fees](/api-intro/network-fees) charged for the shift denominated in USD.

`externalId` is an optional field that can be used to pass an integration's own ID to the API.

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-user-ip",
          in: "header",
          description: "end-user IP address for integrations API requests",
          required: false,
          style: "simple",
          schema: { type: "string", example: "1.2.3.4" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
    <details
      style={{}}
      className={"openapi-markdown__details mime"}
      data-collapsed={false}
      open={true}
    >
      <summary style={{}} className={"openapi-markdown__details-summary-mime"}>
        <h3 className={"openapi-markdown__details-summary-header-body"}>
          Body
        </h3>
      </summary>
      <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
      <ul style={{ marginLeft: "1rem" }}>
        <SchemaItem
          collapsible={false}
          name={"settleAddress"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleMemo"}
          required={false}
          schemaName={"string"}
          qualifierMessage={
            "for coins where network is included in networksWithMemo array"
          }
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"refundAddress"}
          required={false}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"refundMemo"}
          required={false}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"depositCoin"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleCoin"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"depositNetwork"}
          required={false}
          schemaName={"string"}
          qualifierMessage={
            "required for non-native tokens (e.g. AXS, USDT) and multi-network native tokens (e.g. ETH)."
          }
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleNetwork"}
          required={false}
          schemaName={"string"}
          qualifierMessage={
            "required for non-native tokens (e.g. AXS, USDT) and multi-network native tokens (e.g. ETH)."
          }
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"affiliateId"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"externalId"}
          required={false}
          schemaName={"string"}
          qualifierMessage={"integration's own ID"}
          schema={{ type: "string" }}
        ></SchemaItem>
      </ul>
    </details>

    <div>OK</div>
    <div>
        <TabItem
          label={"application/json"}
          value={"application/json"}
          className={"openapi-tabs__tab-item"}
        >
            <TabItem
              label={"Schema"}
              value={"Schema"}
              className={"openapi-tabs__tab-item"}
            >
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={false}
                    name={"id"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"createdAt"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositCoin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleCoin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositNetwork"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleNetwork"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositAddress"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositMemo"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleAddress"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleMemo"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositMin"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"depositMax"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"refundAddress"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"refundMemo"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"type"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"expiresAt"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"status"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"averageShiftSeconds"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"externalId"}
                    required={false}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"settleCoinNetworkFee"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                  <SchemaItem
                    collapsible={false}
                    name={"networkFeeUsd"}
                    required={true}
                    schemaName={"string"}
                    schema={{ type: "string" }}
                  ></SchemaItem>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "id": "71449070046fcfee010z",
    "createdAt": "2024-01-31T01:04:14.978Z",
    "depositCoin": "ETH",
    "settleCoin": "USDT",
    "depositNetwork": "ethereum",
    "settleNetwork": "ethereum",
    "depositAddress": "0x44642E63D5a50e872Df2d162d02f9A259b247350",
    "settleAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "depositMin": "0.021551429911",
    "depositMax": "17.06368164",
    "refundAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "type": "variable",
    "expiresAt": "2024-02-07T01:04:14.978Z",
    "status": "waiting",
    "averageShiftSeconds": "45.830392",
    "externalId": "integration-1234",
    "settleCoinNetworkFee": "4.210057",
    "networkFeeUsd": "4.21"
}`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Bad Request</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Bad request: Invalid parameters: settleAddress"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Unknown affiliateId"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid externalId"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid receiving address"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid refundDestination"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "This refund address belongs to SideShift.ai"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Commission rate cannot be higher than 0.02"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid parameters: commissionRate: Must be a positive number"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Unauthorized</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Do not use the example affiliateId and x-sideshift-secret header from the documentation. Use your own from https://sideshift.ai/account"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Forbidden</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Access denied. See https://sideshift.ai/access-denied"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Account not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Internal Server Error</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid coin"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid network"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Memo is not supported for this deposit coin"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Set refund address

<h1 className={"openapi__heading"}>Set refund address</h1>

<MethodEndpoint
  method={"post"}
  path={"/shifts/{shiftId}/set-refund-address"}
></MethodEndpoint>

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

## Request

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Path Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "shiftId",
          in: "path",
          description: "",
          required: true,
          style: "simple",
          schema: { type: "string" },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
    <details
      style={{}}
      className={"openapi-markdown__details mime"}
      data-collapsed={false}
      open={true}
    >
      <summary style={{}} className={"openapi-markdown__details-summary-mime"}>
        <h3 className={"openapi-markdown__details-summary-header-body"}>
          Body
        </h3>
      </summary>
      <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
      <ul style={{ marginLeft: "1rem" }}>
        <SchemaItem
          collapsible={false}
          name={"address"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{ type: "string" }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"memo"}
          required={false}
          schemaName={"string"}
          qualifierMessage={"for address that requires memo"}
          schema={{ type: "string" }}
        ></SchemaItem>
      </ul>
    </details>

    <div>OK</div>
    <div>
        <TabItem
          label={"application/json"}
          value={"application/json"}
          className={"openapi-tabs__tab-item"}
        >
            <TabItem
              label={"Schema"}
              value={"Schema"}
              className={"openapi-tabs__tab-item"}
            >
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={false}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Fixed Shift</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  {[
                    { name: "id", type: "string" },
                    { name: "createdAt", type: "string" },
                    { name: "depositCoin", type: "string" },
                    { name: "settleCoin", type: "string" },
                    { name: "depositNetwork", type: "string" },
                    { name: "settleNetwork", type: "string" },
                    { name: "depositAddress", type: "string" },
                    { name: "depositMemo", type: "string", optional: true },
                    { name: "settleAddress", type: "string" },
                    { name: "settleMemo", type: "string", optional: true },
                    { name: "depositMin", type: "string" },
                    { name: "depositMax", type: "string" },
                    { name: "refundAddress", type: "string" },
                    { name: "refundMemo", type: "string", optional: true },
                    { name: "type", type: "string" },
                    { name: "quoteId", type: "string" },
                    { name: "depositAmount", type: "string" },
                    { name: "settleAmount", type: "string" },
                    { name: "expiresAt", type: "string" },
                    { name: "status", type: "string" },
                    { name: "averageShiftSeconds", type: "string" },
                    { name: "rate", type: "string" },
                  ].map((item) => (
                    <SchemaItem
                      collapsible={false}
                      name={item.name}
                      required={!item.optional}
                      schemaName={item.type}
                      schema={{ type: item.type }}
                    />
                  ))}
                </ul>
              </details>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={false}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Variable Shift</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  {[
                    { name: "id", type: "string" },
                    { name: "createdAt", type: "string" },
                    { name: "depositCoin", type: "string" },
                    { name: "settleCoin", type: "string" },
                    { name: "depositNetwork", type: "string" },
                    { name: "settleNetwork", type: "string" },
                    { name: "depositAddress", type: "string" },
                    { name: "depositMemo", type: "string", optional: true },
                    { name: "settleAddress", type: "string" },
                    { name: "settleMemo", type: "string", optional: true },
                    { name: "depositMin", type: "string" },
                    { name: "depositMax", type: "string" },
                    { name: "refundAddress", type: "string" },
                    { name: "refundMemo", type: "string", optional: true },
                    { name: "type", type: "string" },
                    { name: "expiresAt", type: "string" },
                    { name: "status", type: "string" },
                    { name: "averageShiftSeconds", type: "string" },
                  ].map((item) => (
                    <SchemaItem
                      collapsible={false}
                      name={item.name}
                      required={!item.optional}
                      schemaName={item.type}
                      schema={{ type: item.type }}
                    />
                  ))}
                </ul>
              </details>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={false}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Fixed Shift</strong>
                </summary>
                <ResponseSamples
                  responseExample={`{
    "id": "f78df8663d4c4d5913b9",
    "createdAt": "2023-10-17T05:52:43.947Z",
    "depositCoin": "ETH",
    "settleCoin": "ETH",
    "depositNetwork": "arbitrum",
    "settleNetwork": "ethereum",
    "depositAddress": "0x5348DaBDBd6Ac9d2e0507447A0D2246Bb7febb0f",
    "settleAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "depositMin": "1",
    "depositMax": "1",
    "refundAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "type": "fixed",
    "quoteId": "a954ac89-d861-41f0-a082-751a80b54dff",
    "depositAmount": "1",
    "settleAmount": "0.98089288",
    "expiresAt": "2023-10-17T06:07:33.915Z",
    "status": "waiting",
    "averageShiftSeconds": "44.526343",
    "rate": "0.98089288"
}`}
                  language={"json"}
                ></ResponseSamples>
              </details>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={false}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Variable Shift</strong>
                </summary>
                <ResponseSamples
                  responseExample={`{
    "id": "6f7d6442bbcea03b3fs6",
    "createdAt": "2023-10-17T05:36:46.797Z",
    "depositCoin": "BTC",
    "settleCoin": "ETH",
    "depositNetwork": "bitcoin",
    "settleNetwork": "ethereum",
    "depositAddress": "37SELkizWCbbRgpDe5ozZDP6TvvA91a6WB",
    "settleAddress": "0xde2642b2120fd3011fe9659688f76e9E4676F472",
    "depositMin": "0.00010655",
    "depositMax": "1.42067752",
    "refundAddress": "bc1qe6duc4mztzh9jvjnqcalf65hr9579vel8mv9ya",
    "type": "variable",
    "expiresAt": "2023-10-24T05:36:46.796Z",
    "status": "waiting",
    "averageShiftSeconds": "46.880018"
}`}
                  language={"json"}
                ></ResponseSamples>
              </details>
    </div>
    <div>Bad Request</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Invalid refund address"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Bad request"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Not Found</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
    "error": {
        "message": "Account not found"
    }
  }`}
                language={"json"}
              ></ResponseSamples>
    </div>
    <div>Internal Server Error</div>
    <div>
              <details
                style={{}}
                className={"openapi-markdown__details response"}
                data-collapsed={false}
                open={true}
              >
                <summary
                  style={{}}
                  className={"openapi-markdown__details-summary-response"}
                >
                  <strong>Schema</strong>
                </summary>
                <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
                <ul style={{ marginLeft: "1rem" }}>
                  <SchemaItem
                    collapsible={true}
                    name={"error"}
                    required={true}
                    schemaName={"object"}
                    schema={{ type: "object" }}
                  >
                    <div style={{}} data-collapsed={true} open={true}>
                      <summary style={{ textAlign: "left" }}>
                        <strong>error</strong>
                        <span style={{ opacity: "0.6" }}> object</span>
                      </summary>
                      <ul style={{ marginLeft: "1rem" }}>
                        <SchemaItem
                          collapsible={false}
                          name={"message"}
                          required={true}
                          schemaName={"string"}
                          schema={{ type: "string" }}
                        ></SchemaItem>
                      </ul>
                    </div>
                </ul>
              </details>
              <ResponseSamples
                responseExample={`{
  "error": {
      "message": "Internal Server Error"
  }
}`}
                language={"json"}
              ></ResponseSamples>
    </div>

HTTP Status Codes:
Default:
- default

# Cancel order

<h1 className={"openapi__heading"}>Cancel order</h1>

Cancels an existing order after 5 minutes by expiring it.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

<Heading
  id={"request"}
  as={"h2"}
  className={"openapi-tabs__heading"}
  children={"Request"}
></Heading>

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"d1977b51a7ab4c8dc388"',
          },
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
    <details
      style={{}}
      className={"openapi-markdown__details mime"}
      data-collapsed={false}
      open={true}
    >
      <summary style={{}} className={"openapi-markdown__details-summary-mime"}>
        <h3 className={"openapi-markdown__details-summary-header-body"}>
          Body
        </h3>
        <strong className={"openapi-schema__required"}>required</strong>
      </summary>
      <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
      <ul style={{ marginLeft: "1rem" }}>
        <SchemaItem
          collapsible={false}
          name={"orderId"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "The unique identifier of the order to cancel",
            example: "d1977b51a7ab4c8dc388",
          }}
        ></SchemaItem>
      </ul>
    </details>
<div>
  <div>
        <div>Order successfully cancelled</div>
        <div></div>
        <div>Bad Request</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Order already expired"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Orders can only be cancelled after 5 minutes."
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Not Found</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Account not found"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Internal Server Error</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Internal Server Error"
    }
  }`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
2xx Success:
- 204: Order successfully cancelled

4xx Client Errors:
- 400: Bad request - invalid request body
- 403: Forbidden - authentication required
- 404: Order not found

5xx Server Errors:
- 500: Internal server error

# Create checkout

<Heading
  as={"h1"}
  className={"openapi__heading"}
  children={"Create checkout"}
></Heading>

Creates a new checkout that can be used to facilitate payment for merchants.

See the [SideShift Pay](/sideshift-pay-integration) integration guide for end-to-end instructions, webhook setup, and sample code.

:::warning
`x-sideshift-secret` is your account's private key. Never share it with anyone as it grants full access to your account and should be kept confidential.
:::

<Heading
  id={"request"}
  as={"h2"}
  className={"openapi-tabs__heading"}
  children={"Request"}
></Heading>

<details
  style={{ marginBottom: "1rem" }}
  className={"openapi-markdown__details"}
  data-collapsed={false}
  open={true}
>
  <summary style={{}}>
    <h3 className={"openapi-markdown__details-summary-header-params"}>
      Header Parameters
    </h3>
  </summary>
  <div>
    <ul>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-sideshift-secret",
          in: "header",
          description: "",
          required: true,
          style: "simple",
          schema: {
            type: "string",
            example: '"YOUR_ACCOUNT_SECRET"',
          },
        }}
      ></ParamsItem>
      <ParamsItem
        className={"paramsItem"}
        param={{
          name: "x-user-ip",
          in: "header",
          required: true,
          schema: { type: "string" },
          description: "end-user IP address for integrations API requests",
        }}
      ></ParamsItem>
    </ul>
  </div>
</details>
    <details
      style={{}}
      className={"openapi-markdown__details mime"}
      data-collapsed={false}
      open={true}
    >
      <summary style={{}} className={"openapi-markdown__details-summary-mime"}>
        <h3 className={"openapi-markdown__details-summary-header-body"}>
          Body
        </h3>
      </summary>
      <div style={{ textAlign: "left", marginLeft: "1rem" }}></div>
      <ul style={{ marginLeft: "1rem" }}>
        <SchemaItem
          collapsible={false}
          name={"settleCoin"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleNetwork"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleAmount"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleAddress"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"settleMemo"}
          required={false}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description:
              "for coins where network is included in networksWithMemo array",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"affiliateId"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"successUrl"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
        <SchemaItem
          collapsible={false}
          name={"cancelUrl"}
          required={true}
          schemaName={"string"}
          qualifierMessage={undefined}
          schema={{
            type: "string",
            description: "",
          }}
        ></SchemaItem>
      </ul>
    </details>
<div>
  <div>
        <div>OK</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={false}
                        name={"id"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "unique checkout ID",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleCoin"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleNetwork"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAddress"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleMemo"}
                        required={false}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"settleAmount"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"updatedAt"}
                        required={true}
                        schemaName={"date-time"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          format: "date-time",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"createdAt"}
                        required={true}
                        schemaName={"date-time"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          format: "date-time",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"affiliateId"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"successUrl"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                      <SchemaItem
                        collapsible={false}
                        name={"cancelUrl"}
                        required={true}
                        schemaName={"string"}
                        qualifierMessage={undefined}
                        schema={{
                          type: "string",
                          description: "",
                        }}
                      ></SchemaItem>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={
                      '{\n  "id": "32e676d3-56c2-4c06-a0cd-551a9d3db89a",\n  "settleCoin": "XRP",\n  "settleNetwork": "ripple",\n  "settleAddress": "rsTAYkk7VQfBdD5btt2WzXYphER6F2BTuN",\n  "settleMemo": "109",\n  "settleAmount": "15",\n  "updatedAt": "2024-09-26T01:52:56.885000000Z",\n  "createdAt": "2024-09-26T01:52:56.885000000Z",\n  "affiliateId": "YQMi62XMb"\n  "successUrl": "https://example.com/success",\n  "cancelUrl": "https://example.com/cancel"\n}'
                    }
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Bad request</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Method ETH/bitcoin not found"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Invalid \"affiliateId\""
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Settle amount too high"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Settle amount too low"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Invalid settleAmount"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Invalid url format"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Unauthorized</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Do not use the example affiliateId and x-sideshift-secret header from the documentation. Use your own from https://sideshift.ai/account"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Forbidden</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Access denied. See https://sideshift.ai/access-denied"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Not Found</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Account not found"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
        <div>Internal Server Error</div>
        <div>
                  <details
                    style={{}}
                    className={"openapi-markdown__details response"}
                    data-collapsed={false}
                    open={true}
                  >
                    <summary
                      style={{}}
                      className={"openapi-markdown__details-summary-response"}
                    >
                      <strong>Schema</strong>
                    </summary>
                    <div
                      style={{ textAlign: "left", marginLeft: "1rem" }}
                    ></div>
                    <ul style={{ marginLeft: "1rem" }}>
                      <SchemaItem
                        collapsible={true}
                        name={"error"}
                        required={true}
                        schemaName={"object"}
                        schema={{ type: "object" }}
                      >
                        <div style={{}} data-collapsed={true} open={true}>
                          <summary style={{ textAlign: "left" }}>
                            <strong>error</strong>
                            <span style={{ opacity: "0.6" }}> object</span>
                          </summary>
                          <ul style={{ marginLeft: "1rem" }}>
                            <SchemaItem
                              collapsible={false}
                              name={"message"}
                              required={true}
                              schemaName={"string"}
                              schema={{ type: "string" }}
                            ></SchemaItem>
                          </ul>
                        </div>
                    </ul>
                  </details>
                  <ResponseSamples
                    responseExample={`{
    "error": {
        "message": "Invalid coin"
    }
}`}
                    language={"json"}
                  ></ResponseSamples>
        </div>
  </div>
</div>

HTTP Status Codes:
2xx Success:
- 201: Checkout created successfully.

4xx Client Errors:
- 400: Bad request.
- 401: Unauthorized.

5xx Server Errors:
- 500: Internal server error.

# Fetch facts

<h1 className={"openapi__heading"}>Fetch facts</h1>

Fetch facts, such as assets (currencies), deposit and settle methods

HTTP Status Codes:
2xx Success:
- 200: OK

# Fetch pair

<h1 className={"openapi__heading"}>Fetch pair</h1>

Fetch current rate/price, min deposit, max deposit and the estimated network fees in USD for a pair.

`commissionRate` optional query parameter can be used to offer a better rate for your users by reducing the affiliate commission paid by SideShift.

HTTP Status Codes:
2xx Success:
- 200: OK

# Get permissions

<h1 className={"openapi__heading"}>Get permissions</h1>

Retrieves the permissions of the caller, indicating what actions they're allowed to take on SideShift.ai

HTTP Status Codes:
2xx Success:
- 200: OK

# Fetch order

<h1 className={"openapi__heading"}>Fetch order</h1>

Fetch the order data, including the deposits.

`orderId` field is deprecated, use `id` instead.

`estimatedNetworkFeeUsd` represents the estimated amount in USD SideShift.ai will charge users for shifts involving BTC, ETH or ERC20 tokens. These fees will be deducted from the `settleAmount` the user receives. This field is only present in variable orders.

`networkFeePaidUsd` represents the amount in USD SideShift.ai charged the user for network fees. This field is only present in variable orders.

HTTP Status Codes:
2xx Success:
- 200: OK

# XAI stats

<h1 className={"openapi__heading"}>XAI stats</h1>

Use this endpoint to get statistics about XAI coin, including it's current USD price.

HTTP Status Codes:
2xx Success:
- 200: OK

# Recent deposits

<h1 className={"openapi__heading"}>Recent deposits</h1>

Returns the 10 most recent deposits. Use query param `limit` to change the number of recent deposits returned. `limit` must be between 1-100.

:::note
To preserve users privacy, shifts involving privacy coins will return `null` for both deposit and settle amount.
:::

HTTP Status Codes:
Default:
- default

# Account

<h1 className={"openapi__heading"}>Account</h1>

This endpoint returns data related to an account. In order to get the data, send the account secret in the `x-sideshift-secret` header.

HTTP Status Codes:
Default:
- default

# Fetch bulk pairs

<h1 className={"openapi__heading"}>Fetch bulk pairs</h1>

Fetch current rate/price, min deposit, max deposit and the estimated network fees in USD for every possible pair from the supplied `methodIds`.

`commissionRate` optional body parameter can be used to offer a better rate for your users by reducing the affiliate commission paid by SideShift.

HTTP Status Codes:
2xx Success:
- 200: OK

# Request a quote

<h1 className={"openapi__heading"}>Request a quote</h1>

For fixed rate orders, a quote should be requested first.

A quote can be requested for either a `depositAmount` or a `settleAmount`.

A quote expires after 15 minutes.

After the quote request, a fixed rate order should be requested using the `id` returned by the `/quotes` endpoint

`commissionRate` optional parameter can be used to offer a better rate for your users by reducing the affiliate commission paid by SideShift.

`x-user-ip:` If the API requests are sent from the integrations own server, the `x-user-ip` header must be set to the endusers IP address. Otherwise the requests will be blocked. See "Permissions" above.

HTTP Status Codes:
2xx Success:
- 201: Created

# Create order (fixed)

<h1 className={"openapi__heading"}>Create order (fixed)</h1>

After requesting a quote, use the `quoteId` to create a fixed rate order with the quote.

For fixed rate orders, a deposit of exactly the amount of `depositAmount` must be made before the `expiresAt` timestamp, otherwise the deposit will be refunded.

For coins that require `memo`, the API response will contain an additional `memo` field under `depositAddress`. The transaction must contain this `memo`, otherwise the deposit might be lost or rejected by the network.

For orders settling in coins that requires `memo`, API users are allowed to specify a `memo` field, for example `"memo": "123343245"`.

`x-sideshift-secret` header is required. It can be obtained from the [account page](https://sideshift.ai/account) under the account secret.

`affiliateId` should be defined to get a commission after the shift is complete. It can be obtained [here](https://sideshift.ai/account). Commissions are paid in SideShift.ai native XAI token, read more about XAI [here](https://help.sideshift.ai/en/collections/1793701-sideshift-token-xai-rewards).

`refundAddress` is optional, if not defined, user will be prompted to enter a refund address manually on the SideShift.ai order page if the order needs to be refunded

`orderId` field is deprecated, use `id` instead.

To create an order for XAI balance as settle method, the request should include the `sessionSecret`, `settleMethod` should be `saibal` and the `settleAddress` should be the `affiliateId`.

`x-user-ip:` If the API requests are sent from the integrations own server, the `x-user-ip` header must be set to the endusers IP address. Otherwise the requests will be blocked.

HTTP Status Codes:
2xx Success:
- 201: Created

# Create order (variable)

<Heading
  as={"h1"}
  className={"openapi__heading"}
  children={"Create order (variable)"}
></Heading>

For variable rate orders, the settlement rate is determined when the user's payment is received.

For coins that requires `memo`, the API response will contain an additional `memo` field under `depositAddress`. The transaction must contain this `memo`, otherwise the deposit might be lost.

For orders settling in coins that requires `memo`, API users are allowed to specify a `memo` field, for example `"memo": "123343245"`.

`x-sideshift-secret` header is required. It can be obtained from the [account page](https://sideshift.ai/account) under the account secret.

`affiliateId` should be defined to get a commission after the shift is complete. It can be obtained [here](https://sideshift.ai/account). Commissions are paid in SideShift.ai native XAI token, read more about XAI [here](https://help.sideshift.ai/en/collections/1793701-sideshift-token-xai-rewards).

`refundAddress` is optional, if not defined, user will be prompted to enter a refund address manually on the SideShift.ai order page if the order needs to be refunded

`orderId` field is deprecated, use id instead.

`estimatedNetworkFeeUsd` represents the estimated amount in USD SideShift.ai will charge users for shifts involving BTC, ETH or ERC20 tokens. These fees will be deducted from the `settleAmount` the user receives. This field is only present in variable orders.
`networkFeePaidUsd` represents the amount in USD SideShift.ai charged the user for network fees. This field is only present in variable orders.

`commissionRate` optional parameter can be used to offer a better rate for your users by reducing the affiliate commission paid by SideShift. If `commissionRate` is defined, `affiliateId` must be defined as well.

To create an order for XAI balance as settle method, the request should include the `sessionSecret`, `settleMethod` should be `saibal` and the `settleAddress` should be the `affiliateId`.

`x-user-ip`: If the API requests are sent from the integrations own server, the `x-user-ip` header must be set to the endusers IP address. Otherwise the requests will be blocked.

HTTP Status Codes:
2xx Success:
- 200: Order created successfully

4xx Client Errors:
- 400: Invalid request
- 401: Unauthorized

5xx Server Errors:
- 500: Internal server error

# Set refund address

<h1 className={"openapi__heading"}>Set refund address</h1>

Use this endpoint to add a refund address to an already existing order. Overwriting a refund address for orders that already have one can only be done through support for security reasons.

It is also possible to include a `memo` field for XLM, XRP, LUNA and UST refund addresses.

HTTP Status Codes:
2xx Success:
- 201: Created

# Fetch bulk orders

<h1 className={"openapi__heading"}>Fetch bulk orders</h1>

Fetch the order data for multiple orders, including the deposits.

`orderId` field is deprecated, use `id` instead.

`estimatedNetworkFeeUsd` represents the estimated amount in USD SideShift.ai will charge users for shifts involving BTC, ETH or ERC20 tokens. These fees will be deducted from the `settleAmount` the user receives. This field is only present in variable orders.

`networkFeePaidUsd` represents the amount in USD SideShift.ai charged the user for network fees. This field is only present in variable orders.

HTTP Status Codes:
2xx Success:
- 200: OK

# Troubleshoot Errors

| MESSAGE                                                                                                                                                                                  | STATUS                    | DESCRIPTION                                                                                                              | SOLUTION                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The x-user-ip header must be set to the end-user IP address                                                                                                                              | 400 Bad Request           | Invalid IP address                                                                                                       | Use a valid IP address in the `x-user-ip` header.                                                                                                                                                                                          |
| Invalid receiving address                                                                                                                                                                | 400 Bad Request           | settleAddress is invalid                                                                                                 | Use the correct `settleAddress` that aligns to the `settleCoin`. In case of `BTC` as `settleCoin`, use on-chain addresses only.                                                                                                            |
| Invalid refundDestination                                                                                                                                                                | 400 Bad Request           | refundAddress is invalid                                                                                                 | Use a valid `refundAddress` that aligns with the `depositCoin`. In case of `BTC` as `depositCoin`, use on-chain addresses only.                                                                                                            |
| This refund address belongs to SideShift.ai                                                                                                                                              | 400 Bad Request           | refundAddress being used is the example address or owned by SideShift.ai                                                 | Use a valid `refundAddress` that you own.                                                                                                                                                                                                  |
| This settle address belongs to SideShift.ai                                                                                                                                              | 400 Bad Request           | settleAddress being used is the example address or owned by SideShift.ai                                                 | Use a valid `settleAddress` that you own.                                                                                                                                                                                                  |
| Unknown affiliateId                                                                                                                                                                      | 400 Bad Request           | Invalid affiliateId was used in variable shift                                                                           | Use the `affiliateId` from your account found at [https://sideshift.ai/account](https://sideshift.ai/account).                                                                                                                             |
| Quote has different affiliateId than input                                                                                                                                               | 400 Bad Request           | AffiliateId used in fixed shift creation differs from the quote request                                                  | Use the same `affiliateId` for fixed shift creation as the one used in the quote request.                                                                                                                                                  |
| Quote has already expired. Request a new quote.                                                                                                                                          | 400 Bad Request           | quoteId is no longer valid for a fixed shift after expiration time                                                       | Request a new quote.                                                                                                                                                                                                                       |
| Invalid "affiliateId"                                                                                                                                                                    | 400 Bad Request           | Invalid affiliateId was used in the quote request                                                                        | Use the `affiliateId` from your account found at [https://sideshift.ai/account](https://sideshift.ai/account).                                                                                                                             |
| depositAmount must be greater than zero                                                                                                                                                  | 400 Bad Request           | depositAmount is 0 or less                                                                                               | Use a value greater than `0`.                                                                                                                                                                                                              |
| Method XX/XX not found                                                                                                                                                                   | 400 Bad Request           | Either the values for depositCoin and depositNetwork or settleCoin and settleNetwork do not belong to a supported method | Ensure that the coin supports the network being used, and vice versa. See [`/v2/coins`](/endpoints/v2/coins) for a list of supported cryptocurrencies and their respective networks.                                                       |
| Bad request: Invalid parameters: list of invalid parameters                                                                                                                              | 400 Bad Request           | Invalid parameter(s)                                                                                                     | Ensure all parameters are correctly formatted and valid                                                                                                                                                                                    |
| Do not use the example affiliateId and x-sideshift-secret header from the documentation. Use your own from [https://sideshift.ai/account](https://sideshift.ai/account)                  | 401 Unauthorized          | Example affiliateId or x-sideshift-secret was used                                                                       | Use your account's actual `affiliateId` and `x-sideshift-secret` from [https://sideshift.ai/account](https://sideshift.ai/account).                                                                                                        |
| You have too many open orders. Cancel some, use the existing ones, or wait. To receive a higher open order limit, message [https://t.me/sideshiftai_devs](https://t.me/sideshiftai_devs) | 403 Forbidden             | Executed too many order requests                                                                                         | Cancel some, use the existing ones, or wait. To receive a higher open order limit, message [https://t.me/sideshiftai_devs](https://t.me/sideshiftai_devs).                                                                                 |
| Access denied. See [https://sideshift.ai/access-denied](https://sideshift.ai/access-denied)                                                                                              | 403 Forbidden             | IP address being used in the x-user-ip header is not allowed                                                             | For a list of prohibited jurisdictions, please check out [https://help.sideshift.ai/en/articles/2874595-why-am-i-blocked-from-using-sideshift-ai](https://help.sideshift.ai/en/articles/2874595-why-am-i-blocked-from-using-sideshift-ai). |
| Account not found                                                                                                                                                                        | 404 Not Found             | x-sideshift-secret is invalid                                                                                            | Use your account's private key as the `x-sideshift-secret` from [https://sideshift.ai/account](https://sideshift.ai/account).                                                                                                              |
| Order not found                                                                                                                                                                          | 404 Not Found             | Invalid shiftId query param being used in /shift or /bulk shifts endpoint                                                | Use a valid `shiftId(s)` as query param.                                                                                                                                                                                                   |
| `depositAddress` missing                                                                                                                                                                 | 200 OK                    | Deposit addresses are unassigned after 60 days (40 days for EVM token deposits), at which point the field is `null` and the address may be reassigned. | Persist the address when the shift is created, treat it as nullable in `/v2/shifts/{shiftId}`, `/v2/shifts`, and `/v2/bulkshifts`, and never send funds to an expired-order address.                                                       |
| Invalid network                                                                                                                                                                          | 500 Internal Server Error | Incorrect/missing depositNetwork or settleNetwork                                                                        | Use/add correct `depositNetwork` or `settleNetwork`. See [`/v2/coins`](/endpoints/v2/coins) for a list of supported cryptocurrencies and their respective networks.                                                                        |
| Invalid coin                                                                                                                                                                             | 500 Internal Server Error | Invalid depositCoin or settleCoin                                                                                        | Use a supported coin for `depositCoin` and `settleCoin`. See [`/v2/coins`](/endpoints/v2/coins) for a list of supported cryptocurrencies and their respective networks.                                                                    |
| Amount too low                                                                                                                                                                           | 500 Internal Server Error | depositAmount is too low                                                                                                 | Use a higher value. See [`/v2/pair`](/endpoints/v2/pair) for the minimum deposit value.                                                                                                                                                    |
| Amount too high                                                                                                                                                                          | 500 Internal Server Error | depositAmount is too high                                                                                                | Use a lower value. See [`/v2/pair`](/endpoints/v2/pair) for the maximum deposit value.                                                                                                                                                     |
| Deposit and settle method must be different                                                                                                                                              | 500 Internal Server Error | depositCoin and depositNetwork values are similar to settleCoin and settleNetwork                                        | Ensure that methods being used are different.                                                                                                                                                                                              |
| Memo is not supported for this settle coin                                                                                                                                               | 500 Internal Server Error | settleCoin being used does not supports memo                                                                             | Check if the network for the `settleCoin` is included in the `networksWithMemo` array using [`/v2/coins`](/endpoints/v2/coins).                                                                                                            |
| Internal Server Error                                                                                                                                                                    | 500 Internal Server Error | The quoteId being used in creating fixed shift is invalid                                                                | Use a valid `quoteId`                                                                                                                                                                                                                      |

# FAQ

| Question                                                                                                                          | Answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| How do I create a fixed rate shift?                                                                                               | To create a fixed rate shift, first request a quote using the [`/v2/quotes`](/endpoints/v2/requestquote) endpoint. Then, use the `quoteId` returned by the endpoint to create a fixed rate shift using the [`/v2/shifts/fixed`](/endpoints/v2/createfixedshift) endpoint.                                                                                                                                                                                                                                                                                                                |
| How do I create a variable rate shift?                                                                                            | To create a variable rate shift, use the [`/v2/shifts/variable`](/endpoints/v2/createvariableshift) endpoint with the required parameters, such as `settleAddress`, `affiliateId`, `depositCoin`, and `settleCoin`.                                                                                                                                                                                                                                                                                                                                                                      |
| What is the difference between fixed rate and variable rate shifts?                                                               | Fixed rate shifts have a locked-in exchange rate for 15 minutes, while variable rate shifts determine their exchange rate when the user's deposit is received and have a 7-day expiration.                                                                                                                                                                                                                                                                                                                                                                                               |
| How should fixed rate shifts be used compared to variable shifts?                                                                 | We recommend using fixed rate only when users cannot change the amount they send and for when the `settleAmount` must be exact. In situations where there is flexibility, and to reduce errors where users might send the wrong amount, we recommend opting for variable rate shifts.                                                                                                                                                                                                                                                                                                    |
| What's the recommended integration, fixed or variable shifts?                                                                     | Fixed rate shifts are the preferred option when you need users to specify the amount they send or receive before creating a shift via the API. Fixed rate shifts expire in 15 minutes, while variable rate ones expire in 7 days.                                                                                                                                                                                                                                                                                                                                                        |
| Would the exchange fail if we don't send the expected amount in a fixed rate conversion?                                          | Yes, if you don’t send the exact expected amount to a fixed order, it will need to be refunded. We recommend that you set the refund address when creating a new shift just in case the deposit needs to be refunded. Wallet app integrations are advised to set the refund address to the address the users are sending the deposit coin from as this makes the refund process much smoother.                                                                                                                                                                                           |
| What are the minimum and maximum deposit ranges?                                                                                  | The minimum deposit range has a default value and is determined after incorporating network fees while the maximum deposit range is set by SideShift.ai and varies from coin to coin. Both ranges are denominated in USD.                                                                                                                                                                                                                                                                                                                                                                |
| How do I handle coins or tokens with memos?                                                                                       | For shifts that return a `depositMemo`, the deposit transaction must include this memo, otherwise, the deposit might be lost. For shifts settling in coins where the network is included in the `networksWithMemo` array in the [`/v2/coins`](/endpoints/v2/coins) endpoint, API users are allowed to specify a `settleMemo` field. Additionally, shifts can include optional `refundAddress` and `refundMemo`, if not defined, the user will be prompted to enter a refund address manually on the SideShift.ai order page if the shift needs to be refunded.                           |
| Why is `depositAddress` missing on older shifts?                                                                                  | `depositAddress` is unassigned from a shift after 60 days (40 days for EVM token deposit addresses). Once unassigned, the field becomes `null`, and the address may be assigned to other shifts. Persist the value when the shift is created if it needs to be shown later, and never send funds to addresses from expired shifts.
| How do I know if a coin or token is not available in other supported networks for either depositCoin or settleCoin?               | The API will return an array of networks for `depositOffline`, `settleOffline`, `fixedOnly`, `variableOnly`. So, for example, if ethereum is currently offline for deposit and settle, the response will include `ethereum` in the `depositOffline` and `settleOffline` arrays.                                                                                                                                                                                                                                                                                                          |
| How do I set a refund address?                                                                                                    | To set a refund address, use the [`/v2/shifts/:shiftId/set-refund-address`](/endpoints/v2/setrefundaddress) endpoint with the required address parameter. It can also be set when creating a shift.                                                                                                                                                                                                                                                                                                                                                                                      |
| What are the reasons for refunds?                                                                                                 | Refunds are made for various reasons, such as the user sending an incorrect amount for a fixed rate shift, the shift expiring, the user sending below the minimum amount, or above the maximum amount for a variable shift, among others.                                                                                                                                                                                                                                                                                                                                                |
| If a user chooses the wrong network, do you offer refunds? If so, what are the conditions for a refund?                           | We will recover and refund the user for any incorrect coin and/or network deposit that we have access to the address on the network user sent. This is usually done without any fee and within 3 days. If the network fees to recover are more than the deposit value, we will not recover.                                                                                                                                                                                                                                                                                              |
| What happens if an amount is sent outside of the range or after the shift expires?                                                | In both cases, shifts might be processed or refunded after human review.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| What flow is recommended if users use a fixed rate shift and pay the incorrect balance and how will they manage to retrieve them? | For fixed orders, we recommend that integrations pre-populate the amount field in their application’s UI and prevent users from changing it. We also recommend defining the `refundAddress` in the create order request so refunds can happen automatically if anything goes wrong. Wallet app integrations should set the refund address to the address the user is sending from to make the refund process smoother.                                                                                                                                                                   |
| What does the "multiple" status mean?                                                                                             | Multiple status means that a user made multiple deposits or on some occasion for EVM/Tron tokens, multiple attempts are made to sweep the user's deposit from the deposit address. For this case, there is a deposits array in the API response with details about each deposit.                                                                                                                                                                                                                                                                                                         |
| Why is the same deposit detected multiple times?                                                                                  | For EVM/Tron token deposits, the sweeper transaction sometimes isn’t broadcast to the network, which triggers another attempt to sweep funds from the deposit address. As a result, the same deposit can be detected multiple times.                                                                                                                                                                                                                                                                                                                                                     |
| Can shifts be rejected even if they haven't expired?                                                                              | There are several different reasons a variable or fixed rate shift might be rejected. Fixed rate shifts are less prone to rejection for wallets, and variable rate shifts are less prone to errors if the user can specify the amount they send. Rejected deposits will be reviewed by our operations team and either processed or refunded.                                                                                                                                                                                                                                             |
| How do you distinguish users if there's an issue with their shifts?                                                               | For handling different users and payment disputes, users are authenticated based on the `shiftId`, not their account.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| How can users contact support and resolve disputes if they encounter issues with their shifts?                                    | For any disputes, users can contact support directly via email and live chat. Integrations can add a link to their app to [https://sideshift.ai/orders/SHIFT_ID?openSupport=true](https://sideshift.ai/orders/SHIFT_ID?openSupport=true) for a seamless support experience. SideShift.ai authenticates users based on the `shiftId`, not their account.                                                                                                                                                                                                                                  |
| How can I test the transaction flow in our staging environment?                                                                   | We have no testing environment for the API. You can start by using small amounts in the live API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Is there an option for redirect, widget, or QR data available for clients?                                                        | The REST API returns the address (plus memo for coins that require it) where the user needs to send their deposit coin. You can use this to display a QR code on your site. If you want to redirect the user to SideShift, you can create a shift and redirect them to [https://sideshift.ai/orders/](https://sideshift.ai/orders/).                                                                                                                                                                                                                                                     |
| How do I check if a user is allowed to use SideShift.ai?                                                                          | Use the [`/v2/permissions`](/endpoints/v2/permissions) endpoint to determine if the user is allowed to use SideShift.ai.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Can SideShift.ai share their IP's for production whitelist?                                                                       | No. Our servers are using dynamic IP addresses, which change every time we restart them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| How do you guarantee liquidity for all the coins?                                                                                 | SideShift has automatic rebalancing of coin inventory balances held for user shifting. Shift orders are automatically created for liquidity providers to deposit any coin needed in exchange for a coin SideShift has a larger balance of. These shift orders are offered with above-market exchange rate to the liquidity provider so they profit from performing the coin swap. SideShift also has automatic "external trading" of some coins whereas user deposits are instantly sold on various DeFi pools and user settlements made directly from DeFi pools using smart contracts. |
| What slippage values can I expect for shifts?                                                                                     | The exchange rate displayed to the user for the selected coin pair is the exact rate they receive. Any fees are already included and depend on the coin pair and current market conditions, such as liquidity. The rate is the same for both fixed and variable orders; fixed orders lock in for 15 minutes for the deposit, while variable orders apply the live rate whenever the user makes a deposit.                                                                                                                                                                                |
| What is the average shift completion speed?                                                                                       | The shift time is based on blockchain confirmation. The user deposit must have at least one blockchain confirmation (or two confirmations for Litecoin, Dash, and Doge) for shift to be processed and the settle coin payment sent to user in the blockchain.                                                                                                                                                                                                                                                                                                                            |
| How can I receive a commission?                                                                                                   | SideShift.ai pays commissions to the affiliate whose `affiliateId` param is sent in the request. Make sure to create both quote and shift with the same `affiliateId`. Commissions are in SideShift.ai's native XAI token which can be withdrawn from your SideShift.ai account. We can also automatically convert it to your chosen coin when a certain threshold is reached and send it to your designated wallet address. There's no minimum or network commissions.                                                                                                                  |
| How can I withdraw my portion of the fees? Are there any minimum and network commissions?                                         | Any fees are already included in the exchange rate displayed to the user. These fees are dynamic; however, it is necessary to remain highly competitive on rates and offer the lowest rates for many major coin pairs compared to other swap services. The default commission paid to integrators is 0.5% of the shift value. Commission rates can be adjusted from 0% to 2% using the `commissionRate` parameter, with rates above the default passed on to the user.                                                                                                                   |
| What are the minimum and maximum commission rates I can set?                                                                      | Commission rates can be set from 0% to a maximum of 2%. The default commission rate is 0.5%. Rates below the default offer better rates for users by reducing affiliate commission, while rates above the default are passed on to the user. Use the `commissionRate` parameter in quote and shift creation endpoints to adjust rates.                                                                                                                                                                                                                                                   |
| What level of support can we expect from your team?                                                                               | Support is available 24/7 and generally replies within minutes. Integrations can either sync the support team with their in-house team to resolve any issues that arise or forward users directly to support via help@sideshift.ai. Integrations can also enhance the user experience by providing a direct link to the SideShift.ai support chat. For seamless support, it’s recommended to include a link that initiates a chat session with a pre-filled shift ID, such as: https://sideshift.ai/orders/SHIFT_ID?openSupport=true.                                                    |
| How many blockchains and cryptocurrencies does your API support?                                                                  | Currently 42 blockchains and 200+ cryptocurrencies are supported.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Do you support webhooks?                                                                                                          | No — webhooks aren’t available. Poll the API instead using [`/v2/shifts/{shiftId}`](/endpoints/v2/shift).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

# SideShift Widget

To embed the SideShift widget, start with the [Embed Generator Form](https://sideshift.ai/embed) for a code snippet to add to your website's `<head>` section. The Embed Tool allows users with minimal coding experience to integrate SideShift.ai. Use it to process payments, as an exchange widget, and more. The possibilities are endless.

:::tip

Use your SideShift.ai account's affiliate ID for the `parentAffiliateId` field. Learn more about _[Monetization](/api-intro/monetization)_.
:::

## Example Embed Code

```html
<script type="text/javascript">
  window.__SIDESHIFT__ = {
    parentAffiliateId: "k0Kx8oXzy",
    defaultDepositMethodId: "btc",
    defaultSettleMethodId: "eth",
    settleAddress: undefined,
    type: "variable",
    commissionRate: "0.01",
    settleAmount: undefined,
    theme: "dark",
  };
</script>
<script src="https://sideshift.ai/static/js/main.js"></script>
```

Following this setup, you have two main options:

## Option 1: Open Using the SideShift Button

Place the SideShift Button anywhere on your website. When users click on it, the embedded SideShift Widget will appear as a full-screen overlay. [See demo here](https://jsfiddle.net/sideshift_ai/kvqtf2wu/).

```html title="Copy and paste this anywhere in your HTML"
<style scoped>
  #sideshift-modal-button {
    -webkit-appearance: none;
    color: rgb(17, 11, 11);
    background-color: rgb(232, 90, 67);
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    text-decoration: none;
    text-transform: uppercase;
    font-size: 1rem;
    line-height: 1.5rem;
    text-align: center;
    padding: 0.875rem 1rem;
    border-radius: 0.25rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 3rem;
    min-width: 13rem;
    border: none;
    cursor: pointer;
    margin: 0 auto;
  }

  #sideshift-modal-button:hover {
    opacity: 0.9;
  }
</style>

<button onClick="window.sideshift.show()" id="sideshift-modal-button">
  Shift Crypto
</button>
```

## Option 2: Open Programmatically

Below is the documentation on how to use the Embed plugin. Utilize the embed plugin code to open the widget through your own custom triggers or user interaction flows.

```js
/**
 * Sideshift plugin library
 */
const sideshift = window.sideshift;

/**
 * Show plugin
 */
sideshift.show();

/**
 * Hide plugin
 */
sideshift.hide();

/**
 * Listen for settled event
 * (happens when a shift has been settled with at least one deposit)
 */
sideshift.addEventListener("settled", (deposits) => {
  console.log(deposits);
  // deposits = [{
  //   "depositId": "de6279c2101e211cebbc",
  //   "createdAt": "1555820836956",
  //   "createdAt": "1555820836970",
  //   "depositAmount": "0.0000346",
  //   "settleRate": "17.5324",
  //   "settleAmount": "0.0006066072",
  //   "networkFeePaidUsd": "3.14",
  //   "status": "received" || "settling" || "settled" || "settle_fail" || "rejected" || "refund" || "refunding" || "refunded" || "refund_fail",
  //   "settleTxid": "dvmeagwdkuy34grkuy32dgby3k4ugdb2ykgyu23yu3k2",
  //   "refundAddress": null || "fjdhvbehv543ev4h35bg4u5i34jhcbru3hjfhbj34",
  //   "refundTxid": null || "dfjbd1hjb42hjb5uhj3bh4j2r3b2hjbrt43hj23bruhj3b",
  //   "reason": null || "admin" || "refund" || "insufficient funds"
  //   "order": order (see 'order' event)
  // }]
});

/**
 * Listen for deposit event
 * (happens when a deposit is made)
 */
sideshift.addEventListener("deposit", (deposits) => {
  console.log(deposits);
  // deposits = [{
  //   "depositId": "de6279c2101e211cebbc",
  //   "createdAt": "1555820836956",
  //   "createdAt": "1555820836970",
  //   "depositAmount": "0.0000346",
  //   "settleRate": "17.5324",
  //   "settleAmount": "0.0006066072",
  //   "networkFeeAmount": null,
  //   "status": "received" || "settling" || "settled" || "settle_fail" || "rejected" || "refund" || "refunding" || "refunded" || "refund_fail",
  //   "settleTxid": "dvmeagwdkuy34grkuy32dgby3k4ugdb2ykgyu23yu3k2",
  //   "refundAddress": null || "fjdhvbehv543ev4h35bg4u5i34jhcbru3hjfhbj34",
  //   "refundTxid": null || "dfjbd1hjb42hjb5uhj3bh4j2r3b2hjbrt43hj23bruhj3b",
  //   "reason": null || "admin" || "refund" || "insufficient funds"
  //   "order": order (see 'order' event)
  // }]
});

/**
 * Listen for order event
 * (happens when order is supplied to user)
 */
sideshift.addEventListener("order", (order) => {
  console.log(order);
  // order = {
  //     "orderId": "de6279c2101e211cebbc",
  //     "createdAt": "1555820836956",
  //     "depositMethodId": "btc",
  //     "settleMethodId": "bch",
  //     "depositAddress": {
  //       "address": "3Nh4fgyUpdcihZt5f9Ei1QJpREvRDh2TqZ"
  //     },
  //     "depositMax": "1.867",
  //     "depositMin": "0.0001867"
  //   }
  // }
});
```

# Widget Integration Guide 1

### Intro

The SideShift widget allows users to seamlessly shift cryptocurrencies directly on your website. This guide covers the steps to integrate the widget using `Option 1: Open Using the SideShift Button`, which involves embedding a button that opens the widget.

For a video walkthrough, watch [here](https://www.youtube.com/watch?v=4Z9otXing9s).

### Step 1: Create a Directory and Open It in Your Code Editor

```bash
mkdir sideshift-widget-demo
cd sideshift-widget-demo
```

### Step 2: Create an HTML File with a Basic Template

Create an index.html file and add the following basic HTML template:

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SideShift Widget Integration Demo</title>
  </head>
  <body></body>
</html>
```

### Step 3: Add the Embed Code

Go to the [SideShift embed page](https://sideshift.ai/embed). Choose either `Variable Rate` or `Fixed Rate`, fill out the necessary fields, and copy the embed code. Paste this code into the `head` section of your `index.html` file.

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SideShift Widget Integration Demo</title>
    <!-- Add SideShift scripts here -->
    <script type="text/javascript">
      window.__SIDESHIFT__ = {
        parentAffiliateId: "k0Kx8oXzy", // Replace with your SideShift.ai account ID
        defaultDepositMethodId: "btc", // Replace with your chosen default deposit method
        defaultSettleMethodId: "eth", // Replace with your chosen default settlement method
        settleAddress: undefined, // Replace with the recipient address if needed
        type: "variable", // Type of shift: variable or fixed
        commissionRate: "0.01", // Optional commission rate (1%)
        settleAmount: undefined, // Replace with the amount to settle if needed
        theme: "dark", // Replace with your chosen theme
      };
    </script>
    <script src="https://sideshift.ai/static/js/main.js"></script>
    <!-- End of SideShift scripts -->
  </head>
  <body></body>
</html>
```

### Step 4: Add the SideShift Button

Customize the button's label on the embed page and copy the code. Paste it just below the script in your `index.html` file. Add some content to the `body` section and place the button there.

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SideShift Widget Integration Demo</title>
    <!-- Add SideShift scripts here -->
    <script type="text/javascript">
      window.__SIDESHIFT__ = {
        parentAffiliateId: "k0Kx8oXzy", // Replace with your SideShift.ai account ID
        defaultDepositMethodId: "btc", // Replace with your chosen default deposit method
        defaultSettleMethodId: "eth", // Replace with your chosen default settlement method
        settleAddress: undefined, // Replace with the recipient address if needed
        type: "variable", // Type of shift: variable or fixed
        commissionRate: "0.01", // Optional commission rate (1%)
        settleAmount: undefined, // Replace with the amount to settle if needed
        theme: "dark", // Replace with your chosen theme
      };
    </script>
    <script src="https://sideshift.ai/static/js/main.js"></script>
    <!-- End of SideShift scripts -->
    <style scoped>
      #sideshift-modal-button {
        -webkit-appearance: none;
        color: rgb(17, 11, 11);
        background-color: rgb(232, 90, 67);
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        text-transform: uppercase;
        font-size: 1rem;
        line-height: 1.5rem;
        text-align: center;
        padding: 0.875rem 1rem;
        border-radius: 0.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 3rem;
        min-width: 13rem;
        border: none;
        cursor: pointer;
        margin: 0 auto;
      }

      #sideshift-modal-button:hover {
        opacity: 0.9;
      }
    </style>
  </head>
  <body>
    <section>
      <div>
        <h2>Click on the button to open the SideShift Widget</h2>
        <p>
          This is a demo of the embeddable SideShift Widget and Button. For more
          info, visit
          <a href="https://sideshift.ai/embed">https://sideshift.ai/embed</a>.
        </p>
      </div>
      <div>
        <button onClick="window.sideshift.show()" id="sideshift-modal-button">
          Shift Now
        </button>
      </div>
    </section>
  </body>
</html>
```

### Step 5: Style the Body and Text

Add styles to the body and paragraph texts for better presentation.

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SideShift Widget Integration Demo</title>
    <!-- Add SideShift scripts here -->
    <script type="text/javascript">
      window.__SIDESHIFT__ = {
        parentAffiliateId: "k0Kx8oXzy", // Replace with your SideShift.ai account ID
        defaultDepositMethodId: "btc", // Replace with your chosen default deposit method
        defaultSettleMethodId: "eth", // Replace with your chosen default settlement method
        settleAddress: undefined, // Replace with the recipient address if needed
        type: "variable", // Type of shift: variable or fixed
        commissionRate: "0.01", // Optional commission rate (1%)
        settleAmount: undefined, // Replace with the amount to settle if needed
        theme: "dark", // Replace with your chosen theme
      };
    </script>
    <script src="https://sideshift.ai/static/js/main.js"></script>
    <!-- End of SideShift scripts -->
    <style scoped>
      /* Added styles for body and paragraph */
      body {
        display: flex;
        justify-content: center;
        font-family: monospace;
        line-height: 150%;
        text-align: center;
        align-items: center;
        height: 100vh;
        max-width: 40rem;
        margin: auto;
      }

      p {
        font-size: 1rem;
        padding-bottom: 2rem;
        font-weight: 300;
      }

      #sideshift-modal-button {
        -webkit-appearance: none;
        color: rgb(17, 11, 11);
        background-color: rgb(232, 90, 67);
        transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        text-transform: uppercase;
        font-size: 1rem;
        line-height: 1.5rem;
        text-align: center;
        padding: 0.875rem 1rem;
        border-radius: 0.25rem;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 3rem;
        min-width: 13rem;
        border: none;
        cursor: pointer;
        margin: 0 auto;
      }

      #sideshift-modal-button:hover {
        opacity: 0.9;
      }
    </style>
  </head>
  <body>
    <section>
      <div>
        <h2>Click on the button to open the SideShift Widget</h2>
        <p>
          This is a demo of the embeddable SideShift Widget and Button. For more
          info, visit
          <a href="https://sideshift.ai/embed">https://sideshift.ai/embed</a>.
        </p>
      </div>
      <div>
        <button onClick="window.sideshift.show()" id="sideshift-modal-button">
          Shift Now
        </button>
      </div>
    </section>
  </body>
</html>
```

### Step 6: Review the Final Code

Ensure your final code matches the example provided above. Check for any syntax errors and ensure all required fields are correctly filled out.

### Step 7: Test locally

Open the terminal and run the following command to test the integration locally.

```bash
open index.html
```

You should see the SideShift widget open when you click the `Shift Now` button.

Your SideShift Widget Integration is now complete.

### See live demo

You can view a demo [here](https://codesandbox.io/p/devbox/sideshift-ai-widget-zxlz8h).

### Troubleshooting

If you encounter any issues, ensure:

- Your `parentAffiliateId` is correct.
- You have internet connectivity.
- The script URLs are accessible.

# Widget Integration Guide 2

### Intro

The SideShift widget allows users to seamlessly shift cryptocurrencies directly on your website. This guide covers the steps to integrate the widget using `Option 2: Open Programmatically`, which allows you to open the widget programmatically using a button.

For a video walkthrough, watch [here](https://www.youtube.com/watch?v=pJct0OadpH4).

### Step 1: Create a React App

Open the terminal and run the following command to create a new React app using Vite with TypeScript.

```bash
npm create vite@latest sideshift-widget-demo --template react-ts
```

### Step 2: Add the Embed Code

Go to the [SideShift embed page](https://sideshift.ai/embed). Choose either `Variable Rate` or `Fixed Rate`, fill out the necessary fields, and copy the embed code. Paste this code into the `head` section of your `index.html` file.

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SideShift Widget Integration Demo</title>
    <!-- Add SideShift scripts here -->
    <script type="text/javascript">
      window.__SIDESHIFT__ = {
        parentAffiliateId: "k0Kx8oXzy", // Replace with your SideShift.ai account ID
        defaultDepositMethodId: "btc", // Replace with your chosen default deposit method
        defaultSettleMethodId: "eth", // Replace with your chosen default settlement method
        settleAddress: undefined, // Replace with the recipient address if needed
        type: "variable", // Type of shift: variable or fixed
        commissionRate: "0.01", // Optional commission rate (1%)
        settleAmount: undefined, // Replace with the amount to settle if needed
        theme: "dark", // Replace with your chosen theme
      };
    </script>
    <script src="https://sideshift.ai/static/js/main.js"></script>
    <!-- End of SideShift scripts -->
  </head>
  <body></body>
</html>
```

### Step 3: Add the SideShift Button

Create a components folder inside `src` and add a file named `SideShiftButton.tsx`.

```tsx title="src/components/SideShiftButton.tsx"

declare global {
  interface Window {
    sideshift: {
      show: () => void;
      hide: () => void;
    };
  }
}

const SideShiftButton: React.FC = () => {
  const showSideShift = () => {
    if (window.sideshift && window.sideshift.show) {
      window.sideshift.show();
    } else {
      console.error(
        "SideShift script not loaded or sideshift object is not available"
      );
    }
  };

  const handleSettle = (event: CustomEvent) => {
    console.log("Exchange settled:", event.detail);
  };

  const handleDeposit = (event: CustomEvent) => {
    console.log("Deposit made:", event.detail);
  };

  const handleOrder = (event: CustomEvent) => {
    console.log("Order created:", event.detail);
  };

  useEffect(() => {
    window.addEventListener(
      "sideshift.ai/settle",
      handleSettle as EventListener
    );
    window.addEventListener(
      "sideshift.ai/deposit",
      handleDeposit as EventListener
    );
    window.addEventListener("sideshift.ai/order", handleOrder as EventListener);

    return () => {
      window.removeEventListener(
        "sideshift.ai/settle",
        handleSettle as EventListener
      );
      window.removeEventListener(
        "sideshift.ai/deposit",
        handleDeposit as EventListener
      );
      window.removeEventListener(
        "sideshift.ai/order",
        handleOrder as EventListener
      );
    };
  }, []);

  return <button onClick={showSideShift}>Shift with SideShift</button>;
};

```

### Step 4: Update App.tsx

Update the `App.tsx` file to include the `SideShiftButton` component.

```tsx title="src/App.tsx"

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

```

### Step 5: Apply Custom Styling to the App Container

```css title="src/App.css"
.App {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Use the full height of the viewport */
}
```

### Step 6: Test locally

Open the terminal and run the following command to test the integration locally.

```bash
npm run dev
```

You should see the SideShift widget open when you click the `Shift with SideShift` button.

Your SideShift Widget Integration is now complete.

### See live demo

You can view a demo [here](https://codesandbox.io/p/devbox/sideshift-ai-widget-guide-2-zjf6tf).

### Troubleshooting

If you encounter any issues, ensure:

- Your `parentAffiliateId` is correct.
- You have internet connectivity.
- The script URLs are accessible.
- The SideShiftButton component is correctly importing and rendering.

# Network Fees

- **Sending fee**: This fee is associated with sending the `settleCoin` to your selected wallet address. It applies to BTC, ETH, EVM tokens, TRC20 tokens, ATOM, KAVA, TIA, and SEI.
- **Address fee**: This fee is required for the creation of a unique SideShift.ai deposit address for every Shift. It applies to EVM token deposits. However, currently, contracts are being reused, and no fee is being charged for this.
- **Receiving fee**: This fee is applicable to all ETH, EVM tokens, and TRC20 deposits that require a sweep transaction from the unique deposit address to process the shift.

Please note that these fees are estimated, and the actual fees may vary depending on the network conditions at the time of the transaction.

# Rate Limits

The REST API has rate limits in place to ensure fair usage and protect the system from abuse. Rate limits are enforced per IP address. The following operations have specific rate limits:

- **Creating a Shift:** Clients can create up to 5 shifts per minute. This concerns [`/v2/shifts/fixed`](/endpoints/v2/createfixedshift) and [`/v2/shifts/variable`](/endpoints/v2/createvariableshift) endpoints.
- **Creating a Quote**: Clients can create up to 20 quotes per minute. This concerns the [`/v2/quotes`](/endpoints/v2/requestquote) endpoint.

If a client exceeds these limits, the server will respond with a status code of `429` and a message of `Rate limit exceeded`. Please ensure your application respects these rate limits to avoid disruptions in service.

:::info

If you've created 5 consecutive variable rate shifts, you'll need to wait for one to expire before creating another. Alternatively, you can manually cancel the shifts from the order page or call the [`/v2/cancel-order`](/endpoints/v2/cancelorder) endpoint.

:::

# Changelog

## [1.0.4] - 2025-08-14

### Added

- Added optional `commissionRate` parameter to `/v2/pair` and `/v2/pairs` endpoints with 0% to 2% range support.

## [1.0.3] - 2025-06-11

### Added

- New `/v2/cancel-order` endpoint to cancel an existing order by expiring it.

## [1.0.2] - 2025-05-20

### Added

- Required `affiliateId` and `x-sideshift-secret` parameters for `/pair` and `/pairs` endpoints.

## [1.0.1] - 2025-02-24

### Added

- Introduced `networksWithMemo` in the `/v2/coins` endpoint.

### Deprecated

- Marked `hasMemo` as deprecated in the `/v2/coins` endpoint.

## [1.0.0] - 2025-02-21

- First version of changelog added. For changes prior to this version, please reach out to [Developer Chat](https://t.me/joinchat/UuTn4HeK-2EUG1zZ).

# SideShift Pay Integration Guide

This guide will help you integrate our Stripe-like crypto payment solution into your webshop. Follow the steps below to create checkouts, redirect users for payment, and receive payment notifications via webhooks.

## Introduction

**SideShift Pay** offers a simple and seamless way to accept cryptocurrency payments in your webshop. By integrating our checkout feature, you can allow your customers to pay with any supported cryptocurrency, while you receive settlements in the coin of your choice.

## Prerequisites

- **SideShift.ai Account**: Ensure you have an active SideShift.ai account.
- **Account ID and Private Key**:
  - **Account ID**: Your unique identifier on SideShift.ai. It can also be used as the `affiliateId` to receive commissions.
  - **Private Key**: Your API secret key used for authentication.
  - Both can be acquired from [https://sideshift.ai/account](https://sideshift.ai/account).
- **Affiliate ID**: The Account ID of the account that should receive the commission. It can be your own Account ID or any other Account ID.
- **Web Server**: Your webshop should be able to handle HTTP requests and responses.

## Creating a Checkout

To create a new checkout, make a `POST` request to the [`/v2/checkout`](/endpoints/v2/createcheckout) endpoint with the necessary parameters. This will set up the payment details where **you** (the merchant) specify your settlement preferences.

#### Endpoint

```
POST https://sideshift.ai/api/v2/checkout
```

#### Request Headers

- `Content-Type: application/json`
- `Accept: application/json`
- `x-sideshift-secret: YOUR_PRIVATE_KEY`
- `x-user-ip: END_USER_IP_ADDRESS` (IP address of the customer initiating the checkout)

#### Request Body Parameters

- `settleCoin` (string, required): The coin **you want to receive** (e.g., `"BTC"`, `"ETH"`).
- `settleNetwork` (string, required): The network of the settle coin (e.g., `"mainnet"`).
- `settleAmount` (string, required): The amount you expect to receive.
- `settleAddress` (string, required): Your wallet address where the settlement will be sent.
- `settleMemo` (string, optional): Required if the coin uses a memo/tag.
- `affiliateId` (string, required): The **Account ID** of the account that should receive the commission. This can be your own Account ID or any other Account ID.
- `successUrl` (string, required): URL to redirect the user after a successful payment.
- `cancelUrl` (string, required): URL to redirect the user if the payment is cancelled.

#### Example Request

```bash
curl --request POST \
  --url 'https://sideshift.ai/api/v2/checkout' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --header 'x-sideshift-secret: YOUR_PRIVATE_KEY' \
  --header 'x-user-ip: END_USER_IP_ADDRESS' \
  --data '{
    "settleCoin": "ETH",
    "settleNetwork": "mainnet",
    "settleAmount": "0.01",
    "settleAddress": "YOUR_ETH_ADDRESS",
    "affiliateId": "YOUR_ACCOUNT_ID",
    "successUrl": "https://yourwebshop.com/success",
    "cancelUrl": "https://yourwebshop.com/cancel"
  }'
```

#### Successful Response

A successful response will return a JSON object containing the checkout details, including a unique `id` for the checkout.

```json
{
  "id": "uniqueCheckoutID",
  "settleCoin": "ETH",
  "settleNetwork": "mainnet",
  "settleAddress": "YOUR_ETH_ADDRESS",
  "settleAmount": "0.01",
  "updatedAt": "2025-11-05T17:00:13.927000000Z",
  "createdAt": "2025-11-05T17:00:13.927000000Z",
  "affiliateId": "YOUR_ACCOUNT_ID",
  "successUrl": "https://yourwebshop.com/success",
  "cancelUrl": "https://yourwebshop.com/cancel",
}
```

## Redirecting Users to the Payment Page

After creating the checkout, redirect your customers to the **SideShift Pay** payment page where they can complete the payment. **Customers can choose any of the supported cryptocurrencies to pay with.**

#### Payment URL Format

```
https://pay.sideshift.ai/checkout/{uniqueCheckoutID}
```

Replace `{uniqueCheckoutID}` with the `id` returned from the checkout creation response.

## Setting Up Webhooks

To be notified when a payment is either `success` or `fail`, you need to set up a webhook. SideShift.ai will send a POST request to your specified `targetUrl` whenever there is an update on the checkout.

:::note
Currently, webhooks are set up via a GraphQL mutation. A UI-based setup will be available in the future.
:::

### Creating a Webhook

Make a `POST` request to the GraphQL endpoint to create a webhook.

#### Endpoint

```
POST https://sideshift.ai/graphql
```

#### Request Headers

- `Content-Type: application/json`
- `x-sideshift-secret: YOUR_PRIVATE_KEY`

#### Request Body

Use the following GraphQL mutation to create a webhook:

```json
{
  "query": "mutation { createHook(targetUrl: \"https://yourwebshop.com/api/webhooks/sideshift\") { id createdAt updatedAt targetUrl enabled } }"
}
```

#### Example Request

```bash
curl --request POST \
  --url 'https://sideshift.ai/graphql' \
  --header 'Content-Type: application/json' \
  --header 'x-sideshift-secret: YOUR_PRIVATE_KEY' \
  --data '{"query":"mutation { createHook(targetUrl: \"https://yourwebshop.com/api/webhooks/sideshift\") { id createdAt updatedAt targetUrl enabled } }"}'
```

#### Successful Response

The response will include details of the created webhook.

```json
{
  "data": {
    "createHook": {
      "id": "uniqueHookID",
      "createdAt": "2025-11-05T17:00:13.927000000Z",
      "updatedAt": "2025-11-05T17:00:13.927000000Z",
      "targetUrl": "https://yourwebshop.com/api/webhooks/sideshift",
      "enabled": true
    }
  }
}
```

### Handling Webhook Notifications

Your server should handle incoming POST requests to the `targetUrl`. The notifications will include details about the checkout and its status.

#### Example Notification Payload

```json
{
  "meta": {
    "hook": {
      "id": "webhookUniqueId",
      "createdAt": "2025-11-05T17:00:13.927000000Z",
      "updatedAt": "2025-11-05T17:00:13.927000000Z",
      "enabled": true,
      "accountId": "YourAccountId",
      "targetUrl": "YourWebhookUrl"
    }
  },
  "payload": {
    "shiftId": "ShiftId",
    "status": "success",
    "txid": "txHash"
  }
}
```

#### Status Values

- `success`: Payment has been settled
- `fail`: Payment ended unsuccessfully (refunded)

## Sample Code

### Creating a Checkout

```javascript
// Create a checkout session
const response = await fetch('https://sideshift.ai/api/v2/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-sideshift-secret': 'YOUR_SECRET_KEY',
    'x-user-ip': customerIpAddress
  },
  body: JSON.stringify({
    settleCoin: 'BTC',
    settleNetwork: 'mainnet',
    settleAmount: '0.001',
    settleAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    affiliateId: 'YOUR_ACCOUNT_ID',
    successUrl: 'https://yourwebshop.com/success',
    cancelUrl: 'https://yourwebshop.com/cancel'
  })
});

const checkout = await response.json();
// Redirect customer to: https://pay.sideshift.ai/checkout/${checkout.id}
```

### Handling Webhook Notifications

```javascript
// Handle webhook notifications
app.post('/webhooks/sideshift', (req, res) => {
  const { meta, payload } = req.body;
  const { shiftId, status, txid } = payload ?? {};

  console.log('Webhook meta:', meta);
  console.log('Webhook payload:', payload);

  switch (status) {
    case 'success':
      console.log(`Shift ${shiftId} succeeded with txid ${txid}`);
      break;
    case 'fail':
      console.log(`Shift ${shiftId} failed`);
      break;
  }

  res.status(200).send('OK');
});
```

### Checking Order Status

You can use the [`/v2/checkout/{checkoutId}`](/endpoints/v2/checkout) endpoint to fetch the latest checkout data, derive the latest `shiftId` from `checkout.orders`, and then query [`/v2/shifts/{shiftId}`](/endpoints/v2/shift) for the current shift status.

```javascript
// Check latest shift/order status for a checkout
const checkoutResponse = await fetch(`https://sideshift.ai/api/v2/checkout/${checkoutId}`);

const checkout = await checkoutResponse.json();
console.log('Checkout:', checkout);

// Response example
// Checkout: {
//   id: 'fdebd5b5-357a-4cfd-b60b-076ae7c62d77',
//   settleCoin: 'BTC',
//   settleNetwork: 'mainnet',
//   settleAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
//   settleAmount: '0.001',
//   updatedAt: '2024-01-01T00:55:33.222000000Z',
//   createdAt: '2024-01-01T00:55:33.222000000Z',
//   affiliateId: 'YOUR_ACCOUNT_ID',
//   successUrl: 'https://yourwebshop.com/success',
//   cancelUrl: 'https://yourwebshop.com/cancel',
//   orders: [
//     {
//       id: 'd2a473f82603e9ccfbb8',
//       deposits: [
//         {
//           depositHash: '0x73b277e5df00f57a03cbe6ca318ca79e66398a2f3f9ff414966a7ec281e903c8',
//           settleHash: '055f7d293ebd4546b446da0eb920c5c427d72647ae58262e53b8a8a574544dd9'
//         }
//       ]
//     }
//   ]
// }

// The first order in checkout.orders (orders[0]) is the latest shift/order for this checkout
const shiftId = checkout.orders?.[0]?.id;
if (!shiftId) {
  throw new Error('No shiftId found');
}

// Fetch the shift to get the status
const shiftResponse = await fetch(`https://sideshift.ai/api/v2/shifts/${shiftId}`);

const shift = await shiftResponse.json();
console.log('Latest order status:', shift.status);

// Response example
// Latest order status: settled
```
