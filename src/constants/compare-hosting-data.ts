export type ComparisonRow = {
  label: string
  /** One value per plan column, in plan order (CMS-edited rows). */
  values: string[]
  /** Values keyed by plan slug — used before `values` so columns line up whichever plans render. */
  bySlug?: Record<string, string>
}

const row = (label: string, [starter, basic, basicPlus, economy, deluxe, unlimited]: string[]): ComparisonRow => ({
  label,
  values: [starter, basicPlus, deluxe, unlimited],
  bySlug: { starter, basic, "basic-plus": basicPlus, economy, deluxe, unlimited },
})

/** Per-tier specs of the six NVMe shared plans, as on the WordPress compare page and plan cards. */
export const comparisonRows: ComparisonRow[] = [
  row("Websites", ["1", "1", "1", "5", "10", "Unlimited"]),
  row("NVMe Storage", ["1GB", "10GB", "50GB", "100GB", "150GB", "200GB"]),
  row("Bandwidth", ["5GB", "10GB", "20GB", "30GB", "50GB", "200GB"]),
  row("Email Accounts", ["10", "20", "30", "100", "100", "Unlimited"]),
  row("RAM", ["4GB", "4GB", "4GB", "4GB", "4GB", "4GB"]),
  row("vCPU Cores", ["2", "2", "2", "2", "2", "2"]),
  row("MySQL Databases", ["Unlimited", "Unlimited", "Unlimited", "Unlimited", "Unlimited", "Unlimited"]),
  row("Free SSL Certificate", ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"]),
  row("cPanel with Unlimited Subdomains", ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"]),
  row("Free JetBackup", ["Yes", "Yes", "Yes", "Yes", "Yes", "Yes"]),
  row("FTP Accounts", ["1", "1", "1", "1", "10", "Unlimited"]),
]
