export default function Screen2Family({ update }) {
  return (
    <div className="screen">
      <h2>Family Details</h2>

      <div className="field">
        <label>How many children do you have?</label>
        <input
          type="number"
          onChange={(e) => update("children", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Your current family status</label>
        <select onChange={(e) => update("familyStatus", e.target.value)}>
          <option>Select</option>
          <option>Single</option>
          <option>Married</option>
          <option>Separated</option>
        </select>
      </div>
    </div>
  );
}