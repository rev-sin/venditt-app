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
            const categoriesList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
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
        <div>
            <h1>Admin Categories</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddCategory();
                }}
            >
                <h2>Add Category</h2>
                <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Category Name"
                />
                <input
                    type="text"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Category Description"
                />
                <button type="submit">Add Category</button>
            </form>
            <h2>Existing Categories</h2>
            <ul>
                {categories.map((category) => (
                    <li key={category.id}>
                        {category.name}: {category.description}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AdminCategories;