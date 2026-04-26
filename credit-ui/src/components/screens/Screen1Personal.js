export default function Screen1Personal({ data, update }) {
  return (
    <div className="screen">
      <h2>Let’s start with you</h2>
      <p>Basic details help us understand your profile</p>

      <div className="field">
        <label>What is your age?</label>
        <input
          type="number"
          value={data.age}
          onChange={(e) => update("age", e.target.value)}
        />
      </div>

      <div className="field">
        <label>What is your gender?</label>
        <select onChange={(e) => update("gender", e.target.value)}>
          <option>Select</option>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>

      <div className="field">
        <label>How many people are in your family?</label>
        <input
          type="number"
          onChange={(e) => update("familyMembers", e.target.value)}
        />
      </div>
    </div>
  );
}