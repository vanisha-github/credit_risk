export default function Screen7Assets({ update }) {
  return (
    <div className="screen">
      <h2>Your Assets</h2>

      <div className="field">
        <label>Do you own a house?</label>
        <select onChange={(e) => update("ownHouse", e.target.value)}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <div className="field">
        <label>Do you own a car?</label>
        <select onChange={(e) => update("ownCar", e.target.value)}>
          <option>Yes</option>
          <option>No</option>
        </select>
      </div>

      <div className="field">
        <label>Car age</label>
        <input
          type="number"
          onChange={(e) => update("carAge", e.target.value)}
        />
      </div>
    </div>
  );
}