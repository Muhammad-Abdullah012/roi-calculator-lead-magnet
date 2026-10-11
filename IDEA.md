# SaaS Churn Cost Calculator

## Project Overview

A premium, interactive lead-generation calculator that helps SaaS founders and marketing agencies understand how much revenue they are losing due to customer churn.

The tool calculates:
- Monthly revenue lost to churn
- Annual revenue lost to churn
- Annual profit impact
- Estimated customers lost per month
- Wasted customer acquisition spend
- Potential revenue recovered if churn is reduced

The calculator is designed to feel like a high-end consulting tool, not a basic form.

---

## Target Audience

- SaaS founders
- Marketing agencies
- B2B consultants
- Startup operators
- Customer success teams

---

## Business Value

This project can be positioned as a client-ready lead magnet.

Potential uses:
- Agency lead-generation tool
- SaaS consulting offer
- Customer success audit funnel
- Email capture campaign
- Landing page conversion tool

The calculator helps businesses understand the financial cost of churn, then encourages them to book a call or request a retention audit.

---

## Core Concept

The user enters a few SaaS metrics:
- Monthly Recurring Revenue
- Monthly churn rate
- Gross margin
- Average revenue per account
- Customer acquisition cost
- Target churn reduction

The app calculates the estimated cost of churn and displays the results in a clean dashboard with charts.

Before showing the full results, the app can require an email address.

---

## User Flow

### Step 1: Landing Page

Headline:
"How much revenue is your SaaS losing to churn?"

Subheadline:
"Enter your SaaS metrics below to calculate your annual churn cost and discover how much revenue you could recover by improving retention."

Primary CTA:
"Calculate My Churn Cost"

---

### Step 2: Input Form

The form can be a single page or a multi-step form.

Recommended UX:
Step 1: Revenue
Step 2: Churn
Step 3: Costs
Step 4: Email capture
Step 5: Results dashboard

---

## Required Inputs

### Monthly Recurring Revenue

Label: "What is your current Monthly Recurring Revenue?"
Field: `mrr: number`
Example: `25000`
Validation: Must be greater than 0

### Monthly Churn Rate

Label: "What is your monthly churn rate?"
Field: `monthlyChurnRate: number`
Example: `5`
Helper text: "Monthly churn rate = revenue lost this month ÷ starting MRR"
Validation: Must be between 0 and 100

### Gross Margin

Label: "What is your gross margin?"
Field: `grossMarginPercent: number`
Example: `80`
Helper text: "Most SaaS companies have a gross margin between 70% and 90%."
Validation: Must be between 0 and 100

---

## Optional Inputs

### Average Revenue Per Account

Label: "What is your average revenue per account?"
Field: `arpa: number`
Example: `99`
Purpose: Used to estimate how many customers are being lost each month.
Validation: Must be greater than 0 if provided

### Customer Acquisition Cost

Label: "What is your average customer acquisition cost?"
Field: `cac: number`
Example: `300`
Purpose: Used to estimate wasted acquisition spend caused by churn.
Validation: Must be greater than 0 if provided

### Target Churn Reduction

Label: "If you could reduce churn by this percentage, what would that be worth?"
Field: `churnReductionPercent: number`
Example: `20`
Purpose: Used to show the opportunity value of improving retention.
Validation: Must be between 0 and 100

---

## Calculator Logic

### Monthly Revenue Lost
```ts
monthlyRevenueLost = mrr * (monthlyChurnRate / 100)
```

### Annual Revenue Lost
```ts
annualRevenueLost = monthlyRevenueLost * 12
```

### Annual Profit Lost
```ts
annualProfitLost = annualRevenueLost * (grossMarginPercent / 100)
```

### Customers Lost Per Month
Only calculate if `arpa` is provided.
```ts
customersLostPerMonth = monthlyRevenueLost / arpa
```

### Wasted Acquisition Spend Per Month
Only calculate if `cac` and `arpa` are provided.
```ts
wastedAcquisitionSpendPerMonth = customersLostPerMonth * cac
```

### Wasted Acquisition Spend Per Year
```ts
wastedAcquisitionSpendPerYear = wastedAcquisitionSpendPerMonth * 12
```

### Reduced Churn Rate
Only calculate if `churnReductionPercent` is provided.
```ts
reducedMonthlyChurnRate = monthlyChurnRate * (1 - churnReductionPercent / 100)
```

### New Monthly Revenue Lost After Reduction
```ts
newMonthlyRevenueLost = mrr * (reducedMonthlyChurnRate / 100)
```

### Monthly Savings
```ts
monthlySavings = monthlyRevenueLost - newMonthlyRevenueLost
```

### Annual Savings
```ts
annualSavings = monthlySavings * 12
```

---

## Example Calculation

Inputs:
- MRR: $25,000
- Monthly churn rate: 5%
- Gross margin: 80%
- Average revenue per account: $99
- Customer acquisition cost: $300
- Target churn reduction: 20%

Outputs:
- Monthly revenue lost: $1,250
- Annual revenue lost: $15,000
- Annual profit lost: $12,000
- Customers lost per month: 13
- Wasted acquisition spend per month: $3,900
- Wasted acquisition spend per year: $46,800
- Annual recoverable revenue with 20% churn reduction: $3,000

