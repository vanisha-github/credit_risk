import { useState } from "react";
import "./App.css";

/* ─── HELPERS ─── */
const getRiskClass = (risk) => {
  if (!risk) return "";
  if (risk.toLowerCase().includes("low")) return "low";
  if (risk.toLowerCase().includes("medium")) return "medium";
  return "high";
};

const getRiskColor = (cls) => {
  if (cls === "low") return "#a78bfa";
  if (cls === "medium") return "#f59e0b";
  return "#f43f5e";
};

const getRecommendations = (result) => {
  const riskCls = getRiskClass(result.risk);
  const recs = [];
  if (riskCls === "low") {
    recs.push({ icon: "✓", title: "Strong Approval Candidate", text: "Profile shows low default probability. Eligible for standard interest rate tiers." });
    recs.push({ icon: "→", title: "Credit Limit", text: "Consider approving up to 80% of requested amount based on income-to-credit ratio." });
    recs.push({ icon: "◎", title: "Monitoring Level", text: "Routine monitoring sufficient. Quarterly review recommended." });
  } else if (riskCls === "medium") {
    recs.push({ icon: "△", title: "Conditional Approval", text: "Moderate risk detected. Consider reduced loan amount or higher interest tier." });
    recs.push({ icon: "◉", title: "Collateral Suggestion", text: "Requesting additional collateral or co-applicant may offset risk exposure." });
    recs.push({ icon: "↻", title: "Review Frequency", text: "Monthly repayment monitoring recommended for first 6 months." });
  } else {
    recs.push({ icon: "✕", title: "High Default Risk", text: "Profile indicates significant default probability. Standard approval not recommended." });
    recs.push({ icon: "⊘", title: "Alternative Products", text: "Consider secured loan products with mandatory collateral or micro-credit alternatives." });
    recs.push({ icon: "⚑", title: "Escalation Required", text: "Flag for senior risk officer review before any disbursement decisions." });
  }
  const topFactor = result.explanations?.[0];
  if (topFactor) {
    recs.push({
      icon: "◈",
      title: "Key Risk Driver",
      text: `Primary factor influencing this score: ${topFactor.feature}. Addressing this variable may improve applicant's risk tier.`,
    });
  }
  return recs;
};

const getDecision = (risk) => {
  const cls = getRiskClass(risk);
  if (cls === "low")    return { label: "Recommended Decision", value: "APPROVE",            cls: "approve", factors: ["Meets income threshold", "Clean social profile", "Low enquiry count"] };
  if (cls === "medium") return { label: "Recommended Decision", value: "MANUAL REVIEW",      cls: "review",  factors: ["Verify employment docs", "Assess collateral options", "Check bureau history"] };
  return                       { label: "Recommended Decision", value: "DECLINE / ESCALATE", cls: "reject",  factors: ["Exceeds risk threshold", "Senior review required", "Alternative products only"] };
};

/* education mapping */
const educationOptions = [
  { label: "Lower Secondary (up to Class 10)", value: "Lower secondary" },
  { label: "Secondary / Class 12 / Diploma", value: "Secondary" },
  { label: "Undergraduate (Pursuing / Incomplete)", value: "Incomplete higher" },
  { label: "Graduate (B.Tech / B.Com / B.A etc.)", value: "Higher education" },
  { label: "Post-Graduate (MBA / M.Tech / M.Sc)", value: "Higher education" },
  { label: "Doctorate / PhD", value: "Higher education" },
];

