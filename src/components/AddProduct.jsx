import { useEffect, useState } from 'react';
import {
  Plus,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Utensils,
  AlignLeft,
  Check,
  ArrowLeft,
  UploadCloud,
  HelpCircle,
  FileImage,
  Pencil,
  Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const PRESET_IMAGES = [
  {
    name: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Fresh Salad',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Cappuccino / Latte',
    url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Strawberry Cake',
    url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Pepperoni Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Sushi Platter',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
  }
];

const createEmptyForm = () => ({
  name: '',
  price: '',
  category: 'Food',
  description: '',
  image: PRESET_IMAGES[0].url
});

export default function AddProduct({ onProductAdded, onCancel }) {
  const [formData, setFormData] = useState(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(PRESET_IMAGES[0].url);
  const [imageSourceMode, setImageSourceMode] = useState('preset');
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const categories = ['Food', 'Drinks', 'Dessert', 'Appetizer', 'Specialty'];

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to load products');
      setProducts(await response.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = (product = null) => {
    if (product) {
      setFormData({
        name: product.name || '',
        price: product.price ?? '',
        category: product.category || 'Food',
        description: product.description || '',
        image: product.image || PRESET_IMAGES[0].url
      });
      setImagePreview(product.image || PRESET_IMAGES[0].url);
      setImageSourceMode(product.image?.startsWith('/uploads/') ? 'upload' : product.image?.startsWith('http') ? 'url' : 'preset');
      setSelectedProductId(product.id);
      setSelectedFile(null);
      setIsEditing(true);
      return;
    }

    setFormData(createEmptyForm());
    setImagePreview(PRESET_IMAGES[0].url);
    setImageSourceMode('preset');
    setSelectedProductId(null);
    setSelectedFile(null);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'image') {
      setImagePreview(value);
      setSelectedFile(null);
    }
  };

  const handleSelectPreset = (url) => {
    setFormData((prev) => ({ ...prev, image: url }));
    setImagePreview(url);
    setSelectedFile(null);
    setImageSourceMode('preset');
  };

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({ ...prev, image: file.name }));
    setImagePreview(URL.createObjectURL(file));
    setImageSourceMode('upload');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Product Name is required');
      return;
    }

    const numericPrice = parseFloat(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('price', numericPrice.toString());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);

      if (selectedFile) {
        payload.append('image', selectedFile);
      } else if (formData.image) {
        payload.append('image', formData.image);
      }

      const response = await fetch(
        isEditing && selectedProductId ? `${API_BASE_URL}/products/${selectedProductId}` : `${API_BASE_URL}/products`,
        {
          method: isEditing ? 'PUT' : 'POST',
          body: payload
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save product');
      }

      const savedProduct = await response.json();
      await fetchProducts();
      if (onProductAdded) {
        onProductAdded(savedProduct, isEditing);
      }

      resetForm(isEditing ? savedProduct : null);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error occurred while saving product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!product?.id || !window.confirm(`Delete ${product.name}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete product');
      }

      await fetchProducts();
      if (selectedProductId === product.id) {
        resetForm();
      }

      if (onProductAdded) {
        onProductAdded(product, true, 'delete');
      }
    } catch (error) {
      console.error(error);
      alert(error.message || 'Error deleting product');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in" id="add-product-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-400" />
            {isEditing ? 'Edit Menu Product' : 'Add New Menu Product'}
          </h2>
          <p className="text-slate-500 text-xs">
            Upload a real product photo, save it to the server folder, and update or remove menu items instantly.
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                  {isEditing ? 'Update product details' : 'Create a new product'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  The uploaded image is stored in the server uploads folder and linked to the product record.
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetForm()}
                className="px-3 py-2 text-[11px] font-bold rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              >
                New Product
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="product-name" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  Product Name <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Utensils className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    id="product-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Flame Grilled Ribeye Steak"
                    required
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="product-price" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                    Price (USD) <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      id="product-price"
                      name="price"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="24.99"
                      required
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="product-category" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                    Category <span className="text-teal-400">*</span>
                  </label>
                  <select
                    id="product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm focus:outline-none transition-all"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="product-desc" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  Menu Description
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 text-slate-500">
                    <AlignLeft className="w-4 h-4" />
                  </span>
                  <textarea
                    id="product-desc"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your dish highlights, ingredients, allergies, and presentation details..."
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Image Source Selection
                  </span>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('preset')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
                        imageSourceMode === 'preset' ? 'bg-teal-500/10 text-teal-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
                        imageSourceMode === 'url' ? 'bg-teal-500/10 text-teal-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
                        imageSourceMode === 'upload' ? 'bg-teal-500/10 text-teal-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      File Upload
                    </button>
                  </div>
                </div>

                {imageSourceMode === 'preset' && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      Pick a starter image or keep the current one.
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`group relative h-16 rounded-xl overflow-hidden border transition-all text-left ${
                            formData.image === preset.url ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-850 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover brightness-[0.4] group-hover:brightness-50 transition-all"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 p-2 flex flex-col justify-end">
                            <span className="text-[9px] font-black text-slate-200 line-clamp-1 leading-tight">{preset.name}</span>
                          </div>
                          {formData.image === preset.url && (
                            <span className="absolute top-1.5 right-1.5 p-0.5 bg-teal-500 text-slate-950 rounded-full">
                              <Check className="w-2.5 h-2.5 stroke-4" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {imageSourceMode === 'url' && (
                  <div className="space-y-2">
                    <label htmlFor="product-image" className="block text-[11px] font-bold text-slate-500">
                      Provide External Image URL
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <ImageIcon className="w-4 h-4" />
                      </span>
                      <input
                        type="url"
                        id="product-image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://images.unsplash.com/your-custom-image-url..."
                        className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-xs placeholder-slate-750 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {imageSourceMode === 'upload' && (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      dragActive ? 'border-teal-500 bg-teal-500/5' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-xs text-slate-300 font-bold">
                      Drag and drop your food photo here, or
                    </p>
                    <label className="mt-2 inline-block cursor-pointer">
                      <span className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-extrabold text-teal-400 hover:text-teal-300 border border-slate-800 rounded-lg transition-all">
                        Browse Files
                      </span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Supports PNG, JPG, JPEG, WEBP files
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-850">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                      Saving Product...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-3" />
                      {isEditing ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Live Preview
            </h4>

            <div className="bg-slate-950 border border-slate-850 rounded-2.5xl overflow-hidden shadow-xl flex flex-col h-85">
              <div className="h-44 relative bg-slate-900 overflow-hidden shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview Card"
                    className="w-full h-full object-cover transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                    }}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-900">
                    <FileImage className="w-10 h-10 mb-2" />
                    <span className="text-[10px] font-bold">No Image Selected</span>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span className="bg-slate-950/80 backdrop-blur-md text-teal-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-teal-500/20 uppercase tracking-wider">
                    {formData.category}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-extrabold text-slate-200 text-sm line-clamp-1">
                      {formData.name.trim() || 'Product Name Preview'}
                    </h5>
                    <span className="text-sm font-black text-amber-400 shrink-0">
                      ${formData.price ? parseFloat(formData.price).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-normal font-light">
                    {formData.description.trim() || 'Menu highlights and fresh ingredient descriptions will be rendered elegantly here.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500">Interactive Menu Card</span>
                  <span className="text-teal-400 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-3" /> Stored on server
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-[11px] text-slate-500 leading-relaxed flex gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Image uploads:</strong> files are saved under the server uploads/products folder and shown in the menu immediately after you save.
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Manage existing products
              </h4>
              <span className="text-[11px] text-slate-500">{products.length} items</span>
            </div>

            {isLoadingProducts ? (
              <p className="text-[11px] text-slate-500">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-[11px] text-slate-500">No products yet. Create one to get started.</p>
            ) : (
              <div className="space-y-2 max-h-75 overflow-y-auto pr-1">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => resetForm(product)}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-semibold text-slate-200">{product.name}</div>
                      <div className="text-[10px] text-slate-500">{product.category} • ${Number(product.price || 0).toFixed(2)}</div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => resetForm(product)}
                        className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="p-2 rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/30"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
