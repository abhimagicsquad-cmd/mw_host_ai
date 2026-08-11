export type ComparisonRow = {
  label: string
  values: string[]
}

/** Real per-tier specs behind the marketing feature strings in pricing-plans.ts (audit §5.2). */
export const comparisonRows: ComparisonRow[] = [
  { label: "NVMe Storage", values: ["1GB", "50GB", "150GB", "200GB"] },
  { label: "Bandwidth", values: ["5GB", "20GB", "50GB", "200GB"] },
  { label: "Email Accounts", values: ["10", "30", "100", "Unlimited"] },
  { label: "RAM", values: ["4GB", "4GB", "4GB", "4GB"] },
  { label: "vCPU Cores", values: ["2", "2", "2", "2"] },
  { label: "MySQL Databases", values: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
  { label: "Free SSL Certificate", values: ["Yes", "Yes", "Yes", "Yes"] },
  { label: "cPanel Access", values: ["Yes", "Yes", "Yes", "Yes"] },
  { label: "JetBackup Snapshots", values: ["Daily", "Daily", "Daily", "Daily"] },
  { label: "FTP Accounts", values: ["1", "Unlimited", "Unlimited", "Unlimited"] },
]

export const comparisonPlanNames = ["Starter NVMe", "Basic Plus NVMe", "Deluxe NVMe", "Unlimited NVMe"] as const
