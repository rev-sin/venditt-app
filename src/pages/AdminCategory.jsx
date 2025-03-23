import { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

const AdminCategories = () => {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
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

  const handleAddCategory = async () => {
    try {
      await addDoc(collection(db, "categories"), {
        name: categoryName,
        description: categoryDescription,
      });
      setCategoryName("");
      setCategoryDescription("");
      alert("Category added successfully");
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Admin Categories</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddCategory();
        }}
        style={{ marginBottom: "20px" }}
      >
        <h2>Add Category</h2>
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Category Name"
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "8px",
            width: "100%",
          }}
        />
        <input
          type="text"
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
          placeholder="Category Description"
          style={{
            display: "block",
            marginBottom: "10px",
            padding: "8px",
            width: "100%",
          }}
        />
        <button
          type="submit"
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Add Category
        </button>
      </form>
      <h2>Existing Categories</h2>
      <ul style={{ listStyleType: "none", padding: "0" }}>
        {categories.map((category) => (
          <li
            key={category.id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            <strong>{category.name}</strong>: {category.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategories;
