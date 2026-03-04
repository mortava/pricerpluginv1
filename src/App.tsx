import { useState, useEffect } from 'react'
import { DollarSign, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, X, Zap, Globe, ShieldCheck, Mail, LogOut, User, HelpCircle, Send, BarChart3, Menu, MessageCircle, Sun, UserCircle, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { LoginPage } from '@/components/auth/LoginPage'
import { SignUpPage } from '@/components/auth/SignUpPage'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { validateFormBeforeSubmit } from '@/lib/PricingLogic'
// LiveChat floating bubble removed — chat accessed via sidebar
import { AdminChatPanel } from '@/components/admin-chat'

/* ── Sidebar SVG Icons (currentColor for theme adaptability) ── */
const IconNewScenario = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="11" y1="7" x2="11" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="6" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="20" cy="4" r="2" fill="currentColor"/>
  </svg>
)

const IconDealDesk = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polygon points="12,2 21,18 3,18" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="12" cy="11" r="2.5" fill="currentColor"/>
    <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const IconSubmitLoan = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="13" height="17" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="5" y1="8" x2="12" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="11" x2="12" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="5" y1="14" x2="9" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="19" y1="22" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <polyline points="15,17 19,13 23,17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconRentAvm = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <polygon points="12,2 22,9 22,22 2,22 2,9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <rect x="4" y="15" width="3" height="7" rx="0.5" fill="currentColor" opacity="0.45"/>
    <rect x="10" y="11" width="3" height="11" rx="0.5" fill="currentColor" opacity="0.75"/>
    <rect x="16" y="13" width="3" height="9" rx="0.5" fill="currentColor"/>
  </svg>
)

const IconOpenLos = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="10" rx="5" ry="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8,15 C5,17 4,21 6,22 L8,20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M16,15 C19,17 20,21 18,22 L16,20" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="9" r="2.5" fill="currentColor" opacity="0.35"/>
  </svg>
)

const IconRtlTerminal = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="1" y="3" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="8" y1="22" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <polyline points="5,8 8,11 5,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
  </svg>
)

const IconAtom = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="currentColor" strokeWidth="1.5" transform="rotate(-45 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4.5" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 12 12)" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
)

interface LoanData {
  // Loan Information
  lienPosition: string
  ltv: string
  lockPeriod: string
  loanType: string
  loanPurpose: string
  cashoutAmount: string
  loanAmount: string
  propertyValue: string
  // Location
  propertyZip: string
  propertyState: string
  propertyCounty: string
  propertyCity: string
  // Property Details
  occupancyType: string
  propertyType: string
  structureType: string
  isRuralProperty: boolean
  isNonWarrantableProject: boolean
  // Borrower Details
  creditScore: string
  isSelfEmployed: boolean
  dti: string
  citizenship: string
  isFTHB: boolean
  // Loan Terms
  loanTerm: string
  amortization: string
  product: string
  paymentType: string
  impoundType: string
  // Investor Details (conditional)
  prepayPeriod: string
  prepayType: string
  dscrEntityType: string
  dscrRatio: string
  dscrManualInput: string
  presentHousingExpense: string
  grossRent: string
  // Other Details
  isSeasonalProperty: boolean
  loanOriginatorPaidBy: string
  temporaryBuydowns: string
  isCrossCollateralized: boolean
  isMixedUsePML: boolean
  is5PlusUnits: boolean
  isShortTermRental: boolean
  isVestedInLLCOrCorp: boolean
  hasITIN: boolean
  documentationType: string
}

interface Adjustment {
  description: string
  amount: number      // Price adjustment (e.g., -1.500, 0.500)
  rateAdj?: number    // Rate adjustment (e.g., 0.000%, 0.125%)
  percentage?: number // Alternative rate field
}

interface RateOption {
  rate: number
  points: number
  apr: number
  description: string
  price?: number
  payment?: number
  miMonthlyPayment?: number
  totalClosingCost?: number
  prepaidClosingCost?: number
  nonPrepaidClosingCost?: number
  margin?: number
  dti?: number
  investorName?: string
  breakEven?: string
  reserves?: string
  lenderPaidComp?: number
  lenderPaidCompAmount?: number
  pitia?: number
  qualRate?: number
  qualPmt?: number
  cashToClose?: number
  status?: string
  adjustments?: Adjustment[]
}

interface Program {
  name: string
  status?: string
  term?: number
  due?: number
  productType?: string
  finMethT?: string
  parRate?: number
  parPoints?: number
  armIndex?: number
  armIndexName?: string
  rateOptions: RateOption[]
}

interface PricingResult {
  rate: number
  apr: number
  monthlyPayment: number
  points: number
  closingCosts: number
  ltvRatio: number
  source?: string
  programs?: Program[]
  apiError?: string
  totalPrograms?: number
  filterApplied?: string
  debug?: {
    rawProgramsFound: number
    rawRateOptionsFound: number
    formattedProgramsCount: number
    hasPricingResultsField: boolean
    xmlPreview: string
    pricingResultsPreview?: string
  }
}

type ValidationErrors = Partial<Record<keyof LoanData, string>>

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const REQUIRED_FIELDS: (keyof LoanData)[] = ['loanPurpose', 'loanAmount', 'propertyValue', 'propertyZip', 'propertyState', 'propertyType', 'occupancyType', 'creditScore', 'dti', 'loanTerm']

const FIELD_LABELS: Record<string, string> = {
  lienPosition: 'Lien Position', loanType: 'Loan Type', loanPurpose: 'Loan Purpose', loanAmount: 'Loan Amount',
  propertyValue: 'Home Value/Sales Price', propertyZip: 'ZIP Code', propertyState: 'State', propertyCounty: 'County',
  propertyCity: 'City', propertyType: 'Property Type', occupancyType: 'Property Use', creditScore: 'Credit Score',
  dti: 'DTI', loanTerm: 'Loan Term', cashoutAmount: 'Cashout Amount', structureType: 'Structure Type',
  amortization: 'Amortization', product: 'Product', paymentType: 'Payment', impoundType: 'Impound Type'
}

// ZIP code to location lookup cache (auto-populated from API + preset values)
const ZIP_LOOKUP: Record<string, { city: string; county: string; state: string }> = {
  '90210': { city: 'Beverly Hills', county: 'Los Angeles', state: 'CA' },
  '90120': { city: 'Beverly Hills', county: 'Los Angeles', state: 'CA' },
  '10001': { city: 'New York', county: 'New York', state: 'NY' },
  '33101': { city: 'Miami', county: 'Miami-Dade', state: 'FL' },
  '60601': { city: 'Chicago', county: 'Cook', state: 'IL' },
  '75201': { city: 'Dallas', county: 'Dallas', state: 'TX' },
  '85001': { city: 'Phoenix', county: 'Maricopa', state: 'AZ' },
  '98101': { city: 'Seattle', county: 'King', state: 'WA' },
}

// Helper to safely format numbers with fallback
const safeNumber = (value: unknown, fallback: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) return parsed
  }
  return fallback
}

// Sanitize and validate pricing result from API
const sanitizePricingResult = (data: unknown): PricingResult | null => {
  if (!data || typeof data !== 'object') return null

  const raw = data as Record<string, unknown>

  // Sanitize programs array
  let programs: Program[] | undefined
  if (Array.isArray(raw.programs)) {
    programs = raw.programs
      .filter((p): p is Record<string, unknown> => p && typeof p === 'object')
      .map(p => ({
        name: String(p.name || 'Unknown Program'),
        parRate: safeNumber(p.parRate),
        parPoints: safeNumber(p.parPoints),
        rateOptions: Array.isArray(p.rateOptions)
          ? p.rateOptions
              .filter((o): o is Record<string, unknown> => o && typeof o === 'object')
              .map(o => ({
                rate: safeNumber(o.rate),
                points: safeNumber(o.points),
                apr: safeNumber(o.apr),
                description: String(o.description || ''),
                payment: safeNumber(o.payment),
                adjustments: Array.isArray(o.adjustments) ? o.adjustments.map((adj: any) => ({
                  description: String(adj.description || ''),
                  amount: safeNumber(adj.amount),
                  rateAdj: safeNumber(adj.rateAdj)
                })) : []
              }))
          : []
      }))
  }

  return {
    rate: safeNumber(raw.rate, 0),
    apr: safeNumber(raw.apr, 0),
    monthlyPayment: safeNumber(raw.monthlyPayment, 0),
    points: safeNumber(raw.points, 0),
    closingCosts: safeNumber(raw.closingCosts, 0),
    ltvRatio: safeNumber(raw.ltvRatio, 0),
    source: typeof raw.source === 'string' ? raw.source : undefined,
    programs,
    apiError: typeof raw.apiError === 'string' ? raw.apiError : undefined,
    totalPrograms: typeof raw.totalPrograms === 'number' ? raw.totalPrograms : undefined,
    filterApplied: typeof raw.filterApplied === 'string' ? raw.filterApplied : undefined
  }
}

const DEFAULT_FORM_DATA: LoanData = {
  lienPosition: '1st',
  ltv: '75',
  lockPeriod: '30',
  loanType: 'nonqm',
  loanPurpose: 'purchase',
  cashoutAmount: '',
  loanAmount: '600,000',
  propertyValue: '800,000',
  propertyZip: '90210',
  propertyState: 'CA',
  propertyCounty: 'Los Angeles',
  propertyCity: 'Beverly Hills',
  occupancyType: 'primary',
  propertyType: 'sfr',
  structureType: 'detached',
  isRuralProperty: false,
  isNonWarrantableProject: false,
  creditScore: '740',
  isSelfEmployed: true,
  dti: '36',
  citizenship: 'usCitizen',
  isFTHB: false,
  loanTerm: '30',
  amortization: 'fixed',
  product: 'conventional',
  paymentType: 'pi',
  impoundType: 'escrowed',
  prepayPeriod: '36mo',
  prepayType: '5pct',
  dscrEntityType: 'individual',
  dscrRatio: '1.00-1.149',
  dscrManualInput: '1.000',
  presentHousingExpense: '5,000',
  grossRent: '5,000',
  isSeasonalProperty: false,
  loanOriginatorPaidBy: 'borrower',
  temporaryBuydowns: 'none',
  isCrossCollateralized: false,
  isMixedUsePML: false,
  is5PlusUnits: false,
  isShortTermRental: false,
  isVestedInLLCOrCorp: false,
  hasITIN: false,
  documentationType: 'fullDoc'
}

