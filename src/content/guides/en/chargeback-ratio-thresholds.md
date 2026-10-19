---
title: "Chargeback ratio: staying under the card scheme thresholds"
seoTitle: "Chargeback ratio thresholds: how to stay under Visa and Mastercard limits"
description: "What the chargeback and dispute ratios are, how the card schemes' monitoring programmes and thresholds work, what a breach costs, and how to watch the ratio weekly by market and card type."
label: "Disputes"
shortTitle: "Chargeback ratio"
lede: "A chargeback is a cost three times over: the lost sale, the dispute fee, and the ratio it feeds. The ratio is the one that can hurt most, because the card schemes monitor it and a breach brings fines, remediation programmes and, at the limit, the loss of acceptance."
readingMinutes: 3
published: 2026-09-26
updated: 2026-09-26
pillar: acceptance
order: 5
locale: en
cta:
  headline: "Track your dispute and chargeback ratios by market and card type against the scheme thresholds, with the cost of each lever priced."
  text: "Oryjin continuously monitors your entire stack, from PSP and acquirer fees to scheme fees, fraud, chargebacks and orchestration, and turns it into decision-grade intelligence. Early access is open for European merchants with €10 to 200M of card payments a year."
faq:
  - q: "Is a 1% chargeback ratio safe?"
    a: "It is under Visa's 1.5% EU enforcement threshold, but close enough that a single bad month on one card type can cross it. Most merchants set an internal limit around half the published threshold and monitor by segment rather than in aggregate."
  - q: "Do refunds count as chargebacks?"
    a: "No. A refund is initiated by you; a chargeback is initiated by the cardholder's bank. Refunding quickly can prevent a dispute from being raised, which is why refund speed is one of the levers on the ratio."
related:
  - psp-fees-vs-contract
  - scheme-fees-interchange
  - psp-contract-renegotiation
  - payment-cost-forecast
author: oryjin-team
cover: threshold
pullQuote: "A ratio that is comfortable in aggregate can be at 0.9% on German Visa credit while the blended figure reads 0.4%."
takeaways:
  - "Compute the ratio yourself from raw disputes and authorisations: providers define it differently."
  - "Visa's enforcement threshold for the EU is 1.5% from April 2026. Set your own internal limit well below it."
  - "Watch it weekly, by market, card type and payment method; the blended ratio hides the cell that breaches."
  - "Fraud and non-fraud disputes have different owners and different fixes. Split them and price each lever before pulling it."
---
## How the ratio is computed, and why the definition matters

The chargeback or dispute ratio is the number of disputes in a month divided by the number of transactions, usually on the same card scheme and the same merchant identifier. The details matter: which month's transactions form the denominator, whether fraud-coded disputes are counted separately from all disputes, and whether the count is by merchant account or by legal entity. Two providers can report different ratios for the same traffic because they use different definitions. Compute yours from the raw disputes and authorisations, and reconcile it with what each provider reports.

## The scheme monitoring programmes and their thresholds

Both Visa and Mastercard run programmes that place a merchant under monitoring when its ratio and dispute count exceed published thresholds, with escalating fees the longer the merchant stays above. Visa's programme tightened its enforcement threshold to 1.5% for the EU and other regions from April 2026, with a per-dispute enforcement fee already in place. Thresholds are revised; the direction of travel has been downwards. Treat the published threshold as a ceiling you never approach, and set your own internal limit well below it.

[[figure:threshold-cells]]

## What a breach costs

Beyond the dispute fees themselves, a merchant above threshold pays programme fees per dispute, may be required to implement a remediation plan, and can face acquirer reserves or termination. The indirect cost is larger: an acquirer that sees a rising ratio prices the risk into the next contract. This is why the ratio belongs in the payment cost cockpit, next to fees and FX, rather than in a separate fraud report.

## Watch it weekly, by market and card type

A monthly ratio arrives too late to act on. Track disputes and authorisations weekly, cut by market, card type and payment method, and compare each cell to the threshold. A ratio that is comfortable in aggregate can be at 0.9% on German Visa credit while the blended figure reads 0.4%. Set alerts in absolute terms (a count and a ratio per cell) and route them to the person who can change a rule, not to a dashboard someone must remember to open.

[[pullquote]]

## Fraud disputes and non-fraud disputes are two different problems

The schemes count fraud-coded disputes and all disputes separately, and the remedies differ. A fraud dispute (the cardholder says they never made the payment) is a question of authentication and screening: 3-D Secure, velocity rules, device signals. A non-fraud dispute (the goods did not arrive, the subscription was not cancelled, the charge was not recognised) is a question of operations: delivery confirmation, cancellation flows, a descriptor the customer recognises on their statement. Reporting the two as one ratio hides which team owns the fix. Split them, price them, and give each its own threshold.

[[figure:dispute-types]]

## The levers, and what each one costs

Most levers trade one cost for another, so price them before pulling them. Tightening a 3-D Secure rule cuts fraud disputes and lowers authorisation on the same segment; the net effect is measurable. Faster refunds pre-empt disputes at the cost of refund fees. Descriptor changes and pre-dispute alerts reduce friendly-fraud disputes for a per-alert fee. Blocking a BIN range or a country removes both disputes and revenue. A change is only an improvement if the fraud and dispute losses it removes exceed the authorisation and revenue it costs, and that comparison needs both sides on the same page.
