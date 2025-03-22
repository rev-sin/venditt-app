import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const AdminProducts = () => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productIsAvailable, setProductIsAvailable] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesList);
    };

    fetchCategories();
  }, []);

  const handleAddProduct = async () => {
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        imageUrl: productImageUrl,
        categoryId: productCategoryId,
        stock: parseInt(productStock, 10),
        isAvailable: productIsAvailable,
      });
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductImageUrl("");
      setProductCategoryId("");
      setProductStock("");
      setProductIsAvailable(false);
      alert("Product added successfully");
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddProduct();
        }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Add Product</h2>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          placeholder="Product Description"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          placeholder="Product Price"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          value={productImageUrl}
          onChange={(e) => setProductImageUrl(e.target.value)}
          placeholder="Product Image URL"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <select
          value={productCategoryId}
          onChange={(e) => setProductCategoryId(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={productStock}
          onChange={(e) => setProductStock(e.target.value)}
          placeholder="Product Stock"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={productIsAvailable}
            onChange={(e) => setProductIsAvailable(e.target.checked)}
            className="form-checkbox"
          />
          <span>Is Available</span>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AdminProducts;