/* skill type mapping */
const skillOptions = [
  { label: "Software / IT Professional", value: "High skill" },
  { label: "Doctor / Lawyer / CA / Consultant", value: "High skill" },
  { label: "Manager / Executive / Director", value: "High skill" },
  { label: "Engineer (Non-IT)", value: "High skill" },
  { label: "Teacher / Professor / Researcher", value: "High skill" },
  { label: "Office Clerk / Admin Staff", value: "Low skill" },
  { label: "Sales / Retail / Trade Worker", value: "Low skill" },
  { label: "Driver / Delivery / Logistics", value: "Low skill" },
  { label: "Factory / Manufacturing / Labor", value: "Low skill" },
  { label: "Domestic / Helper / Housekeeping", value: "Low skill" },
  { label: "Security Guard / Watchman", value: "Low skill" },
  { label: "Self-employed / Small Business", value: "Low skill" },
];

/* org type mapping */
const orgOptions = [
  { label: "Central or State Government", value: "Stable org" },
  { label: "Public Sector Undertaking (PSU)", value: "Stable org" },
  { label: "MNC / Large Corporate (1000+ employees)", value: "Stable org" },
  { label: "Established Private Company (10+ yrs)", value: "Stable org" },
  { label: "Bank or Financial Institution", value: "Stable org" },
  { label: "School / College / University", value: "Stable org" },
  { label: "Hospital / Healthcare Chain", value: "Stable org" },
  { label: "Startup (< 5 years old)", value: "Risky org" },
  { label: "Freelance / Contract / Gig Work", value: "Risky org" },
  { label: "Small Shop / Proprietorship", value: "Risky org" },
  { label: "Seasonal / Temporary Employment", value: "Risky org" },
  { label: "NGO / Voluntary Organization", value: "Risky org" },
];

const DOC_TYPES = [
  { key: "aadhaar",    label: "Aadhaar Card",              hint: "Government-issued 12-digit UID card" },
  { key: "pan",        label: "PAN Card",                  hint: "Permanent Account Number for tax identity" },
  { key: "passport",   label: "Passport",                  hint: "Valid Indian passport (any page)" },
  { key: "voter",      label: "Voter ID",                  hint: "Election Commission photo ID card" },
  { key: "dl",         label: "Driving Licence",           hint: "Valid motor vehicle licence" },
  { key: "salary",     label: "Salary Slips (Last 3 months)", hint: "Employer-issued monthly pay stubs" },
  { key: "itr",        label: "Income Tax Returns (ITR)",  hint: "Filed ITR for last 1–2 years" },
  { key: "bank",       label: "Bank Statements (6 months)", hint: "Savings / current account statement" },
  { key: "form16",     label: "Form 16",                   hint: "TDS certificate issued by employer" },
  { key: "property",   label: "Property / Rent Documents", hint: "Ownership deed or rental agreement" },
  { key: "business",   label: "Business Registration",     hint: "GST cert, Shop Act, or incorporation doc" },
  { key: "reference",  label: "Reference / Guarantor Letter", hint: "Letter from a credit guarantor or referee" },
];

const socialMap   = { low: 2, medium: 5, high: 8 };
const defaultMap  = { none: 0, few: 1, many: 3 };
const CIRCUMFERENCE = 2 * Math.PI * 50;

