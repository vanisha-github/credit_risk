import { useState } from "react";
import "./App.css";
import "./styles.css";

export default function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const socialMap = {
  low: 2,
  medium: 5,
  high: 8,
};

const defaultMap = {
  none: 0,
  few: 1,
  many: 3,
};

  const predict = async () => {
    if (!form.age || !form.income || !form.credit) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      AGE: Number(form.age),
      CODE_GENDER: form.gender === "Male" ? 1 : 0,
      CNT_CHILDREN: Number(form.children || 0),
      CNT_FAM_MEMBERS: Number(form.family || 1),

      AMT_INCOME_TOTAL: Number(form.income),
      AMT_CREDIT: Number(form.credit),
      AMT_ANNUITY: Number(form.annuity || 0),
      AMT_GOODS_PRICE: Number(form.goods || form.credit),

      NAME_INCOME_TYPE: form.incomeType || "Working",
      NAME_EDUCATION_TYPE: form.education || "Secondary",
      NAME_FAMILY_STATUS: form.familyStatus || "Married",
      HOUSING_TYPE: form.housingType || "Own house",

      OWN_CAR_AGE:
        form.car === "No" ? -1 : Number(form.car_age || -1),

      YEARS_EMPLOYED: Number(form.employed || 0),
      CONTACT_COUNT: Number(form.contacts || 1),
      ADDRESS_MISMATCH_COUNT: Number(form.address_mismatch || 0),

      OBS_30_CNT_SOCIAL_CIRCLE: socialMap[form.social_group] || 0,
DEF_30_CNT_SOCIAL_CIRCLE: defaultMap[form.social_risk] || 0,

      DOC_COUNT: Number(form.documents || 0),

      AMT_REQ_CREDIT_BUREAU_WEEK: Number(form.enq_week || 0),
      AMT_REQ_CREDIT_BUREAU_YEAR: Number(form.enq_year || 0),

      YEARS_LAST_PHONE_CHANGE: Number(form.phone_change || 1),

      EXT_SOURCE_1: Number(form.ext1 || 0.6),
      EXT_SOURCE_2: Number(form.ext2 || 0.6),
      EXT_SOURCE_3: Number(form.ext3 || 0.6),

      SKILL_TYPE: form.skill || "Low skill",
      ORG_TYPE: form.org || "Stable org",
    };

    const res = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="main-wrapper">

      {/* HEADER */}
      <div className="header">
        <h1>💳 Credit Risk Assessment</h1>
        <p>Smart evaluation. Better decisions.</p>
      </div>

      {/* CENTERED GRID */}
      <div className="container">

        {/* LEFT COLUMN */}
        <div className="column">

          <div className="card">
            <h3>Personal Information</h3>

            <label>Age</label>
            <input name="age" type="number" onChange={handle} />
            <small>Your age in years</small>

            <label>Gender</label>
            <select name="gender" onChange={handle}>
              <option>Male</option>
              <option>Female</option>
            </select>

            <label>Children</label>
            <input name="children" type="number" onChange={handle} />
              <small>Number of children (if any)</small>

            <label>Family Members</label>
            <input name="family" type="number" onChange={handle} />
              <small>Total number of people in your family</small>
          </div>

          <div className="card">
            <h3>Financial Details</h3>

            <label>Annual Income</label>
            <input name="income" type="number" onChange={handle} />
            <small>
Enter your total yearly income before tax (salary + business + other sources)
</small>

            <label>Loan Amount</label>
            <input name="credit" type="number" onChange={handle} />
            <small>How much loan are you applying for?</small>

            <label>EMI</label>
            <input name="annuity" type="number" onChange={handle} />
            <small>Your expected monthly payment for this loan</small>

            <label>Goods Price</label>
            <input name="goods" type="number" onChange={handle} />
            <small>Cost of the item you want to buy (if applicable)</small>
          </div>

          <div className="card">
            <h3>Employment</h3>

            <label>Years Employed</label>
            <input name="employed" type="number" onChange={handle} />

            <label>Income Type</label>
            <select name="incomeType" onChange={handle}>
              <option value="Working">Working</option>
              <option value="State servant">Government</option>
              <option value="Pensioner">Pensioner</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="card">
            <h3>Credit Behaviour</h3>

            <input placeholder="Weekly Enquiries" name="enq_week" onChange={handle} />
            <small>How many times have you inquired about credit in the past week?</small>
            <input placeholder="Yearly Enquiries" name="enq_year" onChange={handle} />
            <small>How many times have you inquired about credit in the past year?</small>
            <input placeholder="Phone Change (Years)" name="phone_change" onChange={handle} />
            <small>How many years since you last changed your phone number?</small>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="column">

          <div className="card">
            <h3>Profile & Job</h3>

