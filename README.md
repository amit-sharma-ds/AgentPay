# AgentPay

AgentPay is an AI-powered finance and operations copilot built for **Agent{a}thon Hackathon** under the track **AI for Small Business**.

Small businesses often manage invoices, customer payments, cash flow, reports, GST tasks, and follow-ups manually. AgentPay brings these workflows into one clean dashboard where an AI copilot helps owners understand their business, act faster, and reduce daily operational load.

## Team

- Amit Sharma [NIU]
- Princy Gupta [NSUT]

## Problem Statement

Small business owners usually do not have a dedicated finance or operations team. They often struggle with:

- Tracking pending invoices
- Following up with customers for payments
- Understanding revenue, expenses, and profit
- Managing daily business tasks
- Preparing reports for GST, accounting, and decision-making
- Knowing which customer or payment needs attention first

This creates delays, missed collections, poor visibility, and extra manual work.

## Solution

AgentPay is a smart business workspace that combines payments, analytics, task management, customer data, reports, and an AI copilot.

The app helps a small business owner:

- Monitor revenue, expenses, profit, and pending invoices
- Add and manage operational tasks
- Track customers and customer value
- Generate business reports
- Simulate invoice follow-ups and AI-recommended actions
- Use an AI copilot to ask questions about invoices, cash flow, customers, and reports

## Key Features

### AI Copilot

A chat-based assistant that responds to business questions such as:

- Show invoice status
- Analyze cash flow
- Top customers report
- Generate Q2 report

The copilot shows agent-style reasoning steps before giving a final business recommendation.

### Dashboard

A central business dashboard showing:

- Monthly revenue
- Active customers
- Pending invoices
- Tasks due today
- Revenue vs expense chart
- Business health score
- Recent activity

The chart includes demo controls to add sales, add expenses, and mark collections.

### Task Management

Tasks are interactive, not just static UI.

Users can:

- Add new tasks
- Select task priority
- Click tasks to move them through statuses:
  - To Do
  - In Progress
  - Done
- Save tasks locally in the browser

### Analytics

The analytics page shows:

- Total revenue
- Total expenses
- Net profit
- Revenue vs expenses chart
- Expense breakdown
- Profit trend

Demo controls allow live changes to chart data.

### Customers

Customer management includes:

- Search customers
- Filter by VIP, active, or inactive
- View lifetime value, orders, email, and join date

### Reports

Reports section includes:

- Profit & Loss Statement
- Customer Revenue Report
- Invoice Aging Report
- GST Compliance Summary
- Custom report controls

Reports have generate/loading/ready states for a realistic demo experience.

### Settings

Business settings page includes:

- Business information
- GST number
- Email and phone
- Currency and timezone
- Notification preferences
- Plan information

Settings are saved locally in the browser.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React

## Project Structure

```txt
agentpay/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── login/
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       ├── copilot/
│   │       ├── analytics/
│   │       ├── customers/
│   │       ├── tasks/
│   │       ├── reports/
│   │       └── settings/
│   ├── lib/
│   │   ├── mockData.ts
│   │   └── utils.ts
│   └── types/
├── package.json
└── README.md
