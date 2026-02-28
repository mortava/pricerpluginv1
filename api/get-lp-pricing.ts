import type { VercelRequest, VercelResponse } from '@vercel/node'

const BROWSERLESS_URL = 'https://production-sfo.browserless.io/chromium/bql'
const FLEX_URL = 'https://flex.digitallending.com/#/pricing?code=Oaktree&company=oaktree.digitallending.com'

// ================= Flex Form Field IDs =================
const FIELD_IDS = {
  fico: '63d2274bf262ed03e49abc6c',
  citizenship: '63fd2c4bd2d5c7d168d741b8',
  docType: '686fb4aab753b53d04cea8c9',
  dscrRatio: '63bda202870841ff37dcffc2',
  occupancy: '61a97be92f993cf968556c19',
  propertyType: '613fe3ebb0d5f45e0b719775',
  units: '61a97b912f993cf968556c14',
  attachmentType: '61a97b4e2f993cf968556c10',
  zip: '613fe802b0d5f45e0b71985b',
  state: '613fe2d8b0d5f45e0b719766',
  loanPurpose: '625cf17a81b3b41288722d24',
  purchasePrice: '63fd2badd2d5c7d168d7404b',
  loanAmount: '625cf3e881b3b41288722d60',
  waiveImpounds: '63fd750696ed759a592609eb',
  interestOnly: '6471198a1808b2759c7290f3',
  selfEmployed: '6219b8a850cbb98496384300',
  // Dynamic fields (appear after DSCR/Investment selection)
  prepayTerm: '691667834a1a0960d1e67588',
  prepayPlanType: '691667af4a1a0960d1e67596',
  shortTermRental: '688a8c972c7c7a45f870c4e5',
  firstTimeInvestor: '64062719bcd1bf2ef39bb120',
  crossCollateralized: '697b9d8d942d1b374b520aa6',
  cashoutAmount: '625d029781b3b41288723f5a',
}

// ================= Form Value Mappings =================
function mapFormValues(formData: any) {
  const occupancyMap: Record<string, string> = {
    primary: 'Primary Residence', secondary: 'Second Home', investment: 'Investment',
  }
  const propTypeMap: Record<string, string> = {
    sfr: 'Single Family Residence', condo: 'Condo', townhouse: 'Townhouse',
    '2unit': '2-4 Units', '3unit': '2-4 Units', '4unit': '2-4 Units', '5-8unit': 'MultiFamily 5-8 Units', '5-9unit': 'MultiFamily 5-8 Units',
  }
  const purposeMap: Record<string, string> = {
    purchase: 'Purchase', refinance: 'Refinance', cashout: 'Cashout Refinance',
  }
  const citizenMap: Record<string, string> = {
    usCitizen: 'US Citizen', permanentResident: 'Permanent Resident',
    nonPermanentResident: 'Non-Permanent Resident', foreignNational: 'Foreign National', itin: 'ITIN',
  }
  const docTypeMap: Record<string, string> = {
    fullDoc: 'Full Doc', dscr: 'Investor/DSCR',
    bankStatement: '24 Mo Personal Bank Statements', bankStatement12: '12 Mo Personal Bank Statements',
    bankStatement24: '24 Mo Personal Bank Statements', assetDepletion: 'Asset Utilization',
    assetUtilization: 'Asset Utilization', voe: 'WVOE', noRatio: 'Full Doc',
  }
  const stateMap: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia',
  }

  const isDSCR = formData.documentationType === 'dscr'

  const prepayMap: Record<string, string> = {
    '60mo': '60 Months', '48mo': '48 Months', '36mo': '36 Months',
    '24mo': '24 Months', '12mo': '12 Months', '0mo': 'None',
  }
  const prepayTypeMap: Record<string, string> = {
    '5pct': '5% Fixed', 'declining': 'Declining', '6mointerest': '6 Months Interest',
  }

  return {
    fico: String(Number(formData.creditScore) || 740),
    citizenship: citizenMap[formData.citizenship] || 'US Citizen',
    docType: docTypeMap[formData.documentationType] || 'Full Doc',
    dscrRatio: isDSCR ? String(Number(formData.dscrValue) || 1.25) : '',
    occupancy: occupancyMap[formData.occupancyType] || 'Primary Residence',
    propertyType: propTypeMap[formData.propertyType] || 'Single Family Residence',
    units: (formData.propertyType === '5-8unit' || formData.propertyType === '5-9unit') ? '5' : formData.propertyType?.startsWith('2') ? '2' : formData.propertyType?.startsWith('3') ? '3' : formData.propertyType?.startsWith('4') ? '4' : '1',
    attachmentType: formData.structureType === 'attached' ? 'Attached' : 'Detached',
    zip: formData.propertyZip || '90210',
    state: stateMap[formData.propertyState] || 'California',
    loanPurpose: purposeMap[formData.loanPurpose] || 'Purchase',
    purchasePrice: String(Number(formData.propertyValue) || 800000),
    loanAmount: String(Number(formData.loanAmount) || 600000),
    waiveImpounds: formData.impoundType === 'noescrow',
    interestOnly: formData.paymentType === 'io',
    selfEmployed: !!formData.isSelfEmployed,
    isDSCR,
    isInvestment: formData.occupancyType === 'investment',
    prepayTerm: prepayMap[formData.prepayPeriod] || 'None',
    prepayPlanType: prepayTypeMap[formData.prepayType] || '5% Fixed',
    isCrossCollateralized: !!formData.isCrossCollateralized,
    isShortTermRental: !!formData.isShortTermRental || !!formData.isSeasonalProperty,
    isCashout: formData.loanPurpose === 'cashout',
    cashoutAmount: String(Number(String(formData.cashoutAmount || '0').replace(/,/g, '')) || 0),
  }
}