<div className="section">
  <h4>Personal Profile</h4>

  <label>Education</label>
  <select name="education" onChange={handle}>
    <option>Secondary</option>
    <option>Higher education</option>
    <option>Incomplete higher</option>
    <option>Lower secondary</option>
  </select>

  <label>Family Status</label>
  <select name="familyStatus" onChange={handle}>
    <option>Married</option>
    <option>Single</option>
    <option>Widow</option>
  </select>
</div>

<div className="section">
  <h4>Work Details</h4>

  <label>Skill Type</label>
  <select name="skill" onChange={handle}>
    <option value="High skill">High Skill (IT, Manager)</option>
    <option value="Low skill">Low Skill (Labor, Helper)</option>
  </select>

  <label>Organization Type</label>
  <select name="org" onChange={handle}>
    <option value="Stable org">Stable (Govt / MNC)</option>
    <option value="Risky org">Startup / Contract</option>
  </select>
</div>
          </div>

          <div className="card">
            <h3>Housing & Assets</h3>

            <label>Housing Type</label>
            <select name="housingType" onChange={handle}>
              <option value="Own house">Own House</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other</option>
            </select>
            <label>Do you own a car?</label>
            <select name="car" onChange={handle}>
              <option>Yes</option>
              <option>No</option>
            </select>

            <input placeholder="Car Age" name="car_age" onChange={handle} />
            <small>If you have a car, how old is it (in years)?</small>
          </div>

          <div className="card">
            <h3>Contact & Address</h3>

            <label>Contacts</label>
            <input name="contacts" type="number" onChange={handle} />
            <small>How many people do you know who have credit accounts?</small>

            <label>Address Changes</label>
            <input name="address_mismatch" type="number" onChange={handle} />
            <small>How many times has your address changed in the past year?</small>
          </div>
            
          </div>

          <div className="card">
            <h3>Social & Documents</h3>

            <label>Do people around you have active loans?</label>
<select name="social_group" onChange={handle}>
  <option value="low">Very few (0–2 people)</option>
  <option value="medium">Some (3–6 people)</option>
  <option value="high">Many (7+ people)</option>
</select>
<small>This helps us understand your financial environment</small>

<label>Have you seen people default on loans?</label>
<select name="social_risk" onChange={handle}>
  <option value="none">No one defaulted</option>
  <option value="few">1–2 people</option>
  <option value="many">Multiple defaults</option>
</select>
<small>Used to assess financial risk patterns around you</small>
            
            <label>Upload Documents</label>

<div className="upload-box">
  <input
  type="file"
  multiple
  onChange={(e) => {
    const files = Array.from(e.target.files);

    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || 0) + files.length,
    }));
  }}
/>

<small>Add valid documents for better verification</small>
<p>{form.documents || 0} documents uploaded</p>
          </div>

          <div className="card">
            <h3>Credit Scores</h3>
            <small>Enter your credit scores from different bureaus</small>
            <input placeholder="Score 1" name="ext1" step="0.01" onChange={handle} />

            <input placeholder="Score 2" name="ext2" step="0.01" onChange={handle} />
            <input placeholder="Score 3" name="ext3" step="0.01" onChange={handle} />
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="action">
        <button onClick={predict}>Analyze Risk →</button>
      </div>

      {/* RESULT PANEL (BOTTOM like your requirement) */}
      {result && (
  <div className="analysis-container">

    {/* SCORE SECTION */}
    <div className="score-card">
      <h2>Risk Assessment</h2>

      <div className="score-circle">
        {(result.probability * 100).toFixed(0)}%
      </div>

      <p className="risk-text">{result.risk}</p>
      <small>
        This score represents the likelihood of loan default based on your profile.
      </small>
    </div>

    {/* SHAP EXPLANATION */}
    <div className="shap-card">
      <h3>🔍 What influenced your score?</h3>

      <div className="shap-bars">
        {result.explanations.map((item, i) => {
          const value = item.impact;
          const width = Math.min(Math.abs(value) * 300, 100); // scale

          return (
            <div key={i} className="shap-row">
              <div className="feature">{item.feature}</div>

              <div className="bar-container">
                <div
                  className={`bar ${value > 0 ? "positive" : "negative"}`}
                  style={{ width: `${width}%` }}
                ></div>
              </div>

              <div className="value">
                {value > 0 ? "+" : ""}
                {value.toFixed(3)}
              </div>
            </div>
          );
        })}
      </div>
    </div>

  </div>
)}
    </div>
  );
}