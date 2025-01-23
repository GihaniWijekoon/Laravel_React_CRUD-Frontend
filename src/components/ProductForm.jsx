import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './ProductForm.css';

const productSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  price: yup.number().positive().required('Price is required'),
  description: yup.string().required('Description is required'),
  category_id: yup.number().required('Category is required')
});

const ProductForm = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(productSchema)
  });

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/v1/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    // Fetch product details for edit mode
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/v1/products/${id}`);
        const product = response.data;
        setValue('name', product.name);
        setValue('price', product.price);
        setValue('description', product.description);
        setValue('category_id', product.category_id);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await axios.put(`http://127.0.0.1:8000/api/v1/products/${id}`, data);
      } else {
        await axios.post('http://127.0.0.1:8000/api/v1/products', data);
      }
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  return (
    <div>
      <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Name</label>
          <input {...register('name')} />
          {errors.name && <p>{errors.name.message}</p>}
        </div>
        <div>
          <label>Price</label>
          <input type="number" {...register('price')} />
          {errors.price && <p>{errors.price.message}</p>}
        </div>
        <div>
          <label>Description</label>
          <textarea {...register('description')}></textarea>
          {errors.description && <p>{errors.description.message}</p>}
        </div>
        <div>
          <label>Category</label>
          <select {...register('category_id')}>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && <p>{errors.category_id.message}</p>}
        </div>
        <button type="submit">
          {isEditMode ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;