export default function App() {
  const { user, profile, isPartner, signOut } = useAuth()
  const [currentView, setCurrentView] = useState<'pricing' | 'login' | 'signup'>('pricing')
  // Help Desk state
  const [showHelpDesk, setShowHelpDesk] = useState(false)
  const [helpDeskFields, setHelpDeskFields] = useState({ name: '', email: '', topic: '', message: '' })
  const [helpDeskSending, setHelpDeskSending] = useState(false)
  const [helpDeskStatus, setHelpDeskStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const [formData, setFormData] = useState<LoanData>(DEFAULT_FORM_DATA)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PricingResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [lpResult, setLpResult] = useState<any>(null)
  const [lpLoading, setLpLoading] = useState(false)
  const [lpUnlocked, setLpUnlocked] = useState(false)
  const [lpPasscode, setLpPasscode] = useState('')
  // Secondary Admin state
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminPasscode, setAdminPasscode] = useState('')
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showEmailForm, setShowEmailForm] = useState(false)
  // Per-row action state: tracks which rate option row has an active reserve/lock form
  const [activeRowAction, setActiveRowAction] = useState<{
    type: 'reserve' | 'lock'
    programName: string
    optIdx: number
    rate: number
    price: number
    payment: number
    apr: number
    description: string
  } | null>(null)
  const [rowReserveFields, setRowReserveFields] = useState({ name: '', email: '', scenarioName: '', confirmed: false })
  const [rowLockFields, setRowLockFields] = useState({ name: '', email: '', loanNumber: '' })
  const [rowSending, setRowSending] = useState(false)
  const [rowStatus, setRowStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null) // "programName-optIdx"
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [stickyBarVisible, setStickyBarVisible] = useState(true)

  const toggleSection = (s: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  // Loading progress simulation
  useEffect(() => {
    if (!isLoading) { setLoadingProgress(0); return }
    setLoadingProgress(0)
    const steps = [
      { target: 15, delay: 200 },
      { target: 30, delay: 600 },
      { target: 50, delay: 1200 },
      { target: 65, delay: 2000 },
      { target: 78, delay: 3000 },
      { target: 88, delay: 4500 },
      { target: 94, delay: 6000 },
    ]
    const timers = steps.map(s => setTimeout(() => setLoadingProgress(s.target), s.delay))
    return () => timers.forEach(clearTimeout)
  }, [isLoading])

  // Jump to 100% when result arrives
  useEffect(() => {
    if (result && isLoading) setLoadingProgress(100)
    if (result && !isLoading) setLoadingProgress(100)
  }, [result, isLoading])

  // Close action dropdown on outside click
  useEffect(() => {
    if (!openActionDropdown) return
    const handler = () => setOpenActionDropdown(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openActionDropdown])

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return
    const handler = () => setShowUserMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showUserMenu])

  // Sticky results bar: hide on scroll down, show on scroll up (debounced)
  useEffect(() => {
    if (!result) { setStickyBarVisible(false); return }
    setStickyBarVisible(true)
    let lastScrollY = window.scrollY
    let ticking = false
    const handler = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY
        if (delta > 10 && currentY > 120) {
          setStickyBarVisible(false)
        } else if (delta < -10) {
          setStickyBarVisible(true)
        }
        lastScrollY = currentY
        ticking = false
      })
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [result])

  // Auto-populate location from ZIP using API lookup
  const [zipLoading, setZipLoading] = useState(false)
  useEffect(() => {
    if (formData.propertyZip.length === 5) {
      // First check local cache
      const cachedLocation = ZIP_LOOKUP[formData.propertyZip]
      if (cachedLocation) {
        setFormData(prev => ({
          ...prev,
          propertyCity: cachedLocation.city,
          propertyCounty: cachedLocation.county,
          propertyState: cachedLocation.state
        }))
        return
      }

      // Fetch from Zippopotam.us API (free, no key required)
      const fetchZipData = async () => {
        setZipLoading(true)
        try {
          const response = await fetch(`https://api.zippopotam.us/us/${formData.propertyZip}`)
          if (response.ok) {
            const data = await response.json()
            if (data.places && data.places.length > 0) {
              const place = data.places[0]
              setFormData(prev => ({
                ...prev,
                propertyCity: place['place name'] || '',
                propertyCounty: place['county'] || place['place name'] || '',
                propertyState: place['state abbreviation'] || ''
              }))
              // Cache the result
              ZIP_LOOKUP[formData.propertyZip] = {
                city: place['place name'] || '',
                county: place['county'] || place['place name'] || '',
                state: place['state abbreviation'] || ''
              }
            }
          }
        } catch (err) {
          console.log('ZIP lookup failed:', err)
        } finally {
          setZipLoading(false)
        }
      }
      fetchZipData()
    }
  }, [formData.propertyZip])

  const handleInputChange = (field: keyof LoanData, value: string | boolean) => {
    // Clear stale pricing results when any form field changes after pricing
    if (result) {
      setResult(null)
      setLpResult(null)
      setExpandedProgram(null)
    }

    setFormData(prev => {
      const updated = { ...prev, [field]: value }

      // Bidirectional LTV <-> Loan Amount calculation
      if (field === 'ltv' && typeof value === 'string') {
        // LTV changed -> recalculate Loan Amount
        const ltvVal = parseFloat(value) || 0
        const propVal = Number(prev.propertyValue.replace(/,/g, '')) || 0
        if (propVal > 0 && ltvVal > 0) {
          updated.loanAmount = Math.round(propVal * (ltvVal / 100)).toLocaleString()
        }
      }
      if (field === 'propertyValue' && typeof value === 'string') {
        // Property Value changed -> keep LTV, recalculate Loan Amount
        const propVal = Number(value.replace(/,/g, '')) || 0
        const ltvVal = parseFloat(prev.ltv) || 0
        if (propVal > 0 && ltvVal > 0) {
          updated.loanAmount = Math.round(propVal * (ltvVal / 100)).toLocaleString()
        }
      }
      if (field === 'loanAmount' && typeof value === 'string') {
        // Loan Amount changed -> recalculate LTV
        const loanAmt = Number(value.replace(/,/g, '')) || 0
        const propVal = Number(prev.propertyValue.replace(/,/g, '')) || 0
        if (propVal > 0 && loanAmt > 0) {
          const newLtv = (loanAmt / propVal) * 100
          updated.ltv = parseFloat(newLtv.toFixed(2)).toString()
        }
      }

      // Auto-sync documentationType when loanType changes to DSCR
      if (field === 'loanType' && value === 'dscr') {
        updated.documentationType = 'dscr'
      }
      // DSCR Income Doc Type: Auto-default occupancy to Investment (but keep loanType as nonqm)
      if (field === 'documentationType' && value === 'dscr') {
        updated.occupancyType = 'investment'
        // Keep loanType as nonqm - don't change it
      }
      // Auto-set hasITIN when citizenship is ITIN
      if (field === 'citizenship') {
        updated.hasITIN = value === 'itin'
      }
      return updated
    })
    setError(null)
    if (validationErrors[field]) {
      setValidationErrors(prev => { const next = { ...prev }; delete next[field]; return next })
    }
  }

  const formatNumberInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, '')
    return num ? Number(num).toLocaleString() : ''
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}
    REQUIRED_FIELDS.forEach(field => {
      const value = formData[field]
      if (typeof value === 'string' && (!value || value.trim() === '')) {
        errors[field] = `${FIELD_LABELS[field] || field} is required`
      }
    })
    const loanAmt = Number(formData.loanAmount.replace(/,/g, ''))
    const propVal = Number(formData.propertyValue.replace(/,/g, ''))
    if (formData.loanAmount && loanAmt < 75000) errors.loanAmount = 'Minimum loan amount is $75,000'
    if (formData.loanAmount && loanAmt > 5000000) errors.loanAmount = 'Maximum loan amount is $5,000,000'
    if (formData.propertyValue && propVal < 100000) errors.propertyValue = 'Minimum property value is $100,000'
    if (formData.propertyValue && propVal > 100000000) errors.propertyValue = 'Maximum property value is $100,000,000'
    if (formData.loanAmount && formData.propertyValue && loanAmt > propVal) errors.loanAmount = 'Loan amount cannot exceed property value'

    // LTV max 90%
    if (formData.loanAmount && formData.propertyValue && loanAmt > 0 && propVal > 0) {
      const ltv = (loanAmt / propVal) * 100
      if (ltv > 90) {
        errors.loanAmount = `Maximum LTV is 90%. Current LTV: ${ltv.toFixed(1)}%`
      }
    }

    // CRITICAL: Cash-Out Refinance LTV Validation - Max 85% LTV
    if (formData.loanPurpose === 'cashout' && loanAmt > 0 && propVal > 0) {
      const ltv = (loanAmt / propVal) * 100
      if (ltv > 85) {
        errors.loanAmount = `Cash-out refinance max LTV is 85%. Current LTV: ${ltv.toFixed(1)}%`
      }
    }

    // Small-balance loans (under $100K): ONLY allowed for Investment + DSCR + 24mo+ prepay
    if (loanAmt > 0 && loanAmt <= 99999) {
      const prepayMonths = parseInt(formData.prepayPeriod) || 0
      const scopeErrors: string[] = []

      if (formData.occupancyType !== 'investment') scopeErrors.push('Property Use must be Investment')
      if (formData.documentationType !== 'dscr') scopeErrors.push('Income Doc Type must be DSCR')
      if (prepayMonths < 24) scopeErrors.push('Prepay Period must be 24 months or more')

      if (scopeErrors.length > 0) {
        errors.loanAmount = `Scenario out of Scope — ${scopeErrors.join('; ')}`
      } else {
        // Passed scope check — enforce small-balance LTV caps
        if (propVal > 0) {
          const ltv = (loanAmt / propVal) * 100
          if (formData.loanPurpose === 'cashout' && ltv > 65) {
            errors.loanAmount = `Cash-out max LTV is 65% for loans under $100K. Current: ${ltv.toFixed(1)}%`
          } else if (ltv > 70) {
            errors.loanAmount = `Max LTV is 70% for loans under $100K. Current: ${ltv.toFixed(1)}%`
          }
        }
        // Enforce min DSCR 1.000
        const dscrVal = parseFloat(formData.dscrManualInput) || 0
        if (dscrVal > 0 && dscrVal < 1.000) {
          errors.dscrManualInput = `Min DSCR is 1.000 for loans under $100K. Current: ${dscrVal.toFixed(3)}`
        }
      }
    }

    // CRITICAL: DSCR loans are ONLY for Investment properties
    if (formData.documentationType === 'dscr' && formData.occupancyType !== 'investment') {
      errors.documentationType = 'DSCR loans are only available for Investment properties'
    }

    const creditScore = Number(formData.creditScore)
    if (formData.creditScore && (creditScore < 620 || creditScore > 999)) errors.creditScore = 'Credit score must be 620-999'
    const dti = Number(formData.dti)
    if (formData.dti && (dti < 1 || dti > 55)) errors.dti = 'DTI must be 1-55%'
    if (formData.propertyZip && formData.propertyZip.length !== 5) errors.propertyZip = 'ZIP must be 5 digits'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Calculate DSCR range from manual input
  const calculatedDSCR = (() => {
    const ratio = parseFloat(formData.dscrManualInput) || 0
    if (ratio <= 0) return { ratio: 0, range: 'noRatio', display: 'N/A' }
    let range = 'noRatio'
    if (ratio >= 1.250) range = '>=1.250'
    else if (ratio >= 1.150) range = '1.150-1.249'
    else if (ratio >= 1.000) range = '1.00-1.149'
    else if (ratio >= 0.750) range = '0.750-0.999'
    else if (ratio >= 0.500) range = '0.500-0.749'
    else range = 'noRatio'
    return { ratio, range, display: ratio.toFixed(3) }
  })()

  const handleSendEmail = async () => {
    if (!emailTo || !result) return
    setEmailSending(true)
    setEmailStatus('idle')

    const rate = targetPricing ? formatPercent(targetPricing.rate) : formatPercent(safeNumber(result.rate))
    const price = targetPricing ? targetPricing.price.toFixed(3) : '100.000'
    const apr = targetPricing ? formatPercent(targetPricing.apr) : formatPercent(safeNumber(result.apr))
    const payment = targetPricing && targetPricing.payment > 0 ? formatCurrency(targetPricing.payment) : formatCurrency(safeNumber(result.monthlyPayment))
    const points = targetPricing ? targetPricing.points.toFixed(3) : safeNumber(result.points).toFixed(3)
    const ltv = safeNumber(result.ltvRatio).toFixed(1) + '%'

    const adjustmentsHtml = targetPricing?.adjustments?.length
      ? `<table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px;">
          <tr style="background:#f8fafc;"><th style="text-align:left;padding:8px 12px;color:#64748b;font-weight:600;">Description</th><th style="text-align:right;padding:8px 12px;color:#64748b;font-weight:600;">Adjustment</th></tr>
          ${targetPricing.adjustments.map(adj => {
            const val = adj.amount || 0
            const color = val > 0 ? '#059669' : val < 0 ? '#dc2626' : '#475569'
            return `<tr style="border-top:1px solid #e2e8f0;"><td style="padding:8px 12px;color:#334155;">${adj.description}</td><td style="padding:8px 12px;text-align:right;font-weight:600;color:${color};">${val > 0 ? '+' : ''}${val.toFixed(3)}</td></tr>`
          }).join('')}
        </table>` : ''

    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);border-radius:16px;padding:32px;color:white;">
          <div style="font-size:13px;font-weight:600;color:#94a3b8;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px;">Pricing Result</div>
          <div style="font-size:42px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px;">${rate}</div>
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Interest Rate</div>
          <table style="width:100%;margin-top:20px;border-collapse:collapse;">
            <tr>
              <td style="text-align:center;padding:12px 8px;background:rgba(255,255,255,0.06);border-radius:10px;">
                <div style="font-size:18px;font-weight:700;color:white;">${price}</div>
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">Price</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:12px 8px;background:rgba(255,255,255,0.06);border-radius:10px;">
                <div style="font-size:18px;font-weight:700;color:white;">${apr}</div>
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">APR</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:12px 8px;background:rgba(255,255,255,0.06);border-radius:10px;">
                <div style="font-size:18px;font-weight:700;color:white;">${payment}</div>
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">Payment</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:12px 8px;background:rgba(255,255,255,0.06);border-radius:10px;">
                <div style="font-size:18px;font-weight:700;color:white;">${points}</div>
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">Points</div>
              </td>
              <td style="width:8px;"></td>
              <td style="text-align:center;padding:12px 8px;background:rgba(255,255,255,0.06);border-radius:10px;">
                <div style="font-size:18px;font-weight:700;color:white;">${ltv}</div>
                <div style="font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-top:2px;">LTV</div>
              </td>
            </tr>
          </table>
        </div>
        ${adjustmentsHtml ? `<div style="padding:20px 0;">${adjustmentsHtml}</div>` : ''}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">
          <div style="font-size:9px;color:#94a3b8;line-height:1.5;">&copy; OpenBroker Labs &amp; Qualr All rights reserved. We are a B2B technology platform, not a mortgage lender, broker, or loan originator. We do not make credit decisions or originate, arrange, negotiate, or fund loans. Nothing on this site is an offer or commitment to lend. By using this site, you agree to our policies. Use at your own risk. AI may be inaccurate. We are not liable for losses arising from use of this site.</div>
        </div>
      </div>`

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emailTo, subject: `Pricing Result — ${rate} Rate`, html }),
      })
      if (res.ok) {
        setEmailStatus('success')
        setTimeout(() => { setShowEmailForm(false); setEmailStatus('idle') }, 2500)
      } else {
        setEmailStatus('error')
      }
    } catch {
      setEmailStatus('error')
    } finally {
      setEmailSending(false)
    }
  }

  const buildFullPricingHtml = (extraFields: { label: string; value: string }[], headerTitle: string, rateOverride?: { rate: number; price: number; apr: number; payment: number; description: string }) => {
    // Use rateOverride (from per-row action) if provided, otherwise fall back to targetPricing/result
    const rate = rateOverride ? formatPercent(rateOverride.rate) : targetPricing ? formatPercent(targetPricing.rate) : formatPercent(safeNumber(result?.rate))
    const price = rateOverride ? rateOverride.price.toFixed(3) : targetPricing ? targetPricing.price.toFixed(3) : '100.000'
    const apr = rateOverride ? formatPercent(rateOverride.apr) : targetPricing ? formatPercent(targetPricing.apr) : formatPercent(safeNumber(result?.apr))
    const payment = rateOverride ? (rateOverride.payment > 0 ? formatCurrency(rateOverride.payment) : '—') : targetPricing && targetPricing.payment > 0 ? formatCurrency(targetPricing.payment) : formatCurrency(safeNumber(result?.monthlyPayment))
    const points = rateOverride ? (100 - rateOverride.price).toFixed(3) : targetPricing ? targetPricing.points.toFixed(3) : safeNumber(result?.points).toFixed(3)
    const ltv = safeNumber(result?.ltvRatio).toFixed(1) + '%'

    const adjHtml = !rateOverride && targetPricing?.adjustments?.length
      ? `<table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:12px;">
          <tr style="background:#f8fafc;"><th style="text-align:left;padding:6px 10px;color:#64748b;font-weight:600;">Description</th><th style="text-align:right;padding:6px 10px;color:#64748b;font-weight:600;">Adj</th></tr>
          ${targetPricing.adjustments.map(adj => {
            const val = adj.amount || 0
            const color = val > 0 ? '#059669' : val < 0 ? '#dc2626' : '#475569'
            return `<tr style="border-top:1px solid #e2e8f0;"><td style="padding:6px 10px;color:#334155;">${adj.description}</td><td style="padding:6px 10px;text-align:right;font-weight:600;color:${color};">${val > 0 ? '+' : ''}${val.toFixed(3)}</td></tr>`
          }).join('')}
        </table>` : ''

    const extraFieldsHtml = extraFields.map(f =>
      `<tr><td style="padding:6px 10px;color:#64748b;font-weight:600;white-space:nowrap;">${f.label}</td><td style="padding:6px 10px;color:#0f172a;font-weight:700;">${f.value}</td></tr>`
    ).join('')

    const loanInputs = [
      { label: 'Loan Amount', value: formatCurrency(Number(formData.loanAmount) || 0) },
      { label: 'Property Value', value: formatCurrency(Number(formData.propertyValue) || 0) },
      { label: 'Credit Score', value: formData.creditScore },
      { label: 'ZIP / State', value: `${formData.propertyZip} / ${formData.propertyState}` },
      { label: 'County / City', value: `${formData.propertyCounty || '—'} / ${formData.propertyCity || '—'}` },
      { label: 'Occupancy', value: formData.occupancyType },
      { label: 'Property Type', value: formData.propertyType },
      { label: 'Loan Purpose', value: formData.loanPurpose },
      { label: 'Doc Type', value: formData.documentationType },
      { label: 'DTI', value: formData.dti ? formData.dti + '%' : '—' },
      { label: 'Loan Term', value: formData.loanTerm },
      { label: 'Lock Period', value: formData.lockPeriod + ' days' },
      { label: 'Impound', value: formData.impoundType },
      { label: 'Citizenship', value: formData.citizenship },
    ]
    if (formData.documentationType === 'dscr') {
      loanInputs.push({ label: 'DSCR Ratio', value: formData.dscrRatio || formData.dscrManualInput || '—' })
    }
    if (formData.occupancyType === 'investment') {
      loanInputs.push({ label: 'Prepay Period', value: formData.prepayPeriod })
      loanInputs.push({ label: 'Cross-Coll', value: formData.isCrossCollateralized ? 'Yes' : 'No' })
    }
    if (formData.loanPurpose === 'cashout') {
      loanInputs.push({ label: 'Cashout Amount', value: formatCurrency(Number(formData.cashoutAmount) || 0) })
    }

    const inputsHtml = loanInputs.map(f =>
      `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:5px 10px;color:#64748b;font-size:11px;">${f.label}</td><td style="padding:5px 10px;color:#334155;font-size:11px;font-weight:600;">${f.value}</td></tr>`
    ).join('')

    return `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;background:#ffffff;">
        <div style="background:#1e40af;border-radius:12px 12px 0 0;padding:20px 24px;">
          <div style="font-size:18px;font-weight:800;color:white;letter-spacing:-0.01em;">${headerTitle}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:4px;">Generated ${new Date().toLocaleString()}</div>
        </div>
        <div style="padding:20px 24px;border:1px solid #e2e8f0;border-top:none;">
          <div style="font-size:12px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Request Details</div>
          <table style="width:100%;border-collapse:collapse;">${extraFieldsHtml}</table>
        </div>
        <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:24px;color:white;">
          <div style="font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Pricing Result</div>
          <div style="font-size:36px;font-weight:800;letter-spacing:-0.02em;margin-bottom:2px;">${rate}</div>
          <div style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.1em;">Interest Rate</div>
          <table style="width:100%;margin-top:16px;border-collapse:collapse;">
            <tr>
              <td style="text-align:center;padding:10px 6px;background:rgba(255,255,255,0.06);border-radius:8px;"><div style="font-size:16px;font-weight:700;color:white;">${price}</div><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;margin-top:2px;">Price</div></td>
              <td style="width:6px;"></td>
              <td style="text-align:center;padding:10px 6px;background:rgba(255,255,255,0.06);border-radius:8px;"><div style="font-size:16px;font-weight:700;color:white;">${apr}</div><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;margin-top:2px;">APR</div></td>
              <td style="width:6px;"></td>
              <td style="text-align:center;padding:10px 6px;background:rgba(255,255,255,0.06);border-radius:8px;"><div style="font-size:16px;font-weight:700;color:white;">${payment}</div><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;margin-top:2px;">Payment</div></td>
              <td style="width:6px;"></td>
              <td style="text-align:center;padding:10px 6px;background:rgba(255,255,255,0.06);border-radius:8px;"><div style="font-size:16px;font-weight:700;color:white;">${points}</div><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;margin-top:2px;">Points</div></td>
              <td style="width:6px;"></td>
              <td style="text-align:center;padding:10px 6px;background:rgba(255,255,255,0.06);border-radius:8px;"><div style="font-size:16px;font-weight:700;color:white;">${ltv}</div><div style="font-size:9px;color:#94a3b8;text-transform:uppercase;margin-top:2px;">LTV</div></td>
            </tr>
          </table>
        </div>
        ${adjHtml ? `<div style="padding:16px 24px;border:1px solid #e2e8f0;border-top:none;">${adjHtml}</div>` : ''}
        <div style="padding:16px 24px;border:1px solid #e2e8f0;border-top:none;background:#fafbfc;">
          <div style="font-size:12px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Loan Inputs</div>
          <table style="width:100%;border-collapse:collapse;">${inputsHtml}</table>
        </div>
        <div style="padding:16px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <div style="font-size:9px;color:#94a3b8;line-height:1.5;">&copy; OpenBroker Labs &amp; Qualr. B2B technology platform. Not a lender or broker. AI may be inaccurate.</div>
        </div>
      </div>`
  }

  // Per-row Reserve: sends the specific rate option's data
  const handleRowReserve = async () => {
    if (!result || !activeRowAction || !rowReserveFields.confirmed || !rowReserveFields.name || !rowReserveFields.email) return
    setRowSending(true)
    setRowStatus('idle')
    const { rate, price, payment, apr, description } = activeRowAction
    const rateOverride = { rate, price, apr, payment, description }
    const html = buildFullPricingHtml([
      { label: 'Name', value: rowReserveFields.name },
      { label: 'Email', value: rowReserveFields.email },
      { label: 'Scenario Name', value: rowReserveFields.scenarioName || '—' },
      { label: 'Selected Rate', value: formatPercent(rate) },
      { label: 'Selected Price', value: price.toFixed(3) },
      { label: 'Selected APR', value: formatPercent(apr) },
      { label: 'Selected Payment', value: payment > 0 ? formatCurrency(payment) : '—' },
      { label: 'Program', value: description },
    ], 'NEW QUOTE RESERVATION REQUEST', rateOverride)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'defylocks@qualr.com', subject: `RESERVATION — ${formatPercent(rate)} @ ${price.toFixed(3)}`, html }),
      })
      if (res.ok) {
        setRowStatus('success')
        setTimeout(() => { setActiveRowAction(null); setRowStatus('idle'); setRowReserveFields({ name: '', email: '', scenarioName: '', confirmed: false }) }, 2500)
      } else { setRowStatus('error') }
    } catch { setRowStatus('error') }
    finally { setRowSending(false) }
  }

  // Per-row Lock: sends the specific rate option's data
  const handleRowLock = async () => {
    if (!result || !activeRowAction || !rowLockFields.name || !rowLockFields.email || !rowLockFields.loanNumber) return
    setRowSending(true)
    setRowStatus('idle')
    const { rate, price, payment, apr, description } = activeRowAction
    const rateOverride = { rate, price, apr, payment, description }
    const html = buildFullPricingHtml([
      { label: 'Name', value: rowLockFields.name },
      { label: 'Email', value: rowLockFields.email },
      { label: 'DEFY Loan Number', value: rowLockFields.loanNumber },
      { label: 'Selected Rate', value: formatPercent(rate) },
      { label: 'Selected Price', value: price.toFixed(3) },
      { label: 'Selected APR', value: formatPercent(apr) },
      { label: 'Selected Payment', value: payment > 0 ? formatCurrency(payment) : '—' },
      { label: 'Program', value: description },
    ], 'RATE LOCK REQUEST', rateOverride)
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'defylocks@qualr.com', subject: `LOCK REQUEST — ${formatPercent(rate)} @ ${price.toFixed(3)}`, html }),
      })
      if (res.ok) {
        setRowStatus('success')
        setTimeout(() => { setActiveRowAction(null); setRowStatus('idle'); setRowLockFields({ name: '', email: '', loanNumber: '' }) }, 2500)
      } else { setRowStatus('error') }
    } catch { setRowStatus('error') }
    finally { setRowSending(false) }
  }

  // Help Desk submit handler
  const handleHelpDeskSubmit = async () => {
    if (!helpDeskFields.name || !helpDeskFields.email || !helpDeskFields.topic) return
    setHelpDeskSending(true)
    setHelpDeskStatus('idle')
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:640px;margin:0 auto;">
        <div style="background:#1e40af;border-radius:12px 12px 0 0;padding:20px 24px;">
          <div style="font-size:18px;font-weight:800;color:white;">HELP DESK REQUEST</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:4px;">Submitted ${new Date().toLocaleString()}</div>
        </div>
        <div style="padding:20px 24px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 10px;color:#64748b;font-weight:600;">Name</td><td style="padding:8px 10px;color:#0f172a;font-weight:700;">${helpDeskFields.name}</td></tr>
            <tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 10px;color:#64748b;font-weight:600;">Email</td><td style="padding:8px 10px;color:#0f172a;font-weight:700;">${helpDeskFields.email}</td></tr>
            <tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 10px;color:#64748b;font-weight:600;">Help Topic</td><td style="padding:8px 10px;color:#0f172a;font-weight:700;">${helpDeskFields.topic}</td></tr>
            ${helpDeskFields.message ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 10px;color:#64748b;font-weight:600;vertical-align:top;">Message</td><td style="padding:8px 10px;color:#0f172a;font-weight:500;white-space:pre-wrap;">${helpDeskFields.message}</td></tr>` : ''}
            ${profile ? `<tr style="border-top:1px solid #f1f5f9;"><td style="padding:8px 10px;color:#64748b;font-weight:600;">Company</td><td style="padding:8px 10px;color:#0f172a;font-weight:700;">${profile.company_name} (NMLS# ${profile.company_nmls})</td></tr>` : ''}
          </table>
        </div>
      </div>`
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'defylocks@qualr.com', subject: `HELP DESK — ${helpDeskFields.topic}`, html }),
      })
      if (res.ok) {
        setHelpDeskStatus('success')
        setTimeout(() => { setShowHelpDesk(false); setHelpDeskStatus('idle'); setHelpDeskFields({ name: '', email: '', topic: '', message: '' }) }, 2500)
      } else { setHelpDeskStatus('error') }
    } catch { setHelpDeskStatus('error') }
    finally { setHelpDeskSending(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) { setError('Please fix the errors above'); return }

    // Pre-submit validation via PricingLogic (prevents fake/invalid data from reaching API)
    const preCheck = validateFormBeforeSubmit(formData)
    if (!preCheck.isValid) {
      setError(preCheck.errors.join('. '))
      return
    }

    setIsLoading(true); setError(null); setResult(null); setLpResult(null); setLpLoading(true)
    const isDSCR = formData.documentationType === 'dscr'
    const requestBody = {
      ...formData,
      loanType: 'nonqm',
      product: 'conventional',
      loanAmount: Number(formData.loanAmount.replace(/,/g, '')),
      propertyValue: Number(formData.propertyValue.replace(/,/g, '')),
      cashoutAmount: formData.cashoutAmount ? Number(formData.cashoutAmount.replace(/,/g, '')) : 0,
      creditScore: Number(formData.creditScore),
      dti: Number(formData.dti),
      ltv: parseFloat(formData.ltv) || 0,
      presentHousingExpense: isDSCR ? Number(formData.presentHousingExpense.replace(/,/g, '')) || 5000 : undefined,
      grossRent: isDSCR ? Number(formData.grossRent.replace(/,/g, '')) || 5000 : undefined,
      dscrRatio: isDSCR ? calculatedDSCR.range : undefined,
      dscrValue: isDSCR ? calculatedDSCR.ratio : undefined
    }

    // Fire ML + LP in PARALLEL (LP takes ~20-30s via headless browser)
    const bodyJson = JSON.stringify(requestBody)

    // LP fires immediately — no waiting for ML
    fetch('/api/get-lp-pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyJson,
    })
      .then(r => r.json())
      .then(lpData => {
        console.log('[LP] rates:', lpData.data?.rateOptions?.length || 0)
        if (lpData.success && lpData.data) {
          setLpResult(lpData.data)
        } else {
          setLpResult({ rateOptions: [], error: lpData.error || 'No rates returned' })
        }
      })
      .catch(err => {
        console.error('[LP] Error:', err)
        setLpResult({ rateOptions: [], error: 'LP pricing unavailable' })
      })
      .finally(() => setLpLoading(false))

    // ML fires in parallel
    try {
      const mlResponse = await fetch('/api/get-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyJson,
      })
      const mlData = await mlResponse.json()

      if (mlData.success) {
        const sanitizedResult = sanitizePricingResult(mlData.data)
        if (sanitizedResult) {
          setResult(sanitizedResult)
        } else {
          setResult({ programs: [], mlMessage: 'Searching National Pricing' } as any)
        }
      } else {
        // ML couldn't price this scenario — show info message, don't block LP results
        setResult({ programs: [], mlMessage: 'Searching National Pricing' } as any)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get pricing')
    } finally {
      setIsLoading(false)
    }
  }

  const hasError = (field: keyof LoanData) => !!validationErrors[field]
  const showInvestorDetails = formData.occupancyType === 'investment'

  // Filter rate options to only show prices between 99.500 and 101.500
  const filterRateOptionsByPrice = (rateOptions: RateOption[]) => {
    return rateOptions.filter(opt => {
      const price = 100 - safeNumber(opt.points)
      return price >= 99.5 && price <= 101.5
    })
  }

  // Type for target pricing option
  type TargetPricingOption = {
    rate: number
    points: number
    apr: number
    price: number
    payment: number
    programName: string
    adjustments: Adjustment[]
  }

  // Helper to check if program has PPP (but 0MO PPP or 0 YR PPP means NO prepay, so allow those)
  const hasPPPInName = (text: string): boolean => {
    const upper = text.toUpperCase()
    if (upper.includes('0MO PPP') || upper.includes('0 YR PPP') || upper.includes('0YR PPP')) {
      return false
    }
    return upper.includes(' PPP') || upper.includes('YR PPP') || /\d\s*YR\s*PPP/i.test(upper)
  }

  // Map prepay period form value to PPP patterns in program names
  const matchesPrepayPeriod = (desc: string, prepayPeriod: string): boolean => {
    const upper = desc.toUpperCase()
    switch (prepayPeriod) {
      case '60mo': return upper.includes('60MO PPP') || upper.includes('5 YR PPP') || upper.includes('5YR PPP')
      case '48mo': return upper.includes('48MO PPP') || upper.includes('4 YR PPP') || upper.includes('4YR PPP')
      case '36mo': return upper.includes('36MO PPP') || upper.includes('3 YR PPP') || upper.includes('3YR PPP')
      case '24mo': return upper.includes('24MO PPP') || upper.includes('2 YR PPP') || upper.includes('2YR PPP')
      case '12mo': return upper.includes('12MO PPP') || upper.includes('1 YR PPP') || upper.includes('1YR PPP')
      case '0mo': case 'none': case '':
        // Match programs WITHOUT actual PPP (0MO/0YR are "no penalty" so also match)
        return !hasPPPInName(upper)
      default: return upper.includes('60MO PPP') || upper.includes('5 YR PPP') || upper.includes('5YR PPP')
    }
  }

  // Check if a program name matches a given prepay period
  const programMatchesPrepay = (programName: string, prepayPeriod: string): boolean => {
    return matchesPrepayPeriod(programName, prepayPeriod)
  }

  // Find the TARGET PRICING - Match user's selected prepay period for DSCR/Investment
  const getTargetPricing = (): TargetPricingOption | null => {
    if (!result?.programs || !Array.isArray(result.programs)) return null

    const isPPPAllowed = formData.occupancyType === 'investment'
    const selectedPrepay = formData.prepayPeriod || '60mo'
    let targetOption: TargetPricingOption | null = null
    let closestDistance = Infinity

    result.programs.forEach(program => {
      if (!program || !Array.isArray(program.rateOptions)) return
      const programName = program.name || 'Unknown'

      program.rateOptions.forEach(opt => {
        if (!opt) return
        const desc = (opt.description || programName).toUpperCase()
        const hasPPP = hasPPPInName(desc)

        // For Primary/Secondary homes: SKIP any PPP programs entirely
        if (!isPPPAllowed && hasPPP) return

        // For Investment properties: match the user's SELECTED prepay period
        if (isPPPAllowed) {
          if (!matchesPrepayPeriod(desc, selectedPrepay)) return
        }

        const points = safeNumber(opt.points)
        const price = 100 - points

        // Investment DSCR prepay-based price caps
        const isInvDSCR = formData.occupancyType === 'investment' && formData.documentationType === 'dscr'
        let maxPrice = 101.5
        if (isInvDSCR) {
          const prepay = formData.prepayPeriod || ''
          if (prepay === '24mo' || prepay === '2yr') maxPrice = 100.750
          else if (prepay === '12mo' || prepay === '1yr') maxPrice = 100.0
          else if (prepay === '0mo' || prepay === 'none' || prepay === '') maxPrice = 99.5
        }

        if (price >= 99.5 && price <= maxPrice) {
          const distance = Math.abs(price - 100)
          if (distance < closestDistance) {
            closestDistance = distance
            targetOption = {
              rate: safeNumber(opt.rate),
              points: points,
              apr: safeNumber(opt.apr),
              price: price,
              payment: safeNumber(opt.payment),
              programName: opt.description || programName,
              adjustments: opt.adjustments || []
            }
          }
        }
      })
    })

    // Fallback: if no match found for selected prepay, try any matching program
    if (!targetOption) {
      result.programs.forEach(program => {
        if (!program || !Array.isArray(program.rateOptions)) return
        const programName = program.name || 'Unknown'

        program.rateOptions.forEach(opt => {
          if (!opt) return
          const desc = (opt.description || programName).toUpperCase()
          const hasPPP = hasPPPInName(desc)

          if (!isPPPAllowed && hasPPP) return

          const points = safeNumber(opt.points)
          const price = 100 - points

          const isInvDSCR = formData.occupancyType === 'investment' && formData.documentationType === 'dscr'
          let maxPrice = 101.5
          if (isInvDSCR) {
            const prepay = formData.prepayPeriod || ''
            if (prepay === '24mo' || prepay === '2yr') maxPrice = 100.750
            else if (prepay === '12mo' || prepay === '1yr') maxPrice = 100.0
            else if (prepay === '0mo' || prepay === 'none' || prepay === '') maxPrice = 99.5
          }

          if (price >= 99.5 && price <= maxPrice) {
            const distance = Math.abs(price - 100)
            if (distance < closestDistance) {
              closestDistance = distance
              targetOption = {
                rate: safeNumber(opt.rate),
                points: points,
                apr: safeNumber(opt.apr),
                price: price,
                payment: safeNumber(opt.payment),
                programName: opt.description || programName,
                adjustments: opt.adjustments || []
              }
            }
          }
        })
      })
    }

    return targetOption
  }

  const targetPricing: TargetPricingOption | null = result ? getTargetPricing() : null

  // View routing: Login / SignUp pages render full-screen (no sidebar)
  if (currentView === 'login') {
    return <LoginPage onBack={() => setCurrentView('pricing')} onSignUp={() => setCurrentView('signup')} />
  }
  if (currentView === 'signup') {
    return <SignUpPage onBack={() => setCurrentView('pricing')} onLogin={() => setCurrentView('login')} />
  }

  // Auto-fill help desk fields from partner profile
  const helpDeskDefaults = profile ? { name: `${profile.first_name} ${profile.last_name}`, email: user?.email || '' } : { name: '', email: '' }


  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* ===== DESKTOP SIDEBAR (fixed, 200px) ===== */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[200px] bg-white border-r border-[rgba(39,39,42,0.15)] z-50">
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-[rgba(39,39,42,0.15)]">
          <div className="flex items-center gap-2.5">
            <IconAtom className="w-8 h-8 text-black" />
            <div className="leading-tight">
              <span className="text-[17px] font-bold tracking-[-0.02em]"><span className="text-[#000000]">Open</span><span className="text-[#34D399]">Price</span></span>
              <div className="text-[9px] text-[#A1A1AA] tracking-wide mt-0.5">Powered by DEFY TPO</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <div className="px-2 py-1 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#A1A1AA]">Tools</span>
          </div>
          {/* + New Scenario */}
          <button type="button" className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-left text-[#000000]">
            <IconNewScenario className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[13px] font-semibold truncate">New Scenario</span>
          </button>
          {/* Live Human Chat */}
          <a href="/userchat" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors">
            <User className="w-[18px] h-[18px] shrink-0 text-[#34D399]" />
            <span className="text-[13px] font-semibold truncate text-[#34D399]">Live Human Chat</span>
          </a>
          {/* TRINITY AI DEAL DESK — active */}
          <a href="https://dealr.defywholesale.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[#000000] text-white hover:opacity-90 transition-opacity">
            <IconDealDesk className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[13px] font-semibold truncate">TRINITY AI DEAL DESK</span>
          </a>
          {/* Submit a Loan — disabled */}
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-not-allowed text-[#D1D5DB]">
            <IconSubmitLoan className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[13px] truncate">Submit a Loan</span>
          </div>
          {/* Rent AVM */}
          <a href="https://app.defywholesale.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-[#000000]">
            <IconRentAvm className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[13px] truncate">Rent AVM</span>
          </a>
          {/* Help Desk — partner only */}
          {isPartner && (
            <button
              type="button"
              onClick={() => { setHelpDeskFields({ name: helpDeskDefaults.name, email: helpDeskDefaults.email, topic: '', message: '' }); setHelpDeskStatus('idle'); setShowHelpDesk(true) }}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-left text-[#000000]"
            >
              <HelpCircle className="w-[18px] h-[18px] shrink-0" />
              <span className="text-[13px] truncate">Help Desk</span>
            </button>
          )}
          {/* Launch OpenLOS — disabled */}
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-not-allowed text-[#D1D5DB]">
            <IconOpenLos className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[13px] truncate">Launch OpenLOS</span>
          </div>
          {/* RTL Terminal — disabled */}
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-not-allowed text-[#D1D5DB]">
            <IconRtlTerminal className="w-[18px] h-[18px] shrink-0" />
            <span className="text-[13px] truncate">RTL Terminal</span>
          </div>

          {/* Secondary Admin */}
          <div className="mt-3 pt-3 border-t border-[rgba(39,39,42,0.1)]">
            <div className="px-2 py-1 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#A1A1AA]">Secondary Admin</span>
            </div>
            {!adminUnlocked ? (
              <div className="flex items-center gap-2 px-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="----"
                  value={adminPasscode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setAdminPasscode(val)
                    if (val === '4040') setAdminUnlocked(true)
                  }}
                  className="w-14 h-7 text-center text-[12px] font-mono bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded text-[#71717A] outline-none focus:border-[#A1A1AA] placeholder:text-[#D1D5DB]"
                />
                <span className="text-[10px] text-[#D1D5DB]">Passcode</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAdminPanel(true)}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-left text-[#000000]"
              >
                <MessageCircle className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px] font-semibold truncate">Admin Panel</span>
              </button>
            )}
          </div>
        </nav>

        {/* User Info (login moved to top header) */}
        {isPartner && profile && (
          <div className="px-3 py-4 border-t border-[rgba(39,39,42,0.15)]">
            <div className="px-2">
              <div className="text-[12px] font-semibold text-[#000000] truncate">{profile.first_name} {profile.last_name}</div>
              <div className="text-[10px] text-[#A1A1AA] truncate">{profile.company_name}</div>
            </div>
          </div>
        )}
      </aside>

      {/* ===== MOBILE HEADER (lg:hidden) ===== */}
      <header className="lg:hidden sticky top-0 z-40 h-12 bg-white/90 backdrop-blur-xl border-b border-[rgba(39,39,42,0.15)] flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="w-8 h-8 flex items-center justify-center text-[#000000] hover:text-[#000000]"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <IconAtom className="w-6 h-6 text-black" />
          <div className="leading-tight">
            <span className="text-[15px] font-bold tracking-[-0.02em]"><span className="text-[#000000]">Open</span><span className="text-[#34D399]">Price</span></span>
            <div className="text-[8px] text-[#A1A1AA] tracking-wide">Powered by DEFY TPO</div>
          </div>
        </div>
        <div className="w-8" />
      </header>

      {/* ===== MOBILE DRAWER ===== */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-[260px] bg-white z-[201] flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[rgba(39,39,42,0.15)]">
              <div className="flex items-center gap-2">
                <IconAtom className="w-6 h-6 text-black" />
                <div className="leading-tight">
                  <span className="text-[15px] font-bold tracking-[-0.02em]"><span className="text-[#000000]">Open</span><span className="text-[#34D399]">Price</span></span>
                  <div className="text-[8px] text-[#A1A1AA] tracking-wide">Powered by DEFY TPO</div>
                </div>
              </div>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1 text-[#A1A1AA] hover:text-[#000000]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              <div className="px-2 py-1 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#A1A1AA]">Tools</span>
              </div>
              {/* + New Scenario */}
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-left text-[#000000]">
                <IconNewScenario className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px] font-semibold">New Scenario</span>
              </button>
              {/* Live Human Chat */}
              <a href="/userchat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors">
                <User className="w-[18px] h-[18px] shrink-0 text-[#34D399]" />
                <span className="text-[13px] font-semibold text-[#34D399]">Live Human Chat</span>
              </a>
              {/* TRINITY AI DEAL DESK — active */}
              <a href="https://dealr.defywholesale.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[#000000] text-white hover:opacity-90 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
                <IconDealDesk className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px] font-semibold">TRINITY AI DEAL DESK</span>
              </a>
              {/* Submit a Loan — disabled */}
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-not-allowed text-[#D1D5DB]">
                <IconSubmitLoan className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px]">Submit a Loan</span>
              </div>
              {/* Rent AVM */}
              <a href="https://app.defywholesale.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-[#000000]" onClick={() => setMobileMenuOpen(false)}>
                <IconRentAvm className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px]">Rent AVM</span>
              </a>
              {/* Help Desk — partner only */}
              {isPartner && (
                <button
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); setHelpDeskFields({ name: helpDeskDefaults.name, email: helpDeskDefaults.email, topic: '', message: '' }); setHelpDeskStatus('idle'); setShowHelpDesk(true) }}
                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-left text-[#000000]"
                >
                  <HelpCircle className="w-[18px] h-[18px] shrink-0" />
                  <span className="text-[13px]">Help Desk</span>
                </button>
              )}
              {/* Launch OpenLOS — disabled */}
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-not-allowed text-[#D1D5DB]">
                <IconOpenLos className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px]">Launch OpenLOS</span>
              </div>
              {/* RTL Terminal — disabled */}
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-not-allowed text-[#D1D5DB]">
                <IconRtlTerminal className="w-[18px] h-[18px] shrink-0" />
                <span className="text-[13px]">RTL Terminal</span>
              </div>

              {/* Secondary Admin */}
              <div className="mt-3 pt-3 border-t border-[rgba(39,39,42,0.1)]">
                <div className="px-2 py-1 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#A1A1AA]">Secondary Admin</span>
                </div>
                {!adminUnlocked ? (
                  <div className="flex items-center gap-2 px-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="----"
                      value={adminPasscode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setAdminPasscode(val)
                        if (val === '4040') setAdminUnlocked(true)
                      }}
                      className="w-14 h-7 text-center text-[12px] font-mono bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded text-[#71717A] outline-none focus:border-[#A1A1AA] placeholder:text-[#D1D5DB]"
                    />
                    <span className="text-[10px] text-[#D1D5DB]">Passcode</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); setShowAdminPanel(true) }}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] transition-colors text-left text-[#000000]"
                  >
                    <MessageCircle className="w-[18px] h-[18px] shrink-0" />
                    <span className="text-[13px] font-semibold">Admin Panel</span>
                  </button>
                )}
              </div>
            </nav>
            <div className="px-3 py-4 border-t border-[rgba(39,39,42,0.15)]">
              {isPartner && profile ? (
                <div className="space-y-2">
                  <div className="px-2">
                    <div className="text-[12px] font-semibold text-[#000000] truncate">{profile.first_name} {profile.last_name}</div>
                    <div className="text-[10px] text-[#A1A1AA] truncate">{profile.company_name}</div>
                  </div>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); signOut() }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] text-left transition-colors">
                    <LogOut className="w-3.5 h-3.5 text-[#A1A1AA]" />
                    <span className="text-[12px] text-[#71717A]">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => { setMobileMenuOpen(false); setCurrentView('login') }} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#FAFAFA] text-left transition-colors">
                  <User className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span className="text-[12px] font-semibold text-[#000000]">Partner Login</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="lg:ml-[200px] min-h-screen">

        {/* ===== DESKTOP TOP HEADER BAR ===== */}
        <div className="hidden lg:block sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[rgba(39,39,42,0.15)] px-4 lg:px-6 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-end gap-2.5">
            {isPartner && profile ? (
              <>
                <span className="text-[12px] font-medium text-[#71717A] mr-1">{profile.first_name} {profile.last_name}</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#71717A] bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] hover:bg-[#F4F4F5] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#71717A] bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] hover:bg-[#F4F4F5] transition-colors"
                >
                  <Sun className="w-3.5 h-3.5" />
                  Guest Mode
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#000000] bg-white border border-[rgba(39,39,42,0.15)] hover:bg-[#FAFAFA] transition-colors"
                >
                  <UserCircle className="w-3.5 h-3.5" />
                  Partners Login
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentView('signup')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-white bg-[#000000] border border-[#000000] hover:opacity-90 transition-opacity"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Get Approved
                </button>
              </>
            )}
          </div>
        </div>

        {/* ===== STICKY RESULTS SUMMARY BAR ===== */}
        {result && targetPricing && (
            <div
              className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[rgba(39,39,42,0.15)] px-4 lg:px-6 py-2.5 transition-all duration-200"
              style={{ transform: stickyBarVisible ? 'translateY(0)' : 'translateY(-100%)', opacity: stickyBarVisible ? 1 : 0 }}
            >
              <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#22C55E] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] px-2 py-0.5 rounded-[4px] shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />Live
                </span>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <div>
                    <span className="font-bold text-[#000000] tabular-nums">{formatPercent(targetPricing.rate)}</span>
                    <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase">Rate</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#000000] tabular-nums">{targetPricing.price.toFixed(3)}</span>
                    <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase">Price</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#000000] tabular-nums">{formatPercent(targetPricing.apr)}</span>
                    <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase">APR</span>
                  </div>
                  {targetPricing.payment > 0 && (
                    <div>
                      <span className="font-semibold text-[#000000] tabular-nums">{formatCurrency(targetPricing.payment)}</span>
                      <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase">Pmt</span>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold text-[#000000] tabular-nums">{safeNumber(result.ltvRatio).toFixed(1)}%</span>
                    <span className="text-[10px] text-[#A1A1AA] ml-1 uppercase">LTV</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* ===== FORM SECTION ===== */}
        <div className="px-4 lg:px-6 py-3 max-w-6xl mx-auto bg-white rounded-xl" style={{ border: '1px solid rgba(39,39,42,0.08)' }}>
          <form id="pricing-form" onSubmit={handleSubmit} className="space-y-3">

            {/* ===== LOAN INFORMATION SECTION ===== */}
            <div id="section-loan">
              <button type="button" onClick={() => toggleSection('loan')} className="flex items-center justify-between w-full pb-1.5 mb-2 border-b border-[rgba(39,39,42,0.15)]">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#71717A]">Loan Information</span>
                <ChevronDown className={`w-4 h-4 text-[#A1A1AA] transition-transform ${!collapsedSections.has('loan') ? 'rotate-180' : ''}`} />
              </button>
              {!collapsedSections.has('loan') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-2">
                  {/* Row 1: Lien Position, Loan Purpose, Value/Sales Price, Loan Amount, LTV, CLTV */}
                  <div className="space-y-0.5">
                    <label htmlFor="lienPosition" className="block text-[10px] font-medium text-[#000000]">Lien Position</label>
                    <Select name="lienPosition" value={formData.lienPosition} onValueChange={(v) => handleInputChange('lienPosition', v)}>
                      <SelectTrigger id="lienPosition" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st</SelectItem>
                        <SelectItem value="2nd">2nd</SelectItem>
                        <SelectItem value="heloc">HELOC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="loanPurpose" className={`block text-[10px] font-medium ${hasError('loanPurpose') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Loan Purpose *</label>
                    <Select name="loanPurpose" value={formData.loanPurpose} onValueChange={(v) => handleInputChange('loanPurpose', v)}>
                      <SelectTrigger id="loanPurpose" className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('loanPurpose') ? 'border-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="purchase">Purchase</SelectItem>
                        <SelectItem value="refinance">Refi Rate/Term</SelectItem>
                        <SelectItem value="cashout">Refinance Cashout</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError('loanPurpose') && <p className="text-[10px] text-[#EF4444]">{validationErrors.loanPurpose}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="propertyValue" className={`block text-[10px] font-medium ${hasError('propertyValue') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Value/Sales Price *</label>
                    <Input id="propertyValue" name="propertyValue" value={formData.propertyValue} onChange={(e) => handleInputChange('propertyValue', formatNumberInput(e.target.value))} icon={<DollarSign className="w-3.5 h-3.5" />} className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('propertyValue') ? 'border-red-500' : ''}`} />
                    {hasError('propertyValue') && <p className="text-[10px] text-[#EF4444]">{validationErrors.propertyValue}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="loanAmount" className={`block text-[10px] font-medium ${hasError('loanAmount') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Loan Amount *</label>
                    <Input id="loanAmount" name="loanAmount" value={formData.loanAmount} onChange={(e) => handleInputChange('loanAmount', formatNumberInput(e.target.value))} icon={<DollarSign className="w-3.5 h-3.5" />} className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('loanAmount') ? 'border-red-500' : ''}`} />
                    {hasError('loanAmount') && <p className="text-[10px] text-[#EF4444]">{validationErrors.loanAmount}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="ltv" className="block text-[10px] font-medium text-[#000000]">LTV</label>
                    <div className="relative">
                      <Input id="ltv" name="ltv" value={formData.ltv} onChange={(e) => handleInputChange('ltv', e.target.value.replace(/[^0-9.]/g, ''))} className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] pr-6 bg-[#FAFAFA]" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A1A1AA] pointer-events-none">%</span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="cltv" className="block text-[10px] font-medium text-[#000000]">CLTV</label>
                    <div id="cltv" className="h-8 px-3 py-1.5 bg-[#F3F4F6] border border-[rgba(39,39,42,0.15)] rounded-md text-xs font-medium text-[#A1A1AA] flex items-center">{formData.lienPosition !== '1st' ? 'Enter 2nd' : '—'}</div>
                  </div>
                  {/* Row 2: Term, Amortization, Payment, Impound Type, Lock Period, Cashout Amount */}
                  <div className="space-y-0.5">
                    <label htmlFor="loanTerm" className={`block text-[10px] font-medium ${hasError('loanTerm') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Term *</label>
                    <Select name="loanTerm" value={formData.loanTerm} onValueChange={(v) => handleInputChange('loanTerm', v)}>
                      <SelectTrigger id="loanTerm" className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('loanTerm') ? 'border-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Year</SelectItem>
                        <SelectItem value="25">25 Year</SelectItem>
                        <SelectItem value="20">20 Year</SelectItem>
                        <SelectItem value="15">15 Year</SelectItem>
                        <SelectItem value="10">10 Year</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError('loanTerm') && <p className="text-[10px] text-[#EF4444]">{validationErrors.loanTerm}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="amortization" className="block text-[10px] font-medium text-[#000000]">Amortization</label>
                    <Select name="amortization" value={formData.amortization} onValueChange={(v) => handleInputChange('amortization', v)}>
                      <SelectTrigger id="amortization" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="arm3">3 Year ARM</SelectItem>
                        <SelectItem value="arm5">5 Year ARM</SelectItem>
                        <SelectItem value="arm7">7 Year ARM</SelectItem>
                        <SelectItem value="arm10">10 Year ARM</SelectItem>
                        <SelectItem value="other40">Other/40 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="paymentType" className="block text-[10px] font-medium text-[#000000]">Payment</label>
                    <Select name="paymentType" value={formData.paymentType} onValueChange={(v) => handleInputChange('paymentType', v)}>
                      <SelectTrigger id="paymentType" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pi">P&I</SelectItem>
                        <SelectItem value="io">Interest Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="impoundType" className="block text-[10px] font-medium text-[#000000]">Impound Type</label>
                    <Select name="impoundType" value={formData.impoundType} onValueChange={(v) => handleInputChange('impoundType', v)}>
                      <SelectTrigger id="impoundType" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="escrowed">Taxes and Insurance Escrowed</SelectItem>
                        <SelectItem value="noescrow">No Escrow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="lockPeriod" className="block text-[10px] font-medium text-[#000000]">Lock Period</label>
                    <Select name="lockPeriod" value={formData.lockPeriod} onValueChange={(v) => handleInputChange('lockPeriod', v)}>
                      <SelectTrigger id="lockPeriod" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="45">45</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="cashoutAmount" className="block text-[10px] font-medium text-[#000000]">Cashout Amount</label>
                    <Input id="cashoutAmount" name="cashoutAmount" value={formData.cashoutAmount} onChange={(e) => handleInputChange('cashoutAmount', formatNumberInput(e.target.value))} icon={<DollarSign className="w-3.5 h-3.5" />} className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]" />
                  </div>
                </div>
              )}
            </div>

            {/* ===== PROPERTY DETAILS SECTION ===== */}
            <div id="section-property">
              <button type="button" onClick={() => toggleSection('property')} className="flex items-center justify-between w-full pb-1.5 mb-2 border-b border-[rgba(39,39,42,0.15)]">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#71717A]">Property Details</span>
                <ChevronDown className={`w-4 h-4 text-[#A1A1AA] transition-transform ${!collapsedSections.has('property') ? 'rotate-180' : ''}`} />
              </button>
              {!collapsedSections.has('property') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-2">
                  {/* Row 1: Property Use, Property Type, ZIP Code, State, County, City */}
                  <div className="space-y-0.5">
                    <label htmlFor="occupancyType" className={`block text-[10px] font-medium ${hasError('occupancyType') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Property Use *</label>
                    <Select name="occupancyType" value={formData.occupancyType} onValueChange={(v) => handleInputChange('occupancyType', v)}>
                      <SelectTrigger id="occupancyType" className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('occupancyType') ? 'border-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary Residence</SelectItem>
                        <SelectItem value="secondary">Second Home</SelectItem>
                        <SelectItem value="investment">Investment</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError('occupancyType') && <p className="text-[10px] text-[#EF4444]">{validationErrors.occupancyType}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="propertyType" className={`block text-[10px] font-medium ${hasError('propertyType') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Property Type *</label>
                    <Select name="propertyType" value={formData.propertyType} onValueChange={(v) => handleInputChange('propertyType', v)}>
                      <SelectTrigger id="propertyType" className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('propertyType') ? 'border-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sfr">Single Family</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="2unit">2 Unit</SelectItem>
                        <SelectItem value="3unit">3 Unit</SelectItem>
                        <SelectItem value="4unit">4 Unit</SelectItem>
                        <SelectItem value="5-8unit">MultiFamily 5-8</SelectItem>
                        <SelectItem value="blanket" disabled className="text-gray-400">Blanket Investor</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError('propertyType') && <p className="text-[10px] text-[#EF4444]">{validationErrors.propertyType}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="propertyZip" className={`block text-[10px] font-medium ${hasError('propertyZip') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>
                      ZIP Code * {zipLoading && <Loader2 className="w-3 h-3 inline animate-spin ml-1" />}
                    </label>
                    <Input id="propertyZip" name="propertyZip" maxLength={5} value={formData.propertyZip} onChange={(e) => handleInputChange('propertyZip', e.target.value.replace(/\D/g, ''))} className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('propertyZip') ? 'border-red-500' : ''}`} placeholder="ZIP" autoComplete="postal-code" />
                    {hasError('propertyZip') && <p className="text-[10px] text-[#EF4444]">{validationErrors.propertyZip}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="propertyState" className={`block text-[10px] font-medium ${hasError('propertyState') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>State *</label>
                    <Select name="propertyState" value={formData.propertyState} onValueChange={(v) => handleInputChange('propertyState', v)}>
                      <SelectTrigger id="propertyState" className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('propertyState') ? 'border-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    {hasError('propertyState') && <p className="text-[10px] text-[#EF4444]">{validationErrors.propertyState}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="propertyCounty" className="block text-[10px] font-medium text-[#000000]">County</label>
                    <Input id="propertyCounty" name="propertyCounty" value={formData.propertyCounty} onChange={(e) => handleInputChange('propertyCounty', e.target.value)} className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]" />
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="propertyCity" className="block text-[10px] font-medium text-[#000000]">City</label>
                    <Input id="propertyCity" name="propertyCity" value={formData.propertyCity} onChange={(e) => handleInputChange('propertyCity', e.target.value)} className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]" autoComplete="address-level2" />
                  </div>
                  {/* Row 2: Structure Type + pill toggles inline */}
                  <div className="space-y-0.5">
                    <label htmlFor="structureType" className="block text-[10px] font-medium text-[#000000]">Structure Type</label>
                    <Select name="structureType" value={formData.structureType} onValueChange={(v) => handleInputChange('structureType', v)}>
                      <SelectTrigger id="structureType" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="detached">Detached</SelectItem>
                        <SelectItem value="attached">Attached</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-5 flex flex-wrap items-end gap-2 pb-0.5">
                    <label htmlFor="isRuralProperty" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.isRuralProperty ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="isRuralProperty" name="isRuralProperty" className="sr-only" checked={formData.isRuralProperty} onChange={(e) => handleInputChange('isRuralProperty', e.target.checked)} />
                      Rural Property
                    </label>
                    <label htmlFor="isNonWarrantableProject" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.isNonWarrantableProject ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="isNonWarrantableProject" name="isNonWarrantableProject" className="sr-only" checked={formData.isNonWarrantableProject} onChange={(e) => handleInputChange('isNonWarrantableProject', e.target.checked)} />
                      Non-Warrantable
                    </label>
                    <label htmlFor="isMixedUsePML" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.isMixedUsePML ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="isMixedUsePML" name="isMixedUsePML" className="sr-only" checked={formData.isMixedUsePML} onChange={(e) => handleInputChange('isMixedUsePML', e.target.checked)} />
                      Mixed Use
                    </label>
                    <label htmlFor="is5PlusUnits" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.is5PlusUnits ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="is5PlusUnits" name="is5PlusUnits" className="sr-only" checked={formData.is5PlusUnits} onChange={(e) => handleInputChange('is5PlusUnits', e.target.checked)} />
                      5+ Units
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* ===== BORROWER DETAILS SECTION ===== */}
            <div id="section-borrower">
              <button type="button" onClick={() => toggleSection('borrower')} className="flex items-center justify-between w-full pb-1.5 mb-2 border-b border-[rgba(39,39,42,0.15)]">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#71717A]">Borrower Details</span>
                <ChevronDown className={`w-4 h-4 text-[#A1A1AA] transition-transform ${!collapsedSections.has('borrower') ? 'rotate-180' : ''}`} />
              </button>
              {!collapsedSections.has('borrower') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-2">
                  <div className="space-y-0.5">
                    <label htmlFor="creditScore" className={`block text-[10px] font-medium ${hasError('creditScore') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Credit Score *</label>
                    <Input id="creditScore" name="creditScore" maxLength={3} value={formData.creditScore} onChange={(e) => handleInputChange('creditScore', e.target.value.replace(/\D/g, ''))} className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('creditScore') ? 'border-red-500' : ''}`} />
                    {hasError('creditScore') && <p className="text-[10px] text-[#EF4444]">{validationErrors.creditScore}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="dti" className={`block text-[10px] font-medium ${hasError('dti') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>DTI % *</label>
                    <Input id="dti" name="dti" maxLength={2} value={formData.dti} onChange={(e) => handleInputChange('dti', e.target.value.replace(/\D/g, ''))} className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('dti') ? 'border-red-500' : ''}`} />
                    {hasError('dti') && <p className="text-[10px] text-[#EF4444]">{validationErrors.dti}</p>}
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="citizenship" className="block text-[10px] font-medium text-[#000000]">Citizenship</label>
                    <Select name="citizenship" value={formData.citizenship} onValueChange={(v) => handleInputChange('citizenship', v)}>
                      <SelectTrigger id="citizenship" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usCitizen">US Citizen</SelectItem>
                        <SelectItem value="permanentResident">Permanent Resident</SelectItem>
                        <SelectItem value="nonPermanentResident">Non-Permanent Resident</SelectItem>
                        <SelectItem value="foreignNational">Foreign National</SelectItem>
                        <SelectItem value="itin">ITIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-0.5">
                    <label htmlFor="documentationType" className={`block text-[10px] font-medium ${hasError('documentationType') ? 'text-[#EF4444]' : 'text-[#000000]'}`}>Doc Type</label>
                    <Select name="documentationType" value={formData.documentationType} onValueChange={(v) => handleInputChange('documentationType', v)}>
                      <SelectTrigger id="documentationType" className={`h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000] ${hasError('documentationType') ? 'border-red-500' : ''}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullDoc">Full Document</SelectItem>
                        <SelectItem value="dscr">Debt Service Coverage (DSCR)</SelectItem>
                        <SelectItem value="bankStatement12">12 Mo. Bank Statements</SelectItem>
                        <SelectItem value="bankStatement24">24 Mo. Bank Statements</SelectItem>
                        <SelectItem value="bankStatementOther">Other Bank Statements</SelectItem>
                        <SelectItem value="taxReturns1Yr">1 Yr. Tax Returns</SelectItem>
                        <SelectItem value="voe">VOE</SelectItem>
                        <SelectItem value="assetUtilization">Asset Utilization</SelectItem>
                        <SelectItem value="noRatio">No Ratio</SelectItem>
                      </SelectContent>
                    </Select>
                    {hasError('documentationType') && <p className="text-[10px] text-[#EF4444]">{validationErrors.documentationType}</p>}
                  </div>
                  <div className="col-span-full flex flex-wrap gap-2">
                    <label htmlFor="isSelfEmployed" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.isSelfEmployed ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="isSelfEmployed" name="isSelfEmployed" className="sr-only" checked={formData.isSelfEmployed} onChange={(e) => handleInputChange('isSelfEmployed', e.target.checked)} />
                      Self Employed
                    </label>
                    <label htmlFor="isFTHB" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.isFTHB ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="isFTHB" name="isFTHB" className="sr-only" checked={formData.isFTHB} onChange={(e) => handleInputChange('isFTHB', e.target.checked)} />
                      FTHB
                    </label>
                    <label htmlFor="hasITIN" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.hasITIN ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                      <input type="checkbox" id="hasITIN" name="hasITIN" className="sr-only" checked={formData.hasITIN} onChange={(e) => handleInputChange('hasITIN', e.target.checked)} />
                      Has ITIN
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* ===== INVESTOR DETAILS SECTION (conditional) ===== */}
            {showInvestorDetails && (
              <div id="section-investor">
                <button type="button" onClick={() => toggleSection('investor')} className="flex items-center justify-between w-full pb-1.5 mb-2 border-b border-[rgba(39,39,42,0.15)]">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#71717A]">Investor Details</span>
                  <ChevronDown className={`w-4 h-4 text-[#A1A1AA] transition-transform ${!collapsedSections.has('investor') ? 'rotate-180' : ''}`} />
                </button>
                {!collapsedSections.has('investor') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-2">
                    <div className="space-y-0.5">
                      <label htmlFor="prepayPeriod" className="block text-[10px] font-medium text-[#000000]">Prepay Period</label>
                      <Select name="prepayPeriod" value={formData.prepayPeriod} onValueChange={(v) => handleInputChange('prepayPeriod', v)}>
                        <SelectTrigger id="prepayPeriod" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="60mo">60 Months</SelectItem>
                          <SelectItem value="48mo">48 Months</SelectItem>
                          <SelectItem value="36mo">36 Months</SelectItem>
                          <SelectItem value="24mo">24 Months</SelectItem>
                          <SelectItem value="12mo">12 Months</SelectItem>
                          <SelectItem value="0mo">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-0.5">
                      <label htmlFor="prepayType" className="block text-[10px] font-medium text-[#000000]">Prepay Type</label>
                      <Select name="prepayType" value={formData.prepayType} onValueChange={(v) => handleInputChange('prepayType', v)}>
                        <SelectTrigger id="prepayType" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5pct">5%</SelectItem>
                          <SelectItem value="declining">Declining</SelectItem>
                          <SelectItem value="6mointerest">6 Months Interest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.documentationType === 'dscr' && (
                      <>
                        <div className="space-y-0.5">
                          <label htmlFor="dscrEntityType" className="block text-[10px] font-medium text-[#000000]">DSCR Entity Type</label>
                          <Select name="dscrEntityType" value={formData.dscrEntityType} onValueChange={(v) => handleInputChange('dscrEntityType', v)}>
                            <SelectTrigger id="dscrEntityType" className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual</SelectItem>
                              <SelectItem value="llc">LLC</SelectItem>
                              <SelectItem value="corp">Corp.</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-0.5">
                          <label htmlFor="dscrManualInput" className="block text-[10px] font-medium text-[#000000]">DSCR %</label>
                          <Input id="dscrManualInput" name="dscrManualInput" type="text" inputMode="decimal" placeholder="1.000" value={formData.dscrManualInput}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '')
                              handleInputChange('dscrManualInput', val)
                              const dscrNum = parseFloat(val) || 0
                              const staticExpense = 5000
                              const computedRent = Math.round(dscrNum * staticExpense)
                              handleInputChange('grossRent', computedRent > 0 ? computedRent.toLocaleString() : '5,000')
                              handleInputChange('presentHousingExpense', '5,000')
                            }}
                            icon={<span className="text-xs font-semibold text-gray-500">%</span>}
                            className="h-8 text-xs border-[rgba(39,39,42,0.15)] focus:ring-[#000000]"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="block text-[10px] font-medium text-[#000000]">Range</label>
                          <div className="h-8 px-3 py-1.5 bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded-md text-xs font-medium flex items-center justify-between">
                            <span className={`${calculatedDSCR.ratio >= 1.0 ? 'text-[#22C55E]' : calculatedDSCR.ratio >= 0.75 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>
                              {calculatedDSCR.display}
                            </span>
                            <span className="text-[10px] text-[#A1A1AA] ml-2">
                              ({calculatedDSCR.range === '>=1.250' ? '>=1.250' : calculatedDSCR.range === 'noRatio' ? 'No Ratio' : calculatedDSCR.range})
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="col-span-full flex flex-wrap gap-2">
                      <label htmlFor="isSeasonalProperty" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${(formData.isSeasonalProperty || formData.isShortTermRental) ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                        <input type="checkbox" id="isSeasonalProperty" name="isSeasonalProperty" className="sr-only" checked={formData.isSeasonalProperty || formData.isShortTermRental}
                          onChange={(e) => { handleInputChange('isSeasonalProperty', e.target.checked); handleInputChange('isShortTermRental', e.target.checked) }}
                        />
                        Seasonal / STR
                      </label>
                      <label htmlFor="isCrossCollateralized" className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors border ${formData.isCrossCollateralized ? 'bg-[#000000] text-white border-[#000000]' : 'bg-transparent text-[#71717A] border-[rgba(39,39,42,0.15)] hover:border-[#000000]'}`}>
                        <input type="checkbox" id="isCrossCollateralized" name="isCrossCollateralized" className="sr-only" checked={formData.isCrossCollateralized} onChange={(e) => handleInputChange('isCrossCollateralized', e.target.checked)} />
                        Cross-Collateralized
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-lg text-[#EF4444] text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* Hidden submit for Enter key */}
            <button type="submit" className="hidden" />
          </form>

          {/* Get Pricing Button */}
          <div className="mt-5 flex justify-center">
            {isLoading ? (
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Processing</span>
                  <span className="text-[11px] font-bold text-[#000000] tabular-nums">{loadingProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(39,39,42,0.1)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${loadingProgress}%`,
                      background: `linear-gradient(90deg, #D1D5DB ${0}%, #71717A ${50}%, #27272A ${100}%)`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="submit"
                form="pricing-form"
                className="w-full max-w-sm h-11 bg-[#000000] text-white font-semibold rounded-lg hover:opacity-85 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Get Pricing
              </button>
            )}
          </div>
        </div>

        {/* ===== RESULTS SECTION ===== */}
        <div className="mt-6 px-4 lg:px-6 pb-10 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Loading — shimmer skeleton placeholder */}
            {isLoading && !result && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="rounded-xl border border-[rgba(39,39,42,0.15)] bg-white p-8 space-y-4 min-h-[200px]">
                  <div className="skeleton-card h-6 w-2/5 rounded-md" />
                  <div className="skeleton-card h-4 w-3/4 rounded-md" />
                  <div className="skeleton-card h-4 w-1/2 rounded-md" />
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="skeleton-card h-12 rounded-md" />
                    <div className="skeleton-card h-12 rounded-md" />
                    <div className="skeleton-card h-12 rounded-md" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {!result && !isLoading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center min-h-[200px]">
                <BarChart3 className="w-12 h-12 text-[#71717A]/30 mb-4" />
                <p className="text-sm text-[#71717A]">Enter loan details and click Get Pricing</p>
              </motion.div>
            )}

            {/* Results */}
            {result && (
              <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">

                {/* mlMessage / Out of scope state */}
                {(result as any).mlMessage && (!Array.isArray(result.programs) || result.programs.length === 0) ? (
                  formData.isCrossCollateralized ? (
                    <div className="bg-white border border-[rgba(39,39,42,0.15)] rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-[10px] bg-[#FAFAFA] flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#000000]" />
                        </div>
                        <div className="text-sm font-semibold text-[#000000]">Pass to National Rate Card</div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#22C55E] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] px-2.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" />Verified
                        </span>
                        <span className="text-xs text-[#71717A]">Cross-Collateralized</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#71717A]">
                        <Globe className="w-3.5 h-3.5 text-[#A1A1AA]" />
                        <span>We just checked all of the Industry Leading Pricing Engines for you.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-amber-200 rounded-xl p-5">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold text-[#000000] mb-1">Scenario Out of Scope</div>
                          <p className="text-xs text-[#71717A] leading-relaxed">
                            Please check your input fields and try again. If you continue to receive this message then your details just missed our static Rate Sheet. Please fire a Scenario Details Email over to{' '}
                            <a href="mailto:defylocks@qualr.com" className="text-[#000000] font-semibold hover:underline">defylocks@qualr.com</a>{' '}
                            for a Fast Custom Quote.
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    {/* ===== HERO PRICING CARD ===== */}
                    <div className="bg-white border border-[rgba(39,39,42,0.15)] rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold uppercase tracking-widest text-[#71717A]">Best Available Rate</span>
                        <span className="bg-[rgba(34,197,94,0.08)] text-[#22C55E] border border-[rgba(34,197,94,0.2)] text-xs font-medium px-2.5 py-0.5 rounded-[4px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />Live
                        </span>
                      </div>
                      <div className="text-5xl font-bold text-[#000000] tabular-nums mb-1">
                        {targetPricing ? formatPercent(targetPricing.rate) : formatPercent(safeNumber(result.rate))}
                      </div>
                      <div className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-widest mb-5">Interest Rate</div>
                      {result.apiError && (
                        <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#EF4444] bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] px-2 py-0.5 rounded-[4px] mb-3">
                          <AlertCircle className="w-3 h-3" />Error
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-0 border-t border-[rgba(39,39,42,0.15)] pt-4">
                        <div>
                          <div className="text-base font-semibold text-[#000000] tabular-nums">{targetPricing ? targetPricing.price.toFixed(3) : '100.000'}</div>
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Price</div>
                        </div>
                        <div className="border-l border-[rgba(39,39,42,0.15)] pl-3">
                          <div className="text-base font-semibold text-[#000000] tabular-nums">{targetPricing ? formatPercent(targetPricing.apr) : formatPercent(safeNumber(result.apr))}</div>
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">APR</div>
                        </div>
                        <div className="border-l border-[rgba(39,39,42,0.15)] pl-3">
                          <div className="text-base font-semibold text-[#000000] tabular-nums">{targetPricing && targetPricing.payment > 0 ? formatCurrency(targetPricing.payment) : formatCurrency(safeNumber(result.monthlyPayment))}</div>
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Payment</div>
                        </div>
                        <div className="border-l border-[rgba(39,39,42,0.15)] pl-3">
                          <div className="text-base font-semibold text-[#000000] tabular-nums">{targetPricing ? targetPricing.points.toFixed(3) : safeNumber(result.points).toFixed(3)}</div>
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">Points</div>
                        </div>
                        <div className="border-l border-[rgba(39,39,42,0.15)] pl-3">
                          <div className="text-base font-semibold text-[#000000] tabular-nums">{safeNumber(result.ltvRatio).toFixed(1)}%</div>
                          <div className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mt-0.5">LTV</div>
                        </div>
                      </div>
                    </div>

                    {/* ===== ADJUSTMENTS CARD ===== */}
                    {targetPricing && targetPricing.adjustments && targetPricing.adjustments.length > 0 && (
                      <div className="bg-white border border-[rgba(39,39,42,0.15)] rounded-xl p-5">
                        <div className="text-xs font-semibold uppercase tracking-widest text-[#71717A] mb-3">Adjustments</div>
                        <div className="space-y-1">
                          {targetPricing.adjustments.map((adj, idx) => {
                            const rateDisplay = adj.rateAdj !== undefined ? adj.rateAdj : (adj.percentage !== undefined ? adj.percentage : 0)
                            const priceDisplay = adj.amount || 0
                            return (
                              <div key={idx} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-[#FAFAFA] transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <span className="text-xs text-[#A1A1AA] tabular-nums w-14 shrink-0">{rateDisplay.toFixed(3)}%</span>
                                  <span className="text-xs text-[#000000] truncate">{adj.description}</span>
                                </div>
                                <span className={`text-xs font-semibold tabular-nums ml-3 ${priceDisplay > 0 ? 'text-[#22C55E]' : priceDisplay < 0 ? 'text-[#EF4444]' : 'text-[#A1A1AA]'}`}>
                                  {priceDisplay > 0 ? '+' : ''}{priceDisplay.toFixed(3)}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* ===== EMAIL FORM ===== */}
                    {showEmailForm && (
                      <div className="bg-white border border-[rgba(39,39,42,0.15)] rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Mail className="w-4 h-4 text-[#A1A1AA] shrink-0" />
                          <input
                            type="email"
                            placeholder="Enter email address"
                            value={emailTo}
                            onChange={(e) => setEmailTo(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendEmail() } }}
                            className="flex-1 min-w-0 text-sm bg-transparent outline-none placeholder:text-[#D1D5DB] text-[#000000]"
                            autoFocus
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={emailSending || !emailTo}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-[#000000] rounded-lg hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : emailStatus === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            {emailSending ? 'Sending...' : emailStatus === 'success' ? 'Sent!' : 'Send'}
                          </button>
                          <button type="button" onClick={() => { setShowEmailForm(false); setEmailStatus('idle') }} className="p-2 text-[#A1A1AA] hover:text-[#000000] transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {emailStatus === 'error' && <p className="text-xs text-[#EF4444] sm:ml-6">Failed to send. Please try again.</p>}
                      </div>
                    )}

                    {/* ===== AVAILABLE PROGRAMS ===== */}
                    {Array.isArray(result.programs) && result.programs.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-[#000000]">Available Programs</h3>
                          <span className="text-[11px] font-medium text-[#71717A] bg-[#F3F4F6] px-2 py-0.5 rounded-full">
                            {result.programs.filter(p => p && Array.isArray(p.rateOptions) && filterRateOptionsByPrice(p.rateOptions).length > 0).length} found
                          </span>
                        </div>
                        {result.programs.map((program, idx) => {
                          if (!program || typeof program !== 'object') return null
                          const allRateOptions = Array.isArray(program.rateOptions) ? program.rateOptions : []
                          const filteredRateOptions = filterRateOptionsByPrice(allRateOptions)
                          if (filteredRateOptions.length === 0) return null

                          const programName = program.name || `Program ${idx + 1}`
                          const bestRate = filteredRateOptions.reduce((best, opt) => {
                            const price = 100 - safeNumber(opt.points)
                            const bestPrice = best ? 100 - safeNumber(best.points) : Infinity
                            return Math.abs(price - 100) < Math.abs(bestPrice - 100) ? opt : best
                          }, filteredRateOptions[0])
                          const bestPayment = bestRate ? safeNumber(bestRate.payment) : 0
                          const isExpanded = expandedProgram === programName
                          const isSelectedPrepay = formData.occupancyType === 'investment' && programMatchesPrepay(programName, formData.prepayPeriod)

                          return (
                            <div key={idx} className={`rounded-xl overflow-hidden border transition-all bg-white ${isSelectedPrepay ? 'border-[#000000] shadow-[0_1px_3px_rgba(0,0,0,0.04)]' : isExpanded ? 'border-[#D1D5DB] shadow-[0_1px_3px_rgba(0,0,0,0.04)]' : 'border-[rgba(39,39,42,0.15)]'}`}>
                              <div className="px-4 py-3">
                                <div className="flex items-center justify-between mb-2.5">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="font-semibold text-[13px] text-[#000000] truncate">{programName}</div>
                                      {isSelectedPrepay && (
                                        <span className="shrink-0 text-[9px] font-bold text-[#000000] bg-[#F3F4F6] px-1.5 py-0.5 rounded uppercase tracking-wider">Selected Prepay</span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-[#A1A1AA] mt-0.5">{filteredRateOptions.length} rate option{filteredRateOptions.length !== 1 ? 's' : ''}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setShowEmailForm(!showEmailForm) }}
                                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-[#000000] bg-white border border-[rgba(39,39,42,0.15)] rounded-lg hover:bg-[#FAFAFA] transition-all"
                                    >
                                      <Mail className="w-3 h-3" />Email Results
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedProgram(isExpanded ? null : programName)}
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${isExpanded ? 'text-[#000000] bg-[#F3F4F6] border border-[#D1D5DB]' : 'text-[#71717A] bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] hover:bg-[#F3F4F6]'}`}
                                    >
                                      MORE PRICING
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  <div>
                                    <div className="text-lg font-bold text-[#000000] tabular-nums">{bestRate ? safeNumber(bestRate.rate).toFixed(3) : '-'}%</div>
                                    <div className="text-[10px] font-medium text-[#A1A1AA] uppercase tracking-wider">Rate</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-[#000000] tabular-nums">{bestRate ? (100 - safeNumber(bestRate.points)).toFixed(3) : '-'}</div>
                                    <div className="text-[10px] font-medium text-[#A1A1AA] uppercase tracking-wider">Price</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-[#000000] tabular-nums">{bestRate ? safeNumber(bestRate.apr).toFixed(3) : '-'}%</div>
                                    <div className="text-[10px] font-medium text-[#A1A1AA] uppercase tracking-wider">APR</div>
                                  </div>
                                  <div>
                                    <div className="text-lg font-bold text-[#000000] tabular-nums">{bestPayment > 0 ? formatCurrency(bestPayment) : '-'}</div>
                                    <div className="text-[10px] font-medium text-[#A1A1AA] uppercase tracking-wider">Payment</div>
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Rate Options */}
                              {isExpanded && filteredRateOptions.length > 0 && (
                                <div className="border-t border-[rgba(39,39,42,0.15)]">
                                  {/* Desktop table */}
                                  <div className="hidden sm:block px-4 py-2 overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="text-[#A1A1AA] border-b border-[rgba(39,39,42,0.15)] text-[10px] uppercase tracking-wider">
                                          <th className="text-left py-2 pr-2 font-medium">Actions</th>
                                          <th className="text-left py-2 pr-2 font-medium">Program/PPP</th>
                                          <th className="text-right py-2 px-2 font-medium">Rate</th>
                                          <th className="text-right py-2 px-2 font-medium">Price</th>
                                          <th className="text-right py-2 px-2 font-medium">Points</th>
                                          <th className="text-right py-2 px-2 font-medium">APR</th>
                                          <th className="text-right py-2 px-2 font-medium">Payment</th>
                                          <th className="text-right py-2 pl-2 font-medium">Adj</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredRateOptions.map((opt, optIdx) => {
                                          if (!opt || typeof opt !== 'object') return null
                                          const points = safeNumber(opt.points)
                                          const price = safeNumber(opt.price) || (100 - points)
                                          const pointsDisplay = points >= 0 ? `(${points.toFixed(3)})` : `+${Math.abs(points).toFixed(3)}`
                                          const isClosestTo100 = bestRate === opt
                                          const payment = safeNumber(opt.payment)
                                          const adjustments = opt.adjustments || []
                                          const totalAdjustment = adjustments.reduce((sum, adj) => sum + (adj.amount || 0), 0)
                                          const isActiveRow = activeRowAction?.programName === programName && activeRowAction?.optIdx === optIdx
                                          return (
                                            <tr key={optIdx} className={`border-t border-[rgba(39,39,42,0.15)] ${isClosestTo100 ? 'bg-[#FAFAFA]' : ''} ${isActiveRow ? 'bg-yellow-50/50' : ''}`}>
                                              <td className="py-2 pr-2 text-left">
                                                <div className="relative">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      const key = `${programName}-${optIdx}`
                                                      setOpenActionDropdown(openActionDropdown === key ? null : key)
                                                    }}
                                                    className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-white bg-[#000000] rounded hover:opacity-85 transition-colors whitespace-nowrap"
                                                  >
                                                    Actions <ChevronDown className={`w-3 h-3 transition-transform ${openActionDropdown === `${programName}-${optIdx}` ? 'rotate-180' : ''}`} />
                                                  </button>
                                                  {openActionDropdown === `${programName}-${optIdx}` && (
                                                    <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[rgba(39,39,42,0.15)] py-1 min-w-[180px]">
                                                      <button
                                                        type="button"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          setActiveRowAction(isActiveRow && activeRowAction?.type === 'reserve' ? null : {
                                                            type: 'reserve', programName, optIdx,
                                                            rate: safeNumber(opt.rate), price, payment,
                                                            apr: safeNumber(opt.apr), description: opt.description || programName
                                                          })
                                                          setRowReserveFields({ name: '', email: '', scenarioName: '', confirmed: false })
                                                          setRowStatus('idle')
                                                          setOpenActionDropdown(null)
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-[11px] font-semibold text-[#000000] hover:bg-[#FAFAFA] transition-colors"
                                                      >
                                                        Reserve Pricing
                                                      </button>
                                                      {isPartner && (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            setActiveRowAction(isActiveRow && activeRowAction?.type === 'lock' ? null : {
                                                              type: 'lock', programName, optIdx,
                                                              rate: safeNumber(opt.rate), price, payment,
                                                              apr: safeNumber(opt.apr), description: opt.description || programName
                                                            })
                                                            setRowLockFields({ name: '', email: '', loanNumber: '' })
                                                            setRowStatus('idle')
                                                            setOpenActionDropdown(null)
                                                          }}
                                                          className="w-full text-left px-3 py-2 text-[11px] font-semibold text-[#000000] hover:bg-[#FAFAFA] transition-colors"
                                                        >
                                                          Request Lock
                                                        </button>
                                                      )}
                                                      {isPartner && (
                                                        <a
                                                          href="https://sub.defywholesale.com/"
                                                          target="_blank"
                                                          rel="noopener noreferrer"
                                                          onClick={(e) => { e.stopPropagation(); setOpenActionDropdown(null) }}
                                                          className="block w-full text-left px-3 py-2 text-[11px] font-semibold text-[#71717A] hover:bg-[#FAFAFA] transition-colors no-underline"
                                                        >
                                                          Select Rate + Submit File
                                                        </a>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </td>
                                              <td className="py-2 pr-2 text-left"><div className="max-w-[220px] truncate font-medium text-[#000000]" title={opt.description || ''}>{opt.description || programName}</div></td>
                                              <td className="py-2 px-2 text-right font-semibold text-[#000000] tabular-nums">{safeNumber(opt.rate).toFixed(3)}%</td>
                                              <td className={`py-2 px-2 text-right tabular-nums ${price >= 100 ? 'text-[#22C55E] font-medium' : 'text-[#000000]'}`}>{price.toFixed(3)}</td>
                                              <td className={`py-2 px-2 text-right tabular-nums ${points < 0 ? 'text-[#22C55E]' : 'text-[#71717A]'}`}>{pointsDisplay}</td>
                                              <td className="py-2 px-2 text-right tabular-nums text-[#000000]">{safeNumber(opt.apr).toFixed(3)}%</td>
                                              <td className="py-2 px-2 text-right font-medium tabular-nums text-[#000000]">{payment > 0 ? formatCurrency(payment) : '-'}</td>
                                              <td className="py-2 pl-2 text-right tabular-nums">
                                                {adjustments.length > 0 ? (
                                                  <span className={totalAdjustment >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                                                    {totalAdjustment >= 0 ? '+' : ''}{totalAdjustment.toFixed(3)}
                                                  </span>
                                                ) : '-'}
                                              </td>
                                            </tr>
                                          )
                                        })}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Per-row action form */}
                                  {activeRowAction && activeRowAction.programName === programName && (
                                    <div className="mx-4 mb-3 mt-1 border border-[rgba(39,39,42,0.15)] rounded-xl p-4 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                                      <div className="flex items-center justify-between mb-3">
                                        <div>
                                          <div className="text-sm font-bold text-[#000000]">
                                            {activeRowAction.type === 'reserve' ? 'Reserve Rate & Pricing' : 'Request Rate Lock'}
                                          </div>
                                          <div className="text-[11px] text-[#71717A] mt-0.5">
                                            {formatPercent(activeRowAction.rate)} @ {activeRowAction.price.toFixed(3)} &mdash; {activeRowAction.description}
                                          </div>
                                        </div>
                                        <button type="button" onClick={() => { setActiveRowAction(null); setRowStatus('idle') }} className="p-1 text-[#A1A1AA] hover:text-[#000000] transition-colors">
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>

                                      {activeRowAction.type === 'reserve' ? (
                                        <div className="space-y-3">
                                          <p className="text-xs text-[#71717A] leading-relaxed max-w-md">
                                            Confirm you would like to reserve this Rate &amp; Pricing. This quote expires after 48 hours unless a full file is submitted.
                                          </p>
                                          <label className="flex items-start gap-2 cursor-pointer">
                                            <input type="checkbox" checked={rowReserveFields.confirmed} onChange={(e) => setRowReserveFields(prev => ({ ...prev, confirmed: e.target.checked }))} className="mt-0.5 w-4 h-4 rounded border-[#D1D5DB] text-[#000000] focus:ring-[#000000]" />
                                            <span className="text-xs text-[#000000] leading-relaxed">I confirm and understand the 48-hour expiration policy</span>
                                          </label>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input type="text" placeholder="Your Name *" value={rowReserveFields.name} onChange={(e) => setRowReserveFields(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(39,39,42,0.15)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                                            <input type="email" placeholder="Email *" value={rowReserveFields.email} onChange={(e) => setRowReserveFields(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(39,39,42,0.15)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                                            <input type="text" placeholder="Scenario Name" value={rowReserveFields.scenarioName} onChange={(e) => setRowReserveFields(prev => ({ ...prev, scenarioName: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(39,39,42,0.15)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <button type="button" onClick={handleRowReserve} disabled={rowSending || !rowReserveFields.confirmed || !rowReserveFields.name || !rowReserveFields.email} className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-[#000000] rounded-lg hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                              {rowSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : rowStatus === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                                              {rowSending ? 'Sending...' : rowStatus === 'success' ? 'Sent!' : 'Send Reservation'}
                                            </button>
                                            {rowStatus === 'error' && <p className="text-xs text-[#EF4444]">Failed to send. Please try again.</p>}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input type="text" placeholder="Your Name *" value={rowLockFields.name} onChange={(e) => setRowLockFields(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(39,39,42,0.15)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                                            <input type="email" placeholder="Email *" value={rowLockFields.email} onChange={(e) => setRowLockFields(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(39,39,42,0.15)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                                            <input type="text" placeholder="DEFY Loan Number *" value={rowLockFields.loanNumber} onChange={(e) => setRowLockFields(prev => ({ ...prev, loanNumber: e.target.value }))} className="w-full px-3 py-2 text-sm border border-[rgba(39,39,42,0.15)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <button type="button" onClick={handleRowLock} disabled={rowSending || !rowLockFields.name || !rowLockFields.email || !rowLockFields.loanNumber} className="inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white bg-[#000000] rounded-lg hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                              {rowSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : rowStatus === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                                              {rowSending ? 'Sending...' : rowStatus === 'success' ? 'Sent!' : 'Send Lock Request'}
                                            </button>
                                            {rowStatus === 'error' && <p className="text-xs text-[#EF4444]">Failed to send. Please try again.</p>}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Mobile stacked cards */}
                                  <div className="sm:hidden divide-y divide-[rgba(39,39,42,0.15)]">
                                    {filteredRateOptions.map((opt, optIdx) => {
                                      if (!opt || typeof opt !== 'object') return null
                                      const points = safeNumber(opt.points)
                                      const price = safeNumber(opt.price) || (100 - points)
                                      const isClosestTo100 = bestRate === opt
                                      const payment = safeNumber(opt.payment)
                                      return (
                                        <div key={optIdx} className={`px-4 py-3 ${isClosestTo100 ? 'bg-[#FAFAFA]' : ''}`}>
                                          <div className="text-[12px] font-medium text-[#000000] truncate mb-2">{opt.description || programName}</div>
                                          <div className="grid grid-cols-4 gap-2 text-center">
                                            <div>
                                              <div className="text-[13px] font-bold text-[#000000] tabular-nums">{safeNumber(opt.rate).toFixed(3)}%</div>
                                              <div className="text-[9px] text-[#A1A1AA] uppercase">Rate</div>
                                            </div>
                                            <div>
                                              <div className={`text-[13px] font-bold tabular-nums ${price >= 100 ? 'text-[#22C55E]' : 'text-[#000000]'}`}>{price.toFixed(3)}</div>
                                              <div className="text-[9px] text-[#A1A1AA] uppercase">Price</div>
                                            </div>
                                            <div>
                                              <div className="text-[13px] font-bold text-[#000000] tabular-nums">{safeNumber(opt.apr).toFixed(3)}%</div>
                                              <div className="text-[9px] text-[#A1A1AA] uppercase">APR</div>
                                            </div>
                                            <div>
                                              <div className="text-[13px] font-bold text-[#000000] tabular-nums">{payment > 0 ? formatCurrency(payment) : '-'}</div>
                                              <div className="text-[9px] text-[#A1A1AA] uppercase">Pmt</div>
                                            </div>
                                          </div>
                                          <div className="relative mt-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const key = `m-${programName}-${optIdx}`
                                                setOpenActionDropdown(openActionDropdown === key ? null : key)
                                              }}
                                              className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-white bg-[#000000] rounded hover:opacity-85 transition-colors"
                                            >
                                              Actions <ChevronDown className={`w-3 h-3 transition-transform ${openActionDropdown === `m-${programName}-${optIdx}` ? 'rotate-180' : ''}`} />
                                            </button>
                                            {openActionDropdown === `m-${programName}-${optIdx}` && (
                                              <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[rgba(39,39,42,0.15)] py-1 min-w-[180px]">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setActiveRowAction({
                                                      type: 'reserve', programName, optIdx,
                                                      rate: safeNumber(opt.rate), price, payment,
                                                      apr: safeNumber(opt.apr), description: opt.description || programName
                                                    })
                                                    setRowReserveFields({ name: '', email: '', scenarioName: '', confirmed: false })
                                                    setRowStatus('idle')
                                                    setOpenActionDropdown(null)
                                                  }}
                                                  className="w-full text-left px-3 py-2 text-[11px] font-semibold text-[#000000] hover:bg-[#FAFAFA] transition-colors"
                                                >
                                                  Reserve Pricing
                                                </button>
                                                {isPartner && (
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setActiveRowAction({
                                                        type: 'lock', programName, optIdx,
                                                        rate: safeNumber(opt.rate), price, payment,
                                                        apr: safeNumber(opt.apr), description: opt.description || programName
                                                      })
                                                      setRowLockFields({ name: '', email: '', loanNumber: '' })
                                                      setRowStatus('idle')
                                                      setOpenActionDropdown(null)
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-[11px] font-semibold text-[#000000] hover:bg-[#FAFAFA] transition-colors"
                                                  >
                                                    Request Lock
                                                  </button>
                                                )}
                                                {isPartner && (
                                                  <a
                                                    href="https://sub.defywholesale.com/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={() => setOpenActionDropdown(null)}
                                                    className="block w-full text-left px-3 py-2 text-[11px] font-semibold text-[#71717A] hover:bg-[#FAFAFA] transition-colors no-underline"
                                                  >
                                                    Select Rate + Submit File
                                                  </a>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>

                                  {/* Adjustments detail (best rate) */}
                                  {bestRate && bestRate.adjustments && bestRate.adjustments.length > 0 && (
                                    <div className="px-4 py-3 border-t border-[rgba(39,39,42,0.15)] bg-[#FAFAFA]">
                                      <div className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-widest mb-2">Adjustments (Best Rate)</div>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                                        {bestRate.adjustments.map((adj: Adjustment, adjIdx: number) => (
                                          <div key={adjIdx} className="flex justify-between items-center text-xs bg-white px-2.5 py-1.5 rounded-lg border border-[rgba(39,39,42,0.15)]">
                                            <span className="text-[#000000] truncate mr-2">{adj.description}</span>
                                            <span className={`font-semibold tabular-nums ${adj.amount >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                                              {adj.amount >= 0 ? '+' : ''}{adj.amount.toFixed(3)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {isExpanded && filteredRateOptions.length === 0 && (
                                <div className="bg-[#FAFAFA] px-4 py-3 text-xs text-[#A1A1AA] border-t border-[rgba(39,39,42,0.15)]">
                                  No rate options in price range (99-101)
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ) : null}

                    {/* National Rate Access - LP Results Gate */}
                    {(lpLoading || lpResult) && !lpUnlocked && (
                      <div className="mt-4 flex items-center gap-3 justify-end">
                        <span className="text-[11px] text-[#A1A1AA] font-medium">National Rate Access</span>
                        <input
                          type="password"
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="----"
                          value={lpPasscode}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                            setLpPasscode(val)
                            if (val === '4040') setLpUnlocked(true)
                          }}
                          className="w-16 h-7 text-center text-[12px] font-mono bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded text-[#71717A] outline-none focus:border-[#A1A1AA] placeholder:text-[#D1D5DB]"
                        />
                      </div>
                    )}

                    {/* LP Loading */}
                    {lpUnlocked && lpLoading && !lpResult && (
                      <div className="mt-4 border border-[rgba(39,39,42,0.15)] bg-white rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-[#A1A1AA]" />
                          <span className="text-sm text-[#A1A1AA] font-medium tracking-wide">Scanning national pricing engines...</span>
                        </div>
                        <div className="skeleton-card h-12 w-full" />
                        <div className="skeleton-card h-12 w-full" />
                        <div className="skeleton h-4 w-40" />
                      </div>
                    )}

                    {/* LP Results */}
                    {lpUnlocked && lpResult && lpResult.rateOptions && lpResult.rateOptions.length > 0 && (() => {
                      const isInvestment = formData.occupancyType === 'investment'
                      const prepayMonths = parseInt(formData.prepayPeriod) || 0
                      const priceCeiling = 103.000
                      const adjustedLpRates = lpResult.rateOptions
                        .map((opt: any) => {
                          const prog = (opt.program || '').toUpperCase()
                          const needsMargin = prog.includes('TITANIUM ADVANTAGE') || prog.includes('CASH FLOW ADVANTAGE')
                          const marginAdj = needsMargin ? 1.375 : 0
                          return {
                            ...opt,
                            price: safeNumber(opt.price) - 0.125 - marginAdj,
                            totalAdjustments: safeNumber(opt.totalAdjustments) - marginAdj,
                          }
                        })
                      const filteredLpRates = (() => {
                        const sorted = adjustedLpRates
                          .filter((opt: any) => opt.price >= 99.500 && opt.price <= priceCeiling)
                          .filter((opt: any, idx: number, arr: any[]) => {
                            const rateStep = Math.round(opt.rate / 0.125) * 0.125
                            return idx === arr.findIndex((o: any) => Math.round(o.rate / 0.125) * 0.125 === rateStep)
                          })
                        const result: any[] = []
                        let lastPrice = -Infinity
                        for (const opt of sorted) {
                          if (result.length > 0 && opt.price <= lastPrice) break
                          result.push(opt)
                          lastPrice = opt.price
                        }
                        return result
                      })()
                      const closestPrice = filteredLpRates.length > 0
                        ? Math.min(...filteredLpRates.map((o: any) => Math.abs(o.price - 100)))
                        : 999
                      const prepayLabel = isInvestment && prepayMonths > 0 ? ` - ${prepayMonths} Month Prepay` : ''
                      return (
                        <div className="mt-4 border border-[rgba(39,39,42,0.15)] bg-white rounded-xl overflow-hidden">
                          <div className="px-5 pt-5 pb-3">
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-[#FAFAFA]">
                                  <Zap className="w-4 h-4 text-[#000000]" />
                                </div>
                                <div className="text-base font-semibold text-[#000000] tracking-tight">National Wholesale Rate Results{prepayLabel}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 text-[11px] text-[#22C55E] bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] px-2.5 py-1 rounded-[4px] font-medium">
                                  <ShieldCheck className="w-3 h-3" />Verified
                                </div>
                                <span className="text-[11px] font-mono text-[#A1A1AA]">{filteredLpRates.length} rates</span>
                              </div>
                            </div>
                            <p className="text-[11px] text-[#A1A1AA] flex items-center gap-1.5">
                              <Globe className="w-3 h-3 text-[#A1A1AA]" />
                              We just checked all of the Industry Leading Pricing Engines for you.
                            </p>
                          </div>
                          <div className="px-5 pb-5">
                            {filteredLpRates.length > 0 ? (
                              <div className="overflow-x-auto rounded-lg border border-[rgba(39,39,42,0.12)]">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-[rgba(39,39,42,0.15)]">
                                      <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Rate</th>
                                      <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Price</th>
                                      <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Payment</th>
                                      <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">Price Adj.</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredLpRates.map((opt: any, idx: number) => {
                                      const isClosest = Math.abs(opt.price - 100) === closestPrice
                                      return (
                                        <tr key={idx} className={`border-t border-[rgba(39,39,42,0.08)] transition-colors duration-150 ${isClosest ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'}`}>
                                          <td className="py-2.5 px-4 text-right font-semibold text-[#000000] font-mono">{safeNumber(opt.rate).toFixed(3)}%</td>
                                          <td className={`py-2.5 px-4 text-right font-mono ${opt.price >= 100 ? 'text-[#22C55E] font-semibold' : 'text-[#000000]'}`}>{safeNumber(opt.price).toFixed(3)}</td>
                                          <td className="py-2.5 px-4 text-right text-[#000000] font-mono">{opt.payment > 0 ? formatCurrency(safeNumber(opt.payment)) : '-'}</td>
                                          <td className="py-2.5 px-4 text-right font-mono">
                                            {opt.totalAdjustments !== 0 ? (
                                              <span className={opt.totalAdjustments > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}>
                                                {opt.totalAdjustments > 0 ? '+' : ''}{safeNumber(opt.totalAdjustments).toFixed(3)}
                                              </span>
                                            ) : <span className="text-[#A1A1AA]">-</span>}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-[#A1A1AA] text-center py-3">
                                {adjustedLpRates.length} rates returned, none in price range
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {/* LP empty */}
                    {lpUnlocked && !lpLoading && lpResult && (!lpResult.rateOptions || lpResult.rateOptions.length === 0) && (
                      <div className="mt-4 border border-[rgba(39,39,42,0.15)] bg-white rounded-xl p-6">
                        <div className="flex flex-col items-center gap-2">
                          <Globe className="w-5 h-5 text-[#A1A1AA]" />
                          <p className="text-sm text-[#A1A1AA] text-center">No LP market rates available for this scenario</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t border-[rgba(39,39,42,0.1)] bg-white px-6 lg:px-10 py-3 mt-6 flex items-center justify-between">
          <span className="text-[12px] text-[#71717A]">&copy; 2026 OpenBroker Labs</span>
          <span className="text-[9px] text-[#A1A1AA] max-w-xl hidden sm:block">B2B technology platform. Not a lender, broker, or originator. Use at your own risk.</span>
        </footer>
      </main>

      {/* ===== HELP DESK MODAL ===== */}
      {showHelpDesk && (
        <>
          <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm" onClick={() => setShowHelpDesk(false)} />
          <div className="fixed inset-0 z-[301] flex items-center justify-center px-4">
            <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#000000]" />
                  <h3 className="text-lg font-bold text-[#000000]">Help Desk</h3>
                </div>
                <button type="button" onClick={() => setShowHelpDesk(false)} className="p-1 text-[#A1A1AA] hover:text-[#000000] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[13px] text-[#71717A] mb-4">Submit a help request and our team will get back to you.</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">Name *</label>
                  <input type="text" value={helpDeskFields.name} onChange={(e) => setHelpDeskFields(prev => ({ ...prev, name: e.target.value }))} placeholder="Your name" className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">Email *</label>
                  <input type="email" value={helpDeskFields.email} onChange={(e) => setHelpDeskFields(prev => ({ ...prev, email: e.target.value }))} placeholder="you@company.com" className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">Help Topic *</label>
                  <select value={helpDeskFields.topic} onChange={(e) => setHelpDeskFields(prev => ({ ...prev, topic: e.target.value }))} className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent">
                    <option value="">Select a topic...</option>
                    <option value="Pricing">Pricing</option>
                    <option value="Lock Desk">Lock Desk</option>
                    <option value="Technical">Technical</option>
                    <option value="Account">Account</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#71717A] uppercase tracking-wider mb-1">Message</label>
                  <textarea value={helpDeskFields.message} onChange={(e) => setHelpDeskFields(prev => ({ ...prev, message: e.target.value }))} placeholder="Describe your issue or question..." rows={3} className="w-full px-3 py-2.5 bg-[#FAFAFA] border border-[rgba(39,39,42,0.15)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#000000] focus:border-transparent resize-none" />
                </div>
                <button type="button" onClick={handleHelpDeskSubmit} disabled={helpDeskSending || !helpDeskFields.name || !helpDeskFields.email || !helpDeskFields.topic} className="w-full py-3 bg-[#000000] hover:opacity-85 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
                  {helpDeskSending ? <Loader2 className="w-4 h-4 animate-spin" /> : helpDeskStatus === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  {helpDeskSending ? 'Sending...' : helpDeskStatus === 'success' ? 'Sent!' : 'Submit Request'}
                </button>
                {helpDeskStatus === 'error' && <p className="text-xs text-[#EF4444] text-center">Failed to send. Please try again.</p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* LiveChat removed — chat is now accessed via sidebar link */}

      {/* Admin Chat Panel (fullscreen overlay) */}
      {showAdminPanel && <AdminChatPanel onClose={() => setShowAdminPanel(false)} />}
    </div>
  )
}
