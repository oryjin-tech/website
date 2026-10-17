---
title: "Scheme fees and interchange: what a card payment really costs in Europe"
seoTitle: "Scheme fees & interchange explained: what a card payment really costs"
description: "Interchange, scheme fees, acquirer markup, FX and per-event fees: the anatomy of a European card payment, which layers are capped, which are rising, and how to measure yours."
label: "Scheme fees"
shortTitle: "Scheme fees and interchange"
lede: "A blended rate of 1.7% tells you almost nothing. It is the average of a first payment on a commercial card, a stored-card renewal, a cross-border transaction that was retried twice, and a refund. Understanding the layers underneath is the difference between a cost you manage and a cost you endure."
readingMinutes: 4
published: 2026-09-26
updated: 2026-09-26
pillar: costs
order: 2
locale: en
cta:
  headline: "See your full cost per payment, split into its layers, measured where your provider reports it and modelled where it does not."
  text: "Oryjin continuously monitors your entire stack, from PSP and acquirer fees to scheme fees, fraud, chargebacks and orchestration, and turns it into decision-grade intelligence. Early access is open for European merchants doing €2 to 20M GMV a month."
faq:
  - q: "Are scheme fees negotiable?"
    a: "Not directly by a merchant: they are set by the schemes and charged to acquirers. What is negotiable is how your acquirer passes them through (at cost on interchange++, or blended), and which behaviours you can change to avoid conditional fees, such as retry policies and token use."
  - q: "What is the difference between interchange++ and blended pricing?"
    a: "Interchange++ bills interchange and scheme fees at cost plus a stated markup, so each layer is visible. Blended pricing folds the three into one rate, which is simpler to read and impossible to decompose. For a merchant above a few million euros a month, the visibility usually pays for itself."
related:
  - psp-fees-vs-contract
  - psp-contract-renegotiation
  - payment-cost-forecast
  - chargeback-ratio-thresholds
author: victor-morel
cover: network
pullQuote: "A blended-price account with no network-cost report can only be modelled. That is itself a finding."
takeaways:
  - "A card payment's cost stacks interchange, scheme fees, the acquirer's markup, FX and per-event fees. Only consumer interchange is capped in the EEA."
  - "Scheme fees are not capped and grew 33.9% for European merchants between 2018 and 2022, according to EuroCommerce."
  - "Measured, billed and modelled figures describe the same cost and must never be added together."
  - "Split the cost of each payment by card type, market, currency and pattern to see which layer moved and why."
---
## The layers, from the issuer to your bank account

**Interchange** goes to the card issuer. In the EEA it is capped for consumer cards at 0.20% (debit) and 0.30% (credit) under the Interchange Fee Regulation. Commercial cards are outside the cap and, according to EuroCommerce, run at 1.3% to 2.4% in Europe. Inter-regional cards (a US card used on a French site) follow separate commitments and cost more again.

**Scheme fees** are charged by Visa and Mastercard to acquirers and issuers for the use of the network. They are not capped, they are revised on published cycles, and they have grown well ahead of inflation: EuroCommerce measured a 33.9% increase in scheme fees charged to European merchants between 2018 and 2022. One acquirer's published schedule for a single market lists dozens of distinct Visa and Mastercard line items, split by merchant category and by card-present versus card-not-present.

**Acquirer or PSP markup** is the layer your contract prices. On interchange++ pricing it is visible as a separate line; on blended pricing it is folded into one rate with the two layers above, and you cannot see how much of your rate is network cost and how much is margin.

**FX** applies when the card currency, the transaction currency and the settlement currency differ. Conversion fees and cross-currency surcharges are billed as separate lines or hidden in the rate.

**Per-event fees** are charged per authorisation, 3-D Secure attempt, refund, retry and dispute. They never appear as a percentage, so they escape a rate comparison entirely.

[[figure:interchange-rates]]

## Why the regulators are involved

In March 2025 the UK Payment Systems Regulator concluded that Visa and Mastercard do not provide acquirers with "sufficiently clear and detailed information" about their fees, that queries take a long time to resolve, and that some of the largest acquirers buy external consultancy to understand what they themselves are charged. In July 2026 the regulator imposed directions requiring the schemes to publish their fee logic and to give six months' notice of new or changed fees, with compliance due in 2027. The inputs will become publishable; attributing them to your own transactions remains your problem.

## Measured, billed or modelled: know which number you are looking at

Three kinds of figures describe the same cost, and they should never be added together. A **measured** figure comes from a settlement row or a network-cost report that decomposes each charge; some acquirers provide this, mostly on interchange++ accounts. A **billed** figure comes from the invoice, classified by fee type. A **modelled** figure is an estimate built from the regulated caps, the schemes' published commitments and public fee schedules, applied to your card mix; it is what you have when the provider discloses nothing, and it should be shown as a band, not a point.

A blended-price account with no network-cost report can only be modelled. That is itself a finding: the case for asking your provider for interchange++ pricing is that it turns a modelled band into a measured line.

[[figure:three-figures]]

[[pullquote]]

## Reading your own cost by card type, market and pattern

Once each payment carries its interchange, scheme fee, markup, FX and per-event cost, the useful cuts appear: cost per card type (consumer versus commercial, debit versus credit, domestic scheme versus international), cost per market (which countries cost most to serve per euro collected, and why), cost per currency (what cross-currency acceptance costs and where local settlement would pay for itself), and cost per payment pattern (a first customer-initiated payment, a stored-card purchase, a subscription renewal, a recovered retry each carry a different full cost, and the blended rate hides the spread).

The practical output is a full cost per payment split into four destinations: acquisition (interchange and scheme), processing and FX, operations (per-event fees), and losses (fraud and disputes). When the rate moves, that split tells you which destination moved and why.