/* ─── ADDRESS BLOCK ─── */
function AddressBlock({ index, data, onChange, onRemove, showRemove }) {
  const upd = (field, val) => onChange(index, { ...data, [field]: val });
  return (
    <div className="address-block">
      <div className="address-block-header">
        <span className="address-block-label">{index === 0 ? "Current Address" : `Previous Address ${index}`}</span>
        {showRemove && <button className="addr-remove-btn" onClick={() => onRemove(index)}>✕</button>}
      </div>
      <div className="field-row">
        <div className="field">
          <label>Flat / House No. & Building</label>
          <input placeholder="e.g. Flat 4B, Sunrise Apartments" value={data.building || ""} onChange={e => upd("building", e.target.value)} />
        </div>
        <div className="field">
          <label>Street / Lane / Colony</label>
          <input placeholder="e.g. 12, MG Road, Sector 5" value={data.street || ""} onChange={e => upd("street", e.target.value)} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>City</label>
          <input placeholder="e.g. Mumbai" value={data.city || ""} onChange={e => upd("city", e.target.value)} />
        </div>
        <div className="field">
          <label>State</label>
          <input placeholder="e.g. Maharashtra" value={data.state || ""} onChange={e => upd("state", e.target.value)} />
        </div>
        <div className="field">
          <label>PIN Code</label>
          <input placeholder="6-digit PIN" value={data.pin || ""} onChange={e => upd("pin", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

/* ─── COMPONENT ─── */
export default function App() {
  const [form,      setForm]      = useState({});
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [addresses, setAddresses] = useState([{}]);
  const [uploadedDocs, setUploadedDocs] = useState({});

  const handle = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* address helpers */
  const updateAddress = (idx, data) => {
    const copy = [...addresses];
    copy[idx] = data;
    setAddresses(copy);
  };
  const addAddress = () => setAddresses([...addresses, {}]);
  const removeAddress = (idx) => setAddresses(addresses.filter((_, i) => i !== idx));

  /* doc upload */
  const handleDocUpload = (key, files) => {
    if (!files || files.length === 0) return;
    setUploadedDocs(prev => ({ ...prev, [key]: Array.from(files) }));
  };

  const predict = async () => {
    if (!form.age || !form.income || !form.credit) {
      alert("Please fill required fields: Age, Annual Income, and Loan Amount.");
      return;
    }
    setLoading(true);

    const eduRaw   = form.education || "Secondary";
    const eduOpt   = educationOptions.find(e => e.label === eduRaw);
    const eduMapped = eduOpt ? eduOpt.value : eduRaw;

    const skillRaw  = form.skill || skillOptions[0].label;
    const skillOpt  = skillOptions.find(s => s.label === skillRaw);
    const skillMapped = skillOpt ? skillOpt.value : "Low skill";

    const orgRaw  = form.org || orgOptions[0].label;
    const orgOpt  = orgOptions.find(o => o.label === orgRaw);
    const orgMapped = orgOpt ? orgOpt.value : "Stable org";

    const addressChanges = Math.max(0, addresses.length - 1);

    const payload = {
      AGE:                        Number(form.age),
      CODE_GENDER:                form.gender === "Male" ? 1 : 0,
      CNT_CHILDREN:               Number(form.children || 0),
      CNT_FAM_MEMBERS:            Number(form.family || 1),
      AMT_INCOME_TOTAL:           Number(form.income),
      AMT_CREDIT:                 Number(form.credit),
      AMT_ANNUITY:                Number(form.annuity || 0),
      AMT_GOODS_PRICE:            Number(form.goods || form.credit),
      NAME_INCOME_TYPE:           form.incomeType   || "Working",
      NAME_EDUCATION_TYPE:        eduMapped,
      NAME_FAMILY_STATUS:         form.familyStatus || "Married",
      HOUSING_TYPE:               form.housingType  || "Own house",
      OWN_CAR_AGE:                form.car === "No" ? -1 : Number(form.car_age || -1),
      YEARS_EMPLOYED:             Number(form.employed || 0),
      CONTACT_COUNT:              Number(form.contacts || 1),
      ADDRESS_MISMATCH_COUNT:     addressChanges,
      OBS_30_CNT_SOCIAL_CIRCLE:   socialMap[form.social_group]  || 0,
      DEF_30_CNT_SOCIAL_CIRCLE:   defaultMap[form.social_risk]  || 0,
      DOC_COUNT:                  Object.keys(uploadedDocs).length,
      AMT_REQ_CREDIT_BUREAU_WEEK: Number(form.enq_week   || 0),
      AMT_REQ_CREDIT_BUREAU_YEAR: Number(form.enq_year   || 0),
      YEARS_LAST_PHONE_CHANGE:    Number(form.phone_stability || 1),
      EXT_SOURCE_1:               Number(form.ext1 || 0.6),
      EXT_SOURCE_2:               Number(form.ext2 || 0.6),
      EXT_SOURCE_3:               Number(form.ext3 || 0.6),
      SKILL_TYPE:                 skillMapped,
      ORG_TYPE:                   orgMapped,
    };

    try {
      const res  = await fetch("http://127.0.0.1:5000/predict", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data);
      setTimeout(() => {
        document.getElementById("result-anchor")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      alert("Could not connect to server. Make sure Flask is running on port 5000.");
    }
    setLoading(false);
  };

  const riskCls    = result ? getRiskClass(result.risk) : "";
  const riskColor  = getRiskColor(riskCls);
  const pct        = result ? Math.round(result.probability * 100) : 0;
  const dashOffset = result ? CIRCUMFERENCE * (1 - result.probability) : CIRCUMFERENCE;
  const maxShap    = result ? Math.max(...result.explanations.map((e) => Math.abs(e.impact))) : 1;
  const decision   = result ? getDecision(result.risk) : null;
  const recs       = result ? getRecommendations(result) : [];

  const totalDocs = Object.keys(uploadedDocs).length;

  return (
    <div className="app">

      {/* HERO */}
      <div className="hero">
        <div className="hero-left">
          <div className="hero-tag">Credit Intelligence Platform</div>
          <h1>Risk<span> Assessment</span><br />Engine</h1>
          <div className="hero-sub">ML-powered · SHAP explainability · Real-time scoring</div>
        </div>
        <div className="status-pill">
          <div className="status-dot" />
          Model Active
        </div>
      </div>

      {/* FORM */}
      <div className="section-label">01 — Applicant Profile</div>
      <div className="form-grid">

        {/* LEFT */}
        <div>
          <div className="card">
            <div className="card-title"><div className="card-title-icon">◈</div> Personal Information</div>
            <div className="field-row">
              <div className="field">
                <label>Age *</label>
                <input name="age" type="number" placeholder="e.g. 34" onChange={handle} />
              </div>
              <div className="field">
                <label>Gender</label>
                <select name="gender" onChange={handle}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Children</label>
                <input name="children" type="number" placeholder="0" onChange={handle} />
              </div>
              <div className="field">
                <label>Family Members</label>
                <input name="family" type="number" placeholder="1" onChange={handle} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Highest Education Level</label>
                <select name="education" onChange={handle}>
                  {educationOptions.map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Family Status</label>
                <select name="familyStatus" onChange={handle}>
                  <option>Married</option>
                  <option>Single</option>
                  <option>Widow</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><div className="card-title-icon">₹</div> Financial Details</div>
            <div className="field">
              <label>Annual Income *</label>
              <input name="income" type="number" placeholder="Total yearly income before tax" onChange={handle} />
            </div>
            <div className="field">
              <label>Loan Amount *</label>
              <input name="credit" type="number" placeholder="Requested loan amount" onChange={handle} />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Monthly EMI</label>
                <input name="annuity" type="number" placeholder="Expected EMI" onChange={handle} />
              </div>
              <div className="field">
                <label>Goods Price</label>
                <input name="goods" type="number" placeholder="Item cost" onChange={handle} />
              </div>
            </div>
          </div>

          {/* CREDIT BUREAU */}
          <div className="card">
            <div className="card-title"><div className="card-title-icon">▲</div> Credit Bureau Activity</div>

            <div className="field-hint-block">
              <div className="field-hint-title">Recent loan enquiries — this week</div>
              <div className="field-hint-text">
                How many times have banks or lenders pulled your credit report in the last 7 days?
                Each time you apply for a loan or credit card, it counts as one enquiry.
              </div>
              <input name="enq_week" type="number" placeholder="e.g. 0 (most people have none)" onChange={handle} />
            </div>

            <div className="field-hint-block" style={{ marginTop: "1rem" }}>
              <div className="field-hint-title">Loan enquiries over the past year</div>
              <div className="field-hint-text">
                Total number of credit checks done in the last 12 months across all lenders.
                Frequent applications can signal financial stress to lenders.
              </div>
              <input name="enq_year" type="number" placeholder="e.g. 2" onChange={handle} />
            </div>

            <div className="field-hint-block" style={{ marginTop: "1rem" }}>
              <div className="field-hint-title">How stable is your phone number?</div>
              <div className="field-hint-text">
                How long have you been using your current primary mobile number?
                A frequently changed number can be a flag for lenders.
              </div>
              <select name="phone_stability" onChange={handle}>
                <option value="0.25">Changed very recently (within 3 months)</option>
                <option value="0.5">Changed 3–6 months ago</option>
                <option value="1">Using for about 1 year</option>
                <option value="2">Using for 1–3 years</option>
                <option value="4">Using for 3–5 years</option>
                <option value="7">Using for more than 5 years</option>
              </select>
            </div>

            <div className="field" style={{ marginTop: "1rem" }}>
              <label>Credit Scores (3 Bureau Sources)</label>
              <div className="field-triple">
                <input name="ext1" type="number" step="0.01" placeholder="Score 1" onChange={handle} />
                <input name="ext2" type="number" step="0.01" placeholder="Score 2" onChange={handle} />
                <input name="ext3" type="number" step="0.01" placeholder="Score 3" onChange={handle} />
              </div>
              <small>Enter normalized scores (0–1 scale)</small>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <div className="card">
            <div className="card-title"><div className="card-title-icon">⬡</div> Employment & Work</div>
            <div className="field-row">
              <div className="field">
                <label>Years Employed</label>
                <input name="employed" type="number" placeholder="0" onChange={handle} />
              </div>
              <div className="field">
                <label>Income Type</label>
                <select name="incomeType" onChange={handle}>
                  <option value="Working">Salaried (Private)</option>
                  <option value="State servant">Government / Public Sector</option>
                  <option value="Pensioner">Retired / Pensioner</option>
                  <option value="Other">Other / Mixed</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Your Job Role / Occupation</label>
              <select name="skill" onChange={handle}>
                <optgroup label="Professional / Specialized">
                  {skillOptions.filter(o => o.value === "High skill").map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </optgroup>
                <optgroup label="General / Support Roles">
                  {skillOptions.filter(o => o.value === "Low skill").map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="field">
              <label>Where do you work?</label>
              <select name="org" onChange={handle}>
                <optgroup label="Established / Stable Employers">
                  {orgOptions.filter(o => o.value === "Stable org").map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Variable / Less Formal Employment">
                  {orgOptions.filter(o => o.value === "Risky org").map(o => (
                    <option key={o.label} value={o.label}>{o.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><div className="card-title-icon">⊞</div> Housing & Assets</div>
            <div className="field-row">
              <div className="field">
                <label>Housing Type</label>
                <select name="housingType" onChange={handle}>
                  <option value="Own house">Own House / Flat</option>
                  <option value="Rent">Renting</option>
                  <option value="Other">Living with family / Other</option>
                </select>
              </div>
              <div className="field">
                <label>Own a Car?</label>
                <select name="car" onChange={handle}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>
            </div>
            {form.car !== "No" && (
              <div className="field">
                <label>Car Age (if owned)</label>
                <input name="car_age" type="number" placeholder="Years since purchase" onChange={handle} />
              </div>
            )}
          </div>

          {/* ADDRESS HISTORY */}
          <div className="card">
            <div className="card-title"><div className="card-title-icon">⌖</div> Address History</div>
            <div className="field-hint-text" style={{ marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Please enter your <strong>current address</strong> first, then add any <strong>previous addresses</strong> you have lived at in the past 5 years.
              The number of address changes is used to assess residential stability.
            </div>
            {addresses.map((addr, i) => (
              <AddressBlock
                key={i}
                index={i}
                data={addr}
                onChange={updateAddress}
                onRemove={removeAddress}
                showRemove={i > 0}
              />
            ))}
            <button className="add-address-btn" onClick={addAddress}>
              + Add Previous Address
            </button>
            {addresses.length > 1 && (
              <div className="address-count-note">
                {addresses.length - 1} address change{addresses.length > 2 ? "s" : ""} recorded
              </div>
            )}
          </div>

          {/* SOCIAL */}
          <div className="card">
            <div className="card-title"><div className="card-title-icon">◇</div> Social Environment</div>
            <div className="field-hint-block">
              <div className="field-hint-title">Active loans among people close to you</div>
              <div className="field-hint-text">
                Roughly how many people in your immediate social circle (family, close friends, colleagues)
                currently have active loans or credit lines?
              </div>
              <select name="social_group" onChange={handle}>
                <option value="low">Very few — 0 to 2 people</option>
                <option value="medium">Some — 3 to 6 people</option>
                <option value="high">Many — 7 or more people</option>
              </select>
            </div>
            <div className="field-hint-block" style={{ marginTop: "1rem" }}>
              <div className="field-hint-title">Loan defaults observed nearby</div>
              <div className="field-hint-text">
                Among those same people, how many have defaulted on or missed repayments in the last 30 days?
                This helps assess surrounding financial health.
              </div>
              <select name="social_risk" onChange={handle}>
                <option value="none">None — no defaults observed</option>
                <option value="few">1 to 2 people have defaulted</option>
                <option value="many">Multiple people have defaulted</option>
              </select>
            </div>

            {/* Contact with credit */}
            <div className="field-hint-block" style={{ marginTop: "1rem" }}>
              <div className="field-hint-title">People in your contacts who have active credit</div>
              <div className="field-hint-text">
                Out of your phone contacts or known associates, roughly how many are currently
                repaying a loan or using a credit card? This is used as a social financial exposure signal.
              </div>
              <input name="contacts" type="number" placeholder="e.g. 5" onChange={handle} />
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENTS SECTION */}
      <div className="section-label" style={{ marginTop: "2.5rem" }}>02 — Supporting Documents</div>
      <div className="card docs-card">
        <div className="card-title"><div className="card-title-icon">📎</div> Upload Identity & Financial Documents</div>
        <p className="docs-intro">
          Upload scanned copies or photos of the documents below. Clear, readable files improve
          processing accuracy. PDF, JPG, and PNG formats are accepted for all fields.
        </p>
        <div className="docs-grid">
          {DOC_TYPES.map(doc => {
            const uploaded = uploadedDocs[doc.key];
            return (
              <div className={`doc-slot ${uploaded ? "doc-slot--uploaded" : ""}`} key={doc.key}>
                <div className="doc-slot-top">
                  <div className="doc-slot-name">{doc.label}</div>
                  <div className="doc-slot-hint">{doc.hint}</div>
                </div>
                <label className="doc-upload-btn">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    style={{ display: "none" }}
                    onChange={e => handleDocUpload(doc.key, e.target.files)}
                  />
                  {uploaded
                    ? <span className="doc-uploaded-label">✓ {uploaded.length} file{uploaded.length > 1 ? "s" : ""} — replace</span>
                    : <span>+ Upload</span>
                  }
                </label>
                {uploaded && (
                  <div className="doc-filenames">
                    {uploaded.map((f, i) => <span key={i} className="doc-filename">{f.name}</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {totalDocs > 0 && (
          <div className="docs-summary">
            <span className="docs-summary-count">✓ {totalDocs} of {DOC_TYPES.length} document categories uploaded</span>
            <div className="docs-progress-track">
              <div className="docs-progress-fill" style={{ width: `${(totalDocs / DOC_TYPES.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="cta-wrap">
        <button className={`cta-btn${loading ? " loading" : ""}`} onClick={predict}>
          {loading ? "Analyzing Profile..." : "Run Risk Analysis →"}
        </button>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="result-section" id="result-anchor">
          <div className="divider" />
          <div className="section-label">03 — Risk Analysis Output</div>

          <div className="result-header">
            <div className="score-ring-wrap">
              <svg className="score-svg" viewBox="0 0 120 120">
                <circle className="score-track" cx="60" cy="60" r="50" />
                <circle
                  className="score-fill"
                  cx="60" cy="60" r="50"
                  stroke={riskColor}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="score-number">
                <span className="score-pct" style={{ color: riskColor }}>{pct}%</span>
                <span className="score-lbl">default risk</span>
              </div>
            </div>

            <div className="risk-meta">
              <div>
                <div style={{ marginBottom: "8px" }}>
                  <span className={`risk-badge-large ${riskCls}`}>{result.risk}</span>
                </div>
                <div className="risk-meta-title" style={{ color: riskColor }}>
                  {riskCls === "low"    && "Creditworthy Profile"}
                  {riskCls === "medium" && "Moderate Risk Profile"}
                  {riskCls === "high"   && "High Risk — Requires Review"}
                </div>
              </div>
              <div className="risk-meta-desc">
                {riskCls === "low"    && "Applicant demonstrates strong financial indicators with low probability of default. Suitable for standard credit products."}
                {riskCls === "medium" && "Applicant shows moderate risk factors. Conditional approval with enhanced monitoring or collateral requirements recommended."}
                {riskCls === "high"   && "Multiple high-risk indicators detected. Standard approval not recommended without significant risk mitigation measures."}
              </div>
            </div>

            <div className="prob-meter">
              <div className="prob-meter-label">Default Probability</div>
              <div className="prob-value" style={{ color: riskColor }}>
                {(result.probability * 100).toFixed(1)}%
              </div>
              <div className="prob-bar-track">
                <div className={`prob-bar-fill ${riskCls}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="prob-scale">
                <span>0%</span><span>50%</span><span>100%</span>
              </div>
            </div>
          </div>

          <div className="analysis-grid">
            <div className="shap-card">
              <div className="shap-title">
                <div className="shap-title-icon">◈</div>
                Feature Impact (SHAP Values)
              </div>
              {result.explanations.map((item, i) => {
                const absVal = Math.abs(item.impact);
                const barW   = Math.max(4, (absVal / maxShap) * 100);
                const isPos  = item.impact > 0;
                return (
                  <div className="shap-row" key={i}>
                    <div className="shap-feature">{item.feature.replace(/_/g, " ").toLowerCase()}</div>
                    <div className="shap-bar-track">
                      <div className={`shap-bar-fill ${isPos ? "pos" : "neg"}`} style={{ width: `${barW}%` }} />
                    </div>
                    <div className={`shap-value ${isPos ? "pos" : "neg"}`}>
                      {isPos ? "+" : ""}{item.impact.toFixed(3)}
                    </div>
                  </div>
                );
              })}
              <div className="shap-legend">
                <div className="shap-legend-item"><div className="legend-dot" style={{ background: "#f43f5e" }} />Increases risk</div>
                <div className="shap-legend-item"><div className="legend-dot" style={{ background: "#a78bfa" }} />Reduces risk</div>
              </div>
            </div>

            <div className="rec-card">
              <div className="rec-title">
                <div className="shap-title-icon">→</div>
                Analyst Recommendations
              </div>
              {recs.map((r, i) => (
                <div className="rec-item" key={i}>
                  <div className="rec-item-icon">{r.icon}</div>
                  <div className="rec-item-text">
                    <strong>{r.title}</strong>
                    {r.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {decision && (
            <div className="decision-row">
              <div>
                <div className="decision-label">{decision.label}</div>
                <div className={`decision-value ${decision.cls}`}>{decision.value}</div>
              </div>
              <div className="decision-factors">
                {decision.factors.map((f, i) => (
                  <div className="decision-factor-chip" key={i}>{f}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}