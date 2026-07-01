import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export function useMenu(triggerToast) {
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch menu products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      triggerToast('Could not load menu from server', 'error');
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const getGroupedProducts = () => {
    const grouped = {};
    const relevantCategories = activeCategory === 'All'
      ? categories.filter(c => c !== 'All')
      : [activeCategory];

    relevantCategories.forEach(cat => {
      const items = products.filter(p => p.category === cat);
      if (items.length > 0) grouped[cat] = items;
    });
    return grouped;
  };

  return {
    products,
    productsLoading,
    activeCategory,
    setActiveCategory,
    categories,
    getGroupedProducts,
    fetchProducts
  };
}