// ================= Build BQL Evaluate Script =================
function buildEvaluateScript(values: ReturnType<typeof mapFormValues>): string {
  // Build setVal calls for each field
  const fieldSets: string[] = [
    `setVal('${FIELD_IDS.fico}', '${values.fico}');`,
    `setVal('${FIELD_IDS.citizenship}', '${values.citizenship}');`,
    `setVal('${FIELD_IDS.docType}', '${values.docType}');`,
    `setVal('${FIELD_IDS.occupancy}', '${values.occupancy}');`,
    `await sleep(500);`,
  ]

  // Cross-collateral is handled AFTER investment dynamic fields are rendered (see below)

  fieldSets.push(
    `setVal('${FIELD_IDS.propertyType}', '${values.propertyType}');`,
    `setVal('${FIELD_IDS.units}', '${values.units}');`,
    `setVal('${FIELD_IDS.attachmentType}', '${values.attachmentType}');`,
    `setVal('${FIELD_IDS.zip}', '${values.zip}');`,
    `setVal('${FIELD_IDS.state}', '${values.state}');`,
    `setVal('${FIELD_IDS.loanPurpose}', '${values.loanPurpose}');`,
    `await sleep(500);`,
    `setVal('${FIELD_IDS.purchasePrice}', '${values.purchasePrice}');`,
    `setVal('${FIELD_IDS.loanAmount}', '${values.loanAmount}');`,
  )

  // Cashout Amount (dynamic field — appears after selecting Cashout Refinance)
  if (values.isCashout) {
    fieldSets.push(`await sleep(300);`)
    fieldSets.push(`setVal('${FIELD_IDS.cashoutAmount}', '${values.cashoutAmount}');`)
  }

  if (values.isDSCR && values.dscrRatio) {
    // Remove step constraint first — HTML5 step="1" rejects decimals like 1.25
    fieldSets.push(`(function(){ var dscr=document.getElementById('${FIELD_IDS.dscrRatio}'); if(dscr){dscr.removeAttribute('step');dscr.setAttribute('step','any');} })();`)
    fieldSets.push(`setVal('${FIELD_IDS.dscrRatio}', '${values.dscrRatio}');`)
  }

  // Prepay term (dynamic field — appears after setting Investment occupancy)
  if (values.isInvestment) {
    fieldSets.push(`await sleep(500);`)
    fieldSets.push(`setVal('${FIELD_IDS.shortTermRental}', '${values.isShortTermRental ? 'Yes' : 'No'}');`)
    fieldSets.push(`setVal('${FIELD_IDS.prepayTerm}', '${values.prepayTerm}');`)
    if (values.prepayTerm !== 'None') {
      fieldSets.push(`await sleep(500);`)
      fieldSets.push(`setVal('${FIELD_IDS.prepayPlanType}', '${values.prepayPlanType}');`)
    }

    // Cross-Collateralized: MUST click AFTER investment dynamic fields are rendered
    // This is a dynamic checkbox that only appears after Investment occupancy is selected
    if (values.isCrossCollateralized) {
      fieldSets.push(`await sleep(1000);`)
      fieldSets.push(`
        (async function() {
          // Retry up to 3 times with 1s waits — dynamic field may need time to render
          for (var ccAttempt = 0; ccAttempt < 3; ccAttempt++) {
            var ccEl = document.getElementById('${FIELD_IDS.crossCollateralized}');
            if (ccEl) {
              var ccLabel = document.querySelector('label[for="${FIELD_IDS.crossCollateralized}"]');
              if (!ccLabel) { ccLabel = ccEl.closest('label'); }
              if (ccLabel) {
                ccLabel.click();
                diag.steps.push('cross_coll_label_clicked_attempt_' + ccAttempt + ': ' + ccEl.checked);
              } else {
                ccEl.click();
                diag.steps.push('cross_coll_el_clicked_attempt_' + ccAttempt + ': ' + ccEl.checked);
              }
              // Verify it's actually checked
              await sleep(500);
              if (ccEl.checked) {
                diag.steps.push('cross_coll_verified_checked: true');
                break;
              } else {
                diag.steps.push('cross_coll_not_checked_after_click_' + ccAttempt);
              }
            } else {
              diag.steps.push('cross_coll_not_found_attempt_' + ccAttempt);
              await sleep(1000);
            }
          }
        })();
      `)
      fieldSets.push(`await sleep(1500);`)
    }
  }

  // Handle other checkboxes via label click (same pattern as cross-coll)
  const checkboxSets: string[] = []
  if (values.waiveImpounds) {
    checkboxSets.push(`clickCheckboxLabel('${FIELD_IDS.waiveImpounds}');`)
  }
  if (values.interestOnly) {
    checkboxSets.push(`clickCheckboxLabel('${FIELD_IDS.interestOnly}');`)
  }
  if (values.selfEmployed) {
    checkboxSets.push(`clickCheckboxLabel('${FIELD_IDS.selfEmployed}');`)
  }

  return `(async function() {
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  var diag = { steps: [], fieldResults: {} };

  function setVal(id, val) {
    var el = document.getElementById(id);
    if (!el) { diag.fieldResults[id] = 'NOT_FOUND'; return; }
    diag.fieldResults[id] = { tag: el.tagName, found: true };
    var s = el.tagName === 'SELECT'
      ? Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set
      : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    s.call(el, val);
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.dispatchEvent(new Event('change', {bubbles: true}));
  }
  function clickCheckboxLabel(id) {
    var el = document.getElementById(id);
    if (!el) { diag.fieldResults[id] = 'NOT_FOUND'; return; }
    var wasBefore = el.checked;
    // Click via label for proper Angular binding (native browser delegation)
    var lbl = document.querySelector('label[for="' + id + '"]');
    if (!lbl) { lbl = el.closest('label'); }
    if (lbl) { lbl.click(); }
    else { el.click(); }
    diag.fieldResults[id] = 'checkbox_' + wasBefore + '->' + el.checked;
  }

  diag.steps.push('page_url: ' + window.location.href);
  diag.steps.push('title: ' + document.title);

  await sleep(2000);

  // Hide cookie banner (do NOT click <A> — can trigger navigation)
  document.cookie = 'cookieconsent_status=allow; path=/; max-age=31536000';
  var banners = document.querySelectorAll('.cc-window, [class*=cookie-consent], [class*=cookie-banner]');
  for (var bi = 0; bi < banners.length; bi++) {
    banners[bi].remove();
    diag.steps.push('cookie_banner_removed');
  }
  await sleep(1000);

  var bodyText = (document.body.innerText || '').substring(0, 500);
  diag.steps.push('body_preview: ' + bodyText.substring(0, 200));

  ${fieldSets.join('\\n  ')}
  ${checkboxSets.join('\\n  ')}

  // Verify docType
  var docTypeEl = document.getElementById('${FIELD_IDS.docType}');
  if (docTypeEl) {
    diag.steps.push('docType_after_set: ' + docTypeEl.value + ' | selectedText: ' + (docTypeEl.selectedOptions ? docTypeEl.selectedOptions[0]?.text : 'N/A'));
  }

  await sleep(1000);
  diag.steps.push('fields_set');

  // Click Search
  var searchBtn = document.querySelector('button.btn-primary');
  diag.steps.push('search_btn: ' + (searchBtn ? searchBtn.textContent.trim() : 'NOT_FOUND'));
  if (!searchBtn) return JSON.stringify({ error: 'no search button', diag: diag });
  searchBtn.click();
  diag.steps.push('search_clicked');

  // Poll for results table (check every 2s, up to 20s)
  var foundTable = false;
  for (var attempt = 0; attempt < 10; attempt++) {
    await sleep(2000);
    var checkRows = document.querySelectorAll('tr');
    if (checkRows.length > 0) {
      diag.steps.push('results_found_at: ' + ((attempt + 1) * 2) + 's (' + checkRows.length + ' rows)');
      foundTable = true;
      break;
    }
    var bodySnap = (document.body.innerText || '');
    if (bodySnap.indexOf('No results') >= 0 || bodySnap.indexOf('No eligible') >= 0) {
      diag.steps.push('no_results_text_at: ' + ((attempt + 1) * 2) + 's');
      break;
    }
  }

  if (!foundTable) {
    diag.steps.push('no_table_after_20s');
    var pageText2 = (document.body.innerText || '');
    var eligIdx = pageText2.indexOf('Eligible');
    if (eligIdx >= 0) diag.steps.push('eligible_text: ' + pageText2.substring(eligIdx, eligIdx + 200));
    else diag.steps.push('no_eligible_text_on_page');
    // Check for validation errors
    var invalidInputs = document.querySelectorAll('input:invalid, select:invalid');
    diag.steps.push('invalid_inputs: ' + invalidInputs.length);
    if (invalidInputs.length > 0) {
      var invalidDetails = [];
      for (var ivi = 0; ivi < invalidInputs.length && ivi < 5; ivi++) {
        var ivf = invalidInputs[ivi];
        invalidDetails.push({ id: ivf.id, type: ivf.type || '', value: (ivf.value || '').substring(0, 30), validationMsg: ivf.validationMessage || '' });
      }
      diag.steps.push('invalid_details: ' + JSON.stringify(invalidDetails));
    }
  }

  if (foundTable) await sleep(1000);

  var allRows = document.querySelectorAll('tr');
  diag.steps.push('total_tr_elements: ' + allRows.length);

  // Extract rate data from table
  function getData(cell) {
    var div = cell.querySelector('[data]');
    return div ? div.getAttribute('data') : (cell.textContent || '').trim();
  }

  // Capture table headers
  var thEls = document.querySelectorAll('th');
  var colHeaders = [];
  for (var hi = 0; hi < thEls.length; hi++) {
    colHeaders.push((thEls[hi].textContent || '').trim());
  }
  diag.colHeaders = colHeaders;

  var rows = document.querySelectorAll('tr');
  var rates = [];
  var debugRows = [];
  for (var i = 0; i < rows.length && i < 50; i++) {
    var cells = rows[i].querySelectorAll('td');
    if (cells.length < 5) continue;
    var rateText = (cells[0].textContent || '').trim();
    if (debugRows.length < 2) {
      var allCells = [];
      for (var ci = 0; ci < cells.length; ci++) {
        allCells.push({ idx: ci, text: (cells[ci].textContent || '').trim().substring(0, 50), data: getData(cells[ci]) });
      }
      debugRows.push({ cellCount: cells.length, allCells: allCells });
    }
    var rateMatch = rateText.match(/([\\d.]+)\\s*%/);
    if (!rateMatch) continue;
    rates.push({
      rate: parseFloat(rateMatch[1]),
      lender: (cells[1] ? (cells[1].textContent || '').trim() : ''),
      price: getData(cells[2]),
      payment: getData(cells[3]),
      costToBorrower: getData(cells[4]),
      lenderFee: getData(cells[6]),
      program: (cells[7] ? (cells[7].textContent || '').trim() : ''),
      priceAdj: getData(cells[9])
    });
  }

  diag.debugRows = debugRows;

  var pageText = document.body.innerText || '';
  var qmMatch = pageText.match(/Eligible QM \\((\\d+)\\)/);
  var nonQmMatch = pageText.match(/Eligible Non-Traditional \\((\\d+)\\)/);

  return JSON.stringify({
    rateCount: rates.length,
    eligibleQM: qmMatch ? parseInt(qmMatch[1]) : 0,
    eligibleNonQM: nonQmMatch ? parseInt(nonQmMatch[1]) : 0,
    rates: rates,
    diag: diag
  });
})()`
}

