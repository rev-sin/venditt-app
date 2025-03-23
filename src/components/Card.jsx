import PropTypes from "prop-types";

const Card = ({
  product,
  quantities,
  cartItems,
  handleQuantityChange,
  addToCart,
  removeFromCart,
}) => {
  const inCart = Boolean(cartItems[product.id]);
  const quantity = quantities[product.id] || 1;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
      <div className="relative w-full h-56 bg-gray-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-2 text-gray-900">
          {product.name}
        </h2>
        <p className="text-lg text-gray-700 font-medium">
          &#8377;{product.price}
        </p>
        <p
          className={`text-sm font-semibold mt-1 ${
            isOutOfStock ? "text-red-500" : "text-green-600"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </p>
        {inCart ? (
          <div className="flex items-center mt-4 space-x-2">
            <button
              className="bg-red-500 text-white px-3 py-1 rounded-l hover:bg-red-600 transition"
              onClick={() =>
                quantity > 1
                  ? handleQuantityChange(product.id, quantity - 1)
                  : removeFromCart(product.id)
              }
            >
              -
            </button>
            <input
              type="text"
              className="w-12 text-center border border-gray-300 rounded-md py-1"
              value={quantity}
              onChange={(e) =>
                handleQuantityChange(product.id, parseInt(e.target.value) || 1)
              }
            />
            <button
              className="bg-green-500 text-white px-3 py-1 rounded-r hover:bg-green-600 transition"
              onClick={() => handleQuantityChange(product.id, quantity + 1)}
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  );
};

Card.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stock: PropTypes.number.isRequired,
    imageUrl: PropTypes.string.isRequired,
  }).isRequired,
  quantities: PropTypes.object.isRequired,
  cartItems: PropTypes.object.isRequired,
  handleQuantityChange: PropTypes.func.isRequired,
  addToCart: PropTypes.func.isRequired,
  removeFromCart: PropTypes.func.isRequired,
};

export default Card;
