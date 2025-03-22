import PropTypes from 'prop-types';

const Sidebar = ({ selectedCategory, setSelectedCategory }) => {
  return (
    <div className="w-1/4 p-4">
      <h2 className="text-2xl font-bold mb-4">Filters</h2>
      <div>
        <button
          className={`block w-full text-left p-2 mb-2 ${
            selectedCategory === "" ? "bg-gray-200" : ""
          }`}
          onClick={() => setSelectedCategory("")}
        >
          All
        </button>
        <button
          className={`block w-full text-left p-2 mb-2 ${
            selectedCategory === "Namkeen" ? "bg-gray-200" : ""
          }`}
          onClick={() => setSelectedCategory("Namkeen")}
        >
          Namkeen
        </button>
        <button
          className={`block w-full text-left p-2 mb-2 ${
            selectedCategory === "Beverage" ? "bg-gray-200" : ""
          }`}
          onClick={() => setSelectedCategory("Beverage")}
        >
          Beverage
        </button>
        {/* Add more filter buttons as needed */}
      </div>
    </div>
  );
}
Sidebar.propTypes = {
  selectedCategory: PropTypes.string.isRequired,
  setSelectedCategory: PropTypes.func.isRequired,
};

export default Sidebar;