---

## Results Dashboard

The results page should feel premium and easy to understand.

### Main Metrics Cards
- Monthly Revenue Lost
- Annual Revenue Lost
- Annual Profit Lost
- Customers Lost Per Month
- Wasted Acquisition Spend
- Potential Annual Savings

---

## Charts

### Chart 1: Current Annual Revenue vs Annual Churn Loss
Type: Bar chart
Data: Current Annual Revenue, Annual Revenue Lost to Churn
Purpose: Shows the size of the churn problem compared to total revenue.

### Chart 2: 12-Month MRR Decline
Type: Line chart
Purpose: Shows how MRR declines over 12 months if churn continues and no new revenue is added.
Assumption: No new sales are included. This chart only shows churn impact.
Monthly projection logic:
```ts
for each month:
  lostMrr = startingMrr * monthlyChurnRate
  endingMrr = startingMrr - lostMrr
  startingMrr = endingMrr
```

### Chart 3: Current Churn vs Reduced Churn
Type: Line chart
Purpose: Compares the current churn trajectory against the improved churn trajectory.
Data: Current churn rate, Reduced churn rate

---

## Lead Capture

Before showing the full results, show a message: "Your churn cost report is ready."
Then ask: "Where should we send your full churn analysis?"

Fields:
- Name: optional
- Email: required
- Company: optional

Button: "Send My Report"

After submission:
1. Store the lead.
2. Send the results by email.
3. Redirect the user to the results dashboard.

---

## Email Report Contents

The email should include:
Subject: Your SaaS churn cost report

Summary:
- Monthly revenue lost
- Annual revenue lost
- Annual profit lost
- Customers lost per month
- Wasted acquisition spend
- Potential annual savings

CTA: Book a free retention audit

---

## Call to Action

At the bottom of the results page:
"Want to reduce churn and recover this revenue?"
Button: "Book a Free Retention Audit"

---

## Tech Stack

### Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion
- Recharts or Chart.js

### State Management
- React state or Zustand

### Form Validation
- Zod
- React Hook Form

### Lead Storage Options (Free/Low-cost)
- ConvertKit
- Mailchimp
- Supabase
- Airtable
- Google Sheets via webhook

### Email Sending Options
- Resend
- ConvertKit
- Mailchimp

### Deployment
- Vercel

---

## Suggested Repository Structure

```text
/src
  /app
    /page.tsx
    /results
      /page.tsx
  /components
    /calculator
      CalculatorForm.tsx
      InputField.tsx
      StepNavigation.tsx
    /results
      ResultsDashboard.tsx
      MetricCard.tsx
      ChurnBarChart.tsx
      MrrDeclineChart.tsx
      ReducedChurnChart.tsx
    /ui
      Button.tsx
      Card.tsx
      Input.tsx
      Label.tsx
  /lib
    calculator.ts
    format.ts
    validation.ts
  /types
    calculator.ts
```

---

## TypeScript Types

```ts
export type CalculatorInput = {
  mrr: number;
  monthlyChurnRate: number;
  grossMarginPercent: number;
  arpa?: number;
  cac?: number;
  churnReductionPercent?: number;
};

export type CalculatorResult = {
  monthlyRevenueLost: number;
  annualRevenueLost: number;
  annualProfitLost: number;
  customersLostPerMonth?: number;
  wastedAcquisitionSpendPerMonth?: number;
  wastedAcquisitionSpendPerYear?: number;
  annualSavingsFromChurnReduction?: number;
};
```

---

## MVP Scope

For the first weekend build, include only:

Inputs:
- MRR
- Monthly churn rate
- Gross margin
- Optional ARPA
- Optional CAC
- Optional churn reduction target

Outputs:
- Monthly revenue lost
- Annual revenue lost
- Annual profit lost
- Customers lost per month
- Wasted acquisition spend
- Potential annual savings

Features:
- Simple form validation
- Results dashboard
- Basic charts
- Email capture
- CTA section

---

## Nice-to-Have Features

Add these only if time allows:
- Currency selector
- Dark mode
- Downloadable PDF report
- Shareable results URL
- Benchmark comparison
- Industry average churn comparison
- Multiple chart themes
- Animated number counters
- UTM tracking
- Webhook integration

---

## Validation Rules

- MRR must be greater than 0
- Monthly churn rate must be between 0 and 100
- Gross margin must be between 0 and 100
- ARPA must be greater than 0 if provided
- CAC must be greater than 0 if provided
- Target churn reduction must be between 0 and 100
- Email must be valid if lead capture is enabled

---

## Edge Cases

Handle these cases:
- User enters 0 MRR
- User enters 100% churn
- User leaves optional fields blank
- User enters invalid email
- User enters negative numbers
- User enters extremely large numbers

Recommended behavior:
- Show friendly validation errors
- Disable submit button until required inputs are valid
- Use fallback values for optional calculations

---

## Deployment Checklist

- App builds successfully
- All inputs validate correctly
- All calculations display correctly
- Charts render on desktop and mobile
- Email capture submits successfully
- Results page loads after submission
- Live URL is added to portfolio
- README includes screenshots and live demo link

---
