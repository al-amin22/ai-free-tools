/**
 * State-specific legal highlights used to generate SEO content for state pages.
 * Keyed by 2-letter state code.
 */

export interface StateLawProfile {
  /** Residential lease / landlord-tenant law */
  lease: {
    govLaw:           string   // primary statute
    depositLimit:     string   // max security deposit
    depositReturn:    string   // days to return deposit
    noticeNonpayment: string   // notice to pay or quit
    noticeTermination: string  // notice to terminate month-to-month
    rentControl:      string   // rent control status
  }
  /** Eviction procedure */
  eviction: {
    govLaw:        string
    noticeNonpay:  string   // days notice for non-payment
    noticeViolation: string // days notice for lease violation
    noticeMToM:    string   // days notice to end month-to-month
    selfHelp:      string   // self-help eviction status
  }
  /** Non-compete agreements */
  nonCompete: {
    enforceability: 'void' | 'limited' | 'moderate' | 'strong'
    govLaw:         string
    summary:        string
    maxDuration:    string   // typical max enforceable duration
    keyRestriction: string   // main limitation or requirement
  }
  /** LLC formation */
  llc: {
    govLaw:        string
    filingFee:     string
    annualFee:     string   // ongoing state fee
    annualReport:  string   // annual report / statement requirement
    processingTime: string
  }
  /** Property management */
  propertyMgmt: {
    licenseRequired: boolean
    licenseType:     string
    govBody:         string
    trustAccount:    string   // trust account requirement
  }
}

