import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(productsList);
      setProducts(productsList);
      setFilteredProducts(productsList);
    };

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(categoriesList);
    };

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(
        products.filter((product) => product.categoryId === selectedCategory)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  return (
    <div className="container mx-auto p-4 flex">
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
          {categories.map((category) => (
            <button
              key={category.id}
              className={`block w-full text-left p-2 mb-2 ${
                selectedCategory === category.id ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <h2 className="text-xl font-semibold mb-2">
                {product.product_name}
              </h2>
              <p className="text-gray-700 mb-1">Price: ${product.price}</p>
              <p className="text-gray-700">Quantity: {product.stock}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