// ================= Parse Scraped Results =================
function parseScrapedRates(rawRates: any[]): any[] {
  return rawRates
    .filter((r: any) => r.rate > 0 && r.price)
    .map((r: any) => {
      const priceStr = String(r.price).replace(/[^0-9.-]/g, '')
      const paymentStr = String(r.payment).replace(/[^0-9.-]/g, '')
      const adjStr = String(r.priceAdj).replace(/[^0-9.-]/g, '')
      const costStr = String(r.costToBorrower || '').replace(/[^0-9.-]/g, '')
      const feeStr = String(r.lenderFee || '').replace(/[^0-9.-]/g, '')
      return {
        rate: r.rate,
        price: parseFloat(priceStr) || 0,
        payment: parseFloat(paymentStr) || 0,
        program: r.program || '',
        lender: r.lender || '',
        costToBorrower: parseFloat(costStr) || 0,
        lenderFee: parseFloat(feeStr) || 0,
        totalAdjustments: parseFloat(adjStr) || 0,
      }
    })
    .sort((a: any, b: any) => a.rate - b.rate)
}

// Vercel hobby plan: extend timeout to 60s (BQL scrape takes ~20s)
export const config = { maxDuration: 60 }

// ================= Main Handler =================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  const browserlessToken = process.env.BROWSERLESS_TOKEN
  if (!browserlessToken) {
    return res.json({ success: false, error: 'LP pricing not configured' })
  }

  try {
    const formData = req.body
    const values = mapFormValues(formData)
    console.log('[LP] Mapped values:', JSON.stringify(values))
    const evalScript = buildEvaluateScript(values)

    const bqlQuery = `mutation ScrapeRates {
  goto(url: "${FLEX_URL}", waitUntil: networkIdle) { status time }
  results: evaluate(content: ${JSON.stringify(evalScript)}, timeout: 35000) { value }
}`

    const bqlResp = await fetch(`${BROWSERLESS_URL}?token=${browserlessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: bqlQuery }),
      signal: AbortSignal.timeout(50000),
    })

    if (!bqlResp.ok) {
      return res.json({
        success: true,
        data: { source: 'lenderprice', rateOptions: [], totalRates: 0, debug: { bqlStatus: bqlResp.status } },
      })
    }

    const bqlResult = await bqlResp.json()

    if (bqlResult.errors) {
      return res.json({
        success: true,
        data: { source: 'lenderprice', rateOptions: [], totalRates: 0, debug: { bqlErrors: bqlResult.errors } },
      })
    }

    const evalValue = bqlResult.data?.results?.value
    if (!evalValue) {
      return res.json({
        success: true,
        data: { source: 'lenderprice', rateOptions: [], totalRates: 0, debug: { noEvalValue: true } },
      })
    }

    const scraped = typeof evalValue === 'string' ? JSON.parse(evalValue) : evalValue

    if (scraped.error) {
      return res.json({
        success: true,
        data: { source: 'lenderprice', rateOptions: [], totalRates: 0, debug: { scrapeError: scraped.error } },
      })
    }

    const rateOptions = parseScrapedRates(scraped.rates || [])

    return res.json({
      success: true,
      data: {
        source: 'lenderprice',
        rateOptions,
        totalRates: rateOptions.length,
        eligibleQM: scraped.eligibleQM || 0,
        eligibleNonQM: scraped.eligibleNonQM || 0,
        debug: {
          mappedValues: values,
          rawRateCount: scraped.rateCount,
          rawRatesLength: (scraped.rates || []).length,
          firstRawRate: (scraped.rates || [])[0] || null,
          parsedCount: rateOptions.length,
          diag: scraped.diag || null,
        },
      },
    })
  } catch (error) {
    console.error('LP pricing error:', error)
    return res.json({
      success: false,
      error: error instanceof Error ? error.message : 'LP pricing unavailable',
    })
  }
}