export const STATE_LAWS: Partial<Record<string, StateLawProfile>> = {
  CA: {
    lease: {
      govLaw:            'California Civil Code §§ 1940–1954.1 and AB 1482 (Tenant Protection Act)',
      depositLimit:      '2 months\' rent (unfurnished); 3 months\' rent (furnished)',
      depositReturn:     '21 days after move-out',
      noticeNonpayment:  '3-Day Notice to Pay Rent or Quit',
      noticeTermination: '30 days (tenancy < 1 year); 60 days (tenancy ≥ 1 year)',
      rentControl:       'Statewide rent control applies to many units built before 2005 under AB 1482; cities like LA and San Francisco have stricter local ordinances',
    },
    eviction: {
      govLaw:          'California Code of Civil Procedure §§ 1161–1179.5',
      noticeNonpay:    '3 days',
      noticeViolation: '3 days to cure or quit',
      noticeMToM:      '30 or 60 days depending on length of tenancy',
      selfHelp:        'Illegal — landlords must use formal unlawful detainer process',
    },
    nonCompete: {
      enforceability: 'void',
      govLaw:         'California Business & Professions Code § 16600',
      summary:        'Non-compete agreements are void and unenforceable in California with very narrow exceptions for the sale of a business or dissolution of a partnership.',
      maxDuration:    'Not applicable — generally void',
      keyRestriction: 'California employees have the right to work for any employer, including competitors',
    },
    llc: {
      govLaw:         'California Corporations Code §§ 17701–17713 (Beverly-Killea Limited Liability Company Act)',
      filingFee:      '$70 (Articles of Organization)',
      annualFee:      '$800 minimum franchise tax per year',
      annualReport:   'Statement of Information every 2 years ($20)',
      processingTime: '3–5 business days (online); 6–10 weeks (by mail)',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'California Real Estate Broker or Salesperson license',
      govBody:         'California Department of Real Estate (DRE)',
      trustAccount:    'Required — all client funds must be held in a separate trust account',
    },
  },

  TX: {
    lease: {
      govLaw:            'Texas Property Code Chapter 92 (Residential Tenancies)',
      depositLimit:      'No statutory limit — market-based',
      depositReturn:     '30 days after move-out',
      noticeNonpayment:  '3-Day Notice to Vacate',
      noticeTermination: '1 month for month-to-month tenancies',
      rentControl:       'Prohibited statewide — no local rent control allowed under Texas law',
    },
    eviction: {
      govLaw:          'Texas Property Code §§ 24.001–24.011',
      noticeNonpay:    '3 days',
      noticeViolation: '3 days',
      noticeMToM:      '1 month',
      selfHelp:        'Illegal — must file in Justice of the Peace Court',
    },
    nonCompete: {
      enforceability: 'moderate',
      govLaw:         'Texas Business & Commerce Code § 15.50 (Covenants Not to Compete Act)',
      summary:        'Enforceable if ancillary to an otherwise enforceable agreement and reasonable in time, geographic scope, and activity scope.',
      maxDuration:    'Typically 2 years; courts may blue-pencil unreasonable terms',
      keyRestriction: 'Must be tied to consideration such as trade secrets, goodwill, or specialized training',
    },
    llc: {
      govLaw:         'Texas Business Organizations Code Chapter 101',
      filingFee:      '$300 (Certificate of Formation)',
      annualFee:      'No annual state fee; franchise tax applies to LLCs with revenue over $1.23M',
      annualReport:   'Public Information Report (PIR) filed annually with Comptroller',
      processingTime: '3–5 business days online',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Texas Real Estate Broker license (for leasing/managing for compensation)',
      govBody:         'Texas Real Estate Commission (TREC)',
      trustAccount:    'Required — must maintain separate trust accounts for owner funds',
    },
  },

  FL: {
    lease: {
      govLaw:            'Florida Statutes Chapter 83 (Florida Residential Landlord and Tenant Act)',
      depositLimit:      'No statutory limit — must be returned with written notice of deductions',
      depositReturn:     '15 days (no deductions) or 30 days (with deductions)',
      noticeNonpayment:  '3-Day Notice to Pay Rent or Vacate',
      noticeTermination: '15 days for week-to-week; 15 days for month-to-month',
      rentControl:       'No statewide rent control; local ordinances restricted by Florida law',
    },
    eviction: {
      govLaw:          'Florida Statutes §§ 83.56–83.625',
      noticeNonpay:    '3 days',
      noticeViolation: '7 days to cure or 7 days to quit (non-curable)',
      noticeMToM:      '15 days',
      selfHelp:        'Illegal — must file unlawful detainer action in county court',
    },
    nonCompete: {
      enforceability: 'strong',
      govLaw:         'Florida Statute § 542.335 (Florida Restrictive Covenants Act)',
      summary:        'Florida is employer-friendly — courts are required to enforce reasonable non-competes and can blue-pencil unreasonable terms rather than void them entirely.',
      maxDuration:    '2 years presumed reasonable for employees; 3 years for distributors; up to 7 years for business sale',
      keyRestriction: 'Must protect a legitimate business interest (trade secrets, substantial relationships, specialized training)',
    },
    llc: {
      govLaw:         'Florida Revised Limited Liability Company Act (Chapter 605)',
      filingFee:      '$125 (Articles of Organization)',
      annualFee:      '$138.75 annual report fee',
      annualReport:   'Annual Report due by May 1 each year',
      processingTime: '5–7 business days online',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Florida Real Estate Broker or Community Association Manager (CAM) license',
      govBody:         'Florida Department of Business and Professional Regulation (DBPR)',
      trustAccount:    'Required — advance rent and security deposits in separate escrow account',
    },
  },

  NY: {
    lease: {
      govLaw:            'New York Real Property Law §§ 220–238; Housing Stability and Tenant Protection Act of 2019',
      depositLimit:      '1 month\'s rent (effective 2019 for residential leases)',
      depositReturn:     '14 days after vacancy with itemized statement',
      noticeNonpayment:  '14-Day Demand for Payment of Rent (post-2019)',
      noticeTermination: '30 days (tenancy ≥ 1 year but < 2 years); 90 days (tenancy ≥ 2 years)',
      rentControl:       'NYC Rent Stabilization covers ~1M apartments; Rent Guidelines Board sets annual increases',
    },
    eviction: {
      govLaw:          'New York Real Property Actions and Proceedings Law (RPAPL) §§ 701–768',
      noticeNonpay:    '14 days',
      noticeViolation: '10 days to cure; 30 days to quit if incurable',
      noticeMToM:      '30–90 days depending on tenancy length',
      selfHelp:        'Illegal and criminally prosecutable — must use Housing Court',
    },
    nonCompete: {
      enforceability: 'moderate',
      govLaw:         'New York common law (no specific statute); 2023 legislation pending further developments',
      summary:        'Enforceable only if reasonable in time, geographic scope, and activity; must protect a legitimate business interest and not cause undue hardship.',
      maxDuration:    'Typically 1–2 years; courts scrutinize longer terms closely',
      keyRestriction: 'Must protect trade secrets, confidential information, or unique employee status; non-solicitation of clients more readily enforced',
    },
    llc: {
      govLaw:         'New York Limited Liability Company Law (LLCL)',
      filingFee:      '$200 (Articles of Organization)',
      annualFee:      '$9 biennial statement fee; note the LLC publication requirement (~$1,500–$2,000 in NYC)',
      annualReport:   'Biennial statement due every 2 years',
      processingTime: '7 business days standard; 2-hour expedite available for higher fee',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'New York Real Estate Broker license',
      govBody:         'New York Department of State, Division of Licensing Services',
      trustAccount:    'Required — tenant security deposits in separate interest-bearing accounts',
    },
  },

  PA: {
    lease: {
      govLaw:            'Pennsylvania Landlord and Tenant Act of 1951 (68 P.S. §§ 250.101–250.602)',
      depositLimit:      '2 months\' rent first year; 1 month\'s rent subsequent years',
      depositReturn:     '30 days after termination with itemized list',
      noticeNonpayment:  '10-Day Notice to Quit',
      noticeTermination: '30 days for month-to-month',
      rentControl:       'No statewide rent control; Philadelphia has attempted local ordinances',
    },
    eviction: {
      govLaw:          'Pennsylvania Rules of Civil Procedure, Magisterial District Courts',
      noticeNonpay:    '10 days',
      noticeViolation: '15 days to cure or quit',
      noticeMToM:      '30 days',
      selfHelp:        'Illegal — must file at local Magisterial District Court',
    },
    nonCompete: {
      enforceability: 'moderate',
      govLaw:         'Pennsylvania common law',
      summary:        'Enforceable if supported by adequate consideration and reasonable in duration and geographic scope; Pennsylvania courts apply the "blue pencil" doctrine to modify unreasonable terms.',
      maxDuration:    '1–2 years generally accepted; longer terms scrutinized',
      keyRestriction: 'Courts balance employer\'s legitimate interest against employee\'s right to work; must not be broader than necessary',
    },
    llc: {
      govLaw:         'Pennsylvania Limited Liability Company Law (15 Pa.C.S. §§ 8811–8998)',
      filingFee:      '$125 (Certificate of Organization)',
      annualFee:      'No annual state fee; decennial report every 10 years',
      annualReport:   'Decennial report required once every 10 years ($70)',
      processingTime: '7–10 business days; expedited options available',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Pennsylvania Real Estate Broker license',
      govBody:         'Pennsylvania State Real Estate Commission',
      trustAccount:    'Required — all monies received must be deposited in an escrow account',
    },
  },

  IL: {
    lease: {
      govLaw:            'Illinois Landlord-Tenant Act (765 ILCS 710–750); Chicago RLTO (Chicago Municipal Code Ch. 5-12)',
      depositLimit:      'No statewide limit; Chicago requires holding in federally insured interest-bearing account',
      depositReturn:     '30 days statewide; 21 days in Chicago',
      noticeNonpayment:  '5-Day Notice to Pay Rent or Quit',
      noticeTermination: '30 days for month-to-month',
      rentControl:       'Chicago Residential Landlord-Tenant Ordinance provides strong tenant protections; no statewide rent control',
    },
    eviction: {
      govLaw:          'Illinois Code of Civil Procedure §§ 9-201 to 9-321',
      noticeNonpay:    '5 days',
      noticeViolation: '10 days to cure or 5 days for non-curable',
      noticeMToM:      '30 days',
      selfHelp:        'Illegal — must file in Circuit Court',
    },
    nonCompete: {
      enforceability: 'limited',
      govLaw:         'Illinois Freedom to Work Act (820 ILCS 90/) effective Jan 1, 2022',
      summary:        'The Illinois Freedom to Work Act (2022) bans non-competes for employees earning under $75,000/year and non-solicitation agreements for employees earning under $45,000/year.',
      maxDuration:    'Maximum 2 years for high-earning employees',
      keyRestriction: 'Must provide consideration beyond continued employment; 14-day review period required; income thresholds apply',
    },
    llc: {
      govLaw:         'Illinois Limited Liability Company Act (805 ILCS 180)',
      filingFee:      '$150 (Articles of Organization)',
      annualFee:      '$75 annual report fee',
      annualReport:   'Annual Report due each year',
      processingTime: '10–15 business days; expedited for additional fee',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Illinois Leasing Agent or Real Estate Broker license (for compensation)',
      govBody:         'Illinois Department of Financial and Professional Regulation (IDFPR)',
      trustAccount:    'Required — security deposits in separate federally insured interest-bearing account (Chicago)',
    },
  },

  OH: {
    lease: {
      govLaw:            'Ohio Revised Code Chapter 5321 (Landlord-Tenant Law)',
      depositLimit:      'No statutory limit — market-based',
      depositReturn:     '30 days after termination',
      noticeNonpayment:  '3-Day Notice to Pay or Vacate',
      noticeTermination: '30 days for month-to-month',
      rentControl:       'No statewide rent control; Ohio law restricts local rent control ordinances',
    },
    eviction: {
      govLaw:          'Ohio Revised Code §§ 1923.01–1923.99',
      noticeNonpay:    '3 days',
      noticeViolation: '30 days to cure or quit',
      noticeMToM:      '30 days',
      selfHelp:        'Illegal — must file in Municipal or County Court',
    },
    nonCompete: {
      enforceability: 'moderate',
      govLaw:         'Ohio common law (Raimonde v. Van Vlerah standard)',
      summary:        'Ohio courts apply a "reasonableness" test. Courts may modify (blue-pencil) overly broad non-competes rather than voiding them entirely.',
      maxDuration:    '1–3 years generally accepted depending on role',
      keyRestriction: 'Must protect legitimate employer interest; reasonable in time, geography, and scope of restricted activities',
    },
    llc: {
      govLaw:         'Ohio Revised Code Chapter 1705 (Ohio Limited Liability Company Act)',
      filingFee:      '$99 (Articles of Organization)',
      annualFee:      'No annual state fee',
      annualReport:   'Biennial report not required; however, registered agent must be maintained',
      processingTime: '3–5 business days online',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Ohio Real Estate Broker or Salesperson license',
      govBody:         'Ohio Division of Real Estate and Professional Licensing',
      trustAccount:    'Required — all monies held in a separate trust/escrow account',
    },
  },

  GA: {
    lease: {
      govLaw:            'Georgia Code Title 44, Chapter 7 (Landlord-Tenant)',
      depositLimit:      'No statutory limit — must return within the required period',
      depositReturn:     '1 month after termination with itemized list',
      noticeNonpayment:  '7-Day Demand for Rent',
      noticeTermination: '30 days for month-to-month',
      rentControl:       'No statewide rent control; Georgia law prohibits local rent control ordinances',
    },
    eviction: {
      govLaw:          'Georgia Code §§ 44-7-50 to 44-7-59',
      noticeNonpay:    '7 days (Demand for Rent)',
      noticeViolation: '30 days',
      noticeMToM:      '30 days',
      selfHelp:        'Illegal — must file dispossessory warrant in Magistrate Court',
    },
    nonCompete: {
      enforceability: 'strong',
      govLaw:         'Georgia Restrictive Covenants Act (O.C.G.A. § 13-8-50 et seq.) effective 2011',
      summary:        'The 2011 Georgia Restrictive Covenants Act significantly strengthened enforcement. Courts may modify unreasonable terms. Geographic and activity-based restrictions are common.',
      maxDuration:    '2 years is the presumptive reasonable period',
      keyRestriction: 'Must protect legitimate business interests; courts will blue-pencil rather than void; requires reasonable geographic and activity scope',
    },
    llc: {
      govLaw:         'Georgia Limited Liability Company Act (O.C.G.A. §§ 14-11-100 to 14-11-1109)',
      filingFee:      '$100 (Articles of Organization)',
      annualFee:      '$50 annual registration fee',
      annualReport:   'Annual registration required between January 1 – April 1',
      processingTime: '7 business days; same-day available online for standard filings',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Georgia Real Estate Broker or Salesperson license',
      govBody:         'Georgia Real Estate Commission and Appraisers Board',
      trustAccount:    'Required — separate escrow account for client funds',
    },
  },

  NC: {
    lease: {
      govLaw:            'North Carolina General Statutes Chapter 42 (Landlord-Tenant Law)',
      depositLimit:      '2 weeks\' rent (week-to-week); 1.5 months (month-to-month); 2 months (annual lease)',
      depositReturn:     '30 days after termination',
      noticeNonpayment:  '10-Day Notice to Pay or Quit',
      noticeTermination: '7 days (week-to-week); 1 month (month-to-month)',
      rentControl:       'No statewide rent control',
    },
    eviction: {
      govLaw:          'North Carolina General Statutes §§ 42-25.6 to 42-76',
      noticeNonpay:    '10 days',
      noticeViolation: '30 days to cure',
      noticeMToM:      'Month-to-month: 7 days for week-to-week; 1 month for monthly',
      selfHelp:        'Illegal — must file summary ejectment in small claims or District Court',
    },
    nonCompete: {
      enforceability: 'moderate',
      govLaw:         'North Carolina General Statutes § 75-4 and common law',
      summary:        'Enforceable if reasonable in time, territory, and scope. North Carolina courts will blue-pencil unreasonable restrictions rather than void the entire agreement.',
      maxDuration:    '2 years considered reasonable; 5 years sometimes accepted for senior employees',
      keyRestriction: 'Must protect legitimate business interest; geographic scope must match actual business operations',
    },
    llc: {
      govLaw:         'North Carolina Limited Liability Company Act (N.C.G.S. Chapter 57D)',
      filingFee:      '$125 (Articles of Organization)',
      annualFee:      '$200 annual report fee',
      annualReport:   'Annual Report due by April 15',
      processingTime: '3–5 business days online',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'North Carolina Real Estate Broker license',
      govBody:         'North Carolina Real Estate Commission',
      trustAccount:    'Required — trust account with strict handling requirements per Commission rules',
    },
  },

  MI: {
    lease: {
      govLaw:            'Michigan Landlord-Tenant Relationships Act (MCL §§ 554.601–554.640)',
      depositLimit:      '1.5 months\' rent',
      depositReturn:     '30 days after termination',
      noticeNonpayment:  '7-Day Notice to Pay or Quit',
      noticeTermination: '1 rental period (typically 1 month) for month-to-month',
      rentControl:       'No statewide rent control; Michigan law prohibits local rent control',
    },
    eviction: {
      govLaw:          'Michigan Court Rules and MCL § 600.5701 et seq.',
      noticeNonpay:    '7 days',
      noticeViolation: '30 days to cure or 7 days for incurable',
      noticeMToM:      '1 rental period',
      selfHelp:        'Illegal — must file Summary Proceedings in District Court',
    },
    nonCompete: {
      enforceability: 'moderate',
      govLaw:         'Michigan Antitrust Reform Act (MCL § 445.774a)',
      summary:        'Enforceable if reasonable in duration, geographic scope, and type of employment or line of business. Courts have broad discretion to modify overly broad terms.',
      maxDuration:    '1–3 years typically accepted depending on industry',
      keyRestriction: 'Must be reasonable given the type of employment; courts may reform unreasonable scope',
    },
    llc: {
      govLaw:         'Michigan Limited Liability Company Act (MCL §§ 450.4101–450.5200)',
      filingFee:      '$50 (Articles of Organization)',
      annualFee:      '$25 annual statement fee',
      annualReport:   'Annual statement due each year by February 15',
      processingTime: '5–7 business days; same-day available for $50 additional fee',
    },
    propertyMgmt: {
      licenseRequired: true,
      licenseType:     'Michigan Real Estate Broker license',
      govBody:         'Michigan Department of Licensing and Regulatory Affairs (LARA)',
      trustAccount:    'Required — all client monies in separate trust account',
    },
  },
}

/** Get the law profile for a state, with a safe undefined check. */
export function getStateLaws(stateCode: string): StateLawProfile | undefined {
  return STATE_LAWS[stateCode]
}

/** Derive which law section to use based on the tool's slug. */
export function getLawSectionForTool(
  toolSlug: string
): keyof Pick<StateLawProfile, 'lease' | 'eviction' | 'nonCompete' | 'llc' | 'propertyMgmt'> {
  if (toolSlug.includes('eviction'))       return 'eviction'
  if (toolSlug.includes('non-compete'))    return 'nonCompete'
  if (toolSlug.includes('llc'))            return 'llc'
  if (toolSlug.includes('property-mgmt')) return 'propertyMgmt'
  return 'lease'  // default: lease agreement
}
