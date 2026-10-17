---
title: "PSP fees vs contract: why your payment fees go up when nothing changed"
seoTitle: "PSP fees vs contract: why payment fees rise when nothing changed"
description: "Your PSP contract didn't change, yet the effective rate went up. The six drivers behind payment fee drift, how to check billing against contract, and what to claim back."
label: "Payment fees"
shortTitle: "PSP fees vs contract"
lede: "The rate card is signed, the invoice arrives, and the effective rate is 14 basis points higher than last quarter. Nobody renegotiated anything. This is the most common question a payment team asks, and the answer is almost never one thing."
readingMinutes: 3
published: 2026-09-26
updated: 2026-09-26
pillar: strategy
order: 1
locale: en
cta:
  headline: "See your own fees checked against your contract, every month."
  text: "Oryjin continuously monitors your entire stack, from PSP and acquirer fees to scheme fees, fraud, chargebacks and orchestration, and turns it into decision-grade intelligence. Early access is open for European merchants doing €2 to 20M GMV a month."
faq:
  - q: "Is a higher effective rate always a billing error?"
    a: "No. Most of the increase usually comes from card mix, scheme fee revisions and per-event fees that are contractually correct. Billing errors exist, but they are the smaller, recoverable part. Separating the two is the point of checking fees against the contract."
  - q: "How often should PSP fees be checked against the contract?"
    a: "Monthly, at the same rhythm as the invoice. Scheme fee schedules revise on published cycles, tiers reset, and mix drifts week to week, so a quarterly or yearly check misses most of the movement."
related:
  - scheme-fees-interchange
  - psp-contract-renegotiation
  - payment-cost-forecast
  - chargeback-ratio-thresholds
---
## A PSP invoice is one total on top of six moving layers

The cost of accepting a card payment stacks at least six components, each with its own owner and its own revision cycle: interchange paid to the issuer, scheme fees charged by Visa or Mastercard, the acquirer or PSP markup, FX conversion, per-event fees (authorisation, 3-D Secure, refunds, retries, disputes) and the losses from fraud and chargebacks. Your contract fixes the markup and a few per-event prices. It does not fix the rest.

In the EEA, consumer interchange is capped at 0.20% for debit and 0.30% for credit by Regulation (EU) 2015/751. That is the only capped layer. Everything above it moves, and it has been moving in one direction: EuroCommerce measured a 33.9% increase in scheme fees charged to European merchants between 2018 and 2022, and a European Commission study cited by Ecommerce Europe put the schemes' net charge on merchants at 0.44% of value in 2022, up from 0.27% four years earlier.

## The six reasons fees drift without a contract line moving

1. **Card mix.** A few points of volume shifting from consumer debit to commercial cards moves the blended rate by tens of basis points. Commercial card interchange in Europe runs at 1.3% to 2.4% according to EuroCommerce, roughly six times the consumer cap, and no contract line changes when your customers' cards do.
2. **Conditional scheme fees.** Scheme fee schedules contain items triggered by behaviour rather than by a negotiated rate: channel, token status, settlement currency, authorisation retries. The UK Payment Systems Regulator found in 2025 that acquirers themselves cannot always identify which merchants trigger these fees.
3. **Tier mechanics.** Volume tiers that reset each year, or that are applied to the wrong base, silently change the rate you pay without any line in the contract being wrong.
4. **Geographic reclassification.** The same card, presented from a different market, lands in a different interchange and scheme fee category. Opening a country changes your cost before you have sold anything there.
5. **Per-event growth.** Refunds, retries, 3-D Secure attempts and disputes grow with the business, not with the rate card. Their fees are small individually and large in aggregate.
6. **Nomenclature changes.** Providers rename and regroup their own billing lines. A comparison built in a spreadsheet last year breaks the month the invoice format changes.

## What billing against contract actually means

Checking PSP fees against a contract is not reading the invoice. It is computing what each settled payment should have cost under the contract's terms (rate by card type, tier applicable at that volume, per-event prices, FX terms) and comparing that expected cost with what was actually billed, line by line, every month.

Done properly, this separates three very different findings that a single invoice blends together: billing that departs from the contract (recoverable, with the payment references to prove it), drift that is contractually correct but commercially painful (mix, scheme revisions, FX, priced in euros so you know what it costs you), and per-event costs that no rate card would have caught. Keeping the three apart is what makes the recoverable amount credible when you send it to the provider.

## What to do this quarter

- Reconstruct the effective rate for the last three months by card type and market, not as one blended number.
- Get the contract terms into a form you can compute with: rates, tiers, tier base, per-event prices, FX terms, renewal date.
- Run every invoice line against those terms. Anything above contract becomes a claim, with the payment references attached.
- Price the drift separately and decide which levers are yours: a 3-D Secure rule, a retry policy, local acquiring for a market, a renegotiation.
- Do it monthly. A one-off exercise produces a photograph of a cost that moves every month.
