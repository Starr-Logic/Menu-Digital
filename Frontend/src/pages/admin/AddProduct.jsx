import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { API_BASE_URL } from '../../config';

const PRESET_IMAGES = [];

const createEmptyForm = () => ({
  name: '',
  price: '',
  category: 'Food',
  description: '',
  image: '',
  prep_time_minutes: 5
});

export default function AddProduct({ onProductAdded, onCancel }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageSourceMode, setImageSourceMode] = useState('preset');
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

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
        image: product.image || '',
        prep_time_minutes: product.prep_time_minutes ?? 5
      });
      setImagePreview(product.image || '');
      setImageSourceMode(product.image?.startsWith('/uploads/') ? 'upload' : product.image?.startsWith('http') ? 'url' : 'upload');
      setSelectedProductId(product.id);
      setSelectedFile(null);
      setIsEditing(true);
      return;
    }

    setFormData(createEmptyForm());
    setImagePreview('');
    setImageSourceMode('upload');
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

  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(t('invalid_image_type'));
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
      setAlertMessage({ type: 'error', text: t('product_name_required') });
      return;
    }

    const numericPrice = parseFloat(formData.price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      alert(t('invalid_price'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name.trim());
      payload.append('price', numericPrice.toString());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      payload.append('prep_time_minutes', formData.prep_time_minutes);

      if (selectedFile) {
        payload.append('image', selectedFile);
      } else if (formData.image) {
        payload.append('image', formData.image);
      }

      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        isEditing && selectedProductId ? `${API_BASE_URL}/products/${selectedProductId}` : `${API_BASE_URL}/products`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: payload
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t('error_saving_product'));
      }

      const savedProduct = await response.json();
      await fetchProducts();
      if (onProductAdded) {
        onProductAdded(savedProduct, isEditing);
      }

      resetForm(isEditing ? savedProduct : null);
    } catch (err) {
      console.error(err);
      setAlertMessage({ type: 'error', text: err.message || t('error_saving_product') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!product?.id) return;
    
    // Show confirmation modal
    setConfirmDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete?.id) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/products/${confirmDelete.id}`, { method: 'DELETE', headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      } });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || t('error_deleting_product'));
      }

      await fetchProducts();
      if (selectedProductId === confirmDelete.id) {
        resetForm();
      }

      if (onProductAdded) {
        onProductAdded(confirmDelete, true, 'delete');
      }

      setAlertMessage({ type: 'success', text: t('deleted_success', { name: confirmDelete.name }) });
      setConfirmDelete(null);
    } catch (error) {
      console.error(error);
      setAlertMessage({ type: 'error', text: error.message || t('error_deleting_product') });
      setConfirmDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in" id="add-product-container">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-teal-400" />
            {isEditing ? t('edit_product') : t('add_new_product')}
          </h2>
          <p className="text-slate-500 text-xs">
            {t('upload_real_photo')}
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('back_to_menu')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                  {isEditing ? t('update_product_details') : t('create_new_product')}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t('uploaded_image_stored')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetForm()}
                className="px-3 py-2 text-[11px] font-bold rounded-lg border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              >
                {t('new_product')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="product-name" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  {t('product_name')} <span className="text-teal-400">*</span>
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
                    placeholder={t('placeholder_product_name')}
                    required
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="product-price" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                    {t('price_usd')} <span className="text-teal-400">*</span>
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
                      placeholder={t('placeholder_price')}
                      required
                      className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="product-category" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                    {t('category')} <span className="text-teal-400">*</span>
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
                <label htmlFor="product-prep-time" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  {t('prep_time_minutes')} <span className="text-teal-400">*</span>
                </label>
                <input
                  type="number"
                  id="product-prep-time"
                  name="prep_time_minutes"
                  min="1"
                  value={formData.prep_time_minutes}
                  onChange={handleChange}
                  placeholder={t('placeholder_prep_time')}
                  required
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="product-desc" className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                  {t('menu_description')}
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
                    placeholder={t('placeholder_desc')}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    {t('image_source_selection')}
                  </span>
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('url')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
                        imageSourceMode === 'url' ? 'bg-teal-500/10 text-teal-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('image_url')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageSourceMode('upload')}
                      className={`px-2.5 py-1 text-[10px] font-black rounded-md transition-all ${
                        imageSourceMode === 'upload' ? 'bg-teal-500/10 text-teal-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {t('file_upload')}
                    </button>
                  </div>
                </div>

                {imageSourceMode === 'url' && (
                  <div className="space-y-2">
                    <label htmlFor="product-image" className="block text-[11px] font-bold text-slate-500">
                      {t('provide_external_url')}
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
                        placeholder={t('placeholder_url')}
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
                      {t('drag_drop_image')}
                    </p>
                    <label className="mt-2 inline-block cursor-pointer">
                      <span className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-[11px] font-extrabold text-teal-400 hover:text-teal-300 border border-slate-800 rounded-lg transition-all">
                        {t('browse_files')}
                      </span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-[10px] text-slate-500 mt-2">
                      {t('supports_jpg_png')}
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
                      {isEditing ? t('updating_product') : t('creating_product')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-3" />
                      {isEditing ? t('edit_product') : t('add_new_product')}
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
              {t('live_preview')}
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
                    <span className="text-[10px] font-bold">{t('no_image_selected')}</span>
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
                      {formData.name.trim() || t('preview_product_name')}
                    </h5>
                    <span className="text-sm font-black text-amber-400 shrink-0">
                      ${formData.price ? parseFloat(formData.price).toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-3 leading-normal font-light">
                    {formData.description.trim() || t('preview_desc')}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500">{t('interactive_menu_card')}</span>
                  <span className="text-teal-400 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-3" /> {t('stored_on_server')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl text-[11px] text-slate-500 leading-relaxed flex gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                {t('image_upload_info')}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {t('manage_existing_products')}
              </h4>
              <span className="text-[11px] text-slate-500">{products.length} items</span>
            </div>

            {isLoadingProducts ? (
              <p className="text-[11px] text-slate-500">{t('loading')}</p>
            ) : products.length === 0 ? (
              <p className="text-[11px] text-slate-500">{t('no_products_yet')}</p>
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
                        title={t('edit')}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="p-2 rounded-lg border border-rose-900/40 text-rose-400 hover:bg-rose-950/30"
                        title={t('delete')}
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

      {/* Alert/Toast Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAlertMessage(null)} />
          <div className={`relative rounded-2xl border p-6 max-w-sm w-full shadow-2xl ${
            alertMessage.type === 'error' 
              ? 'bg-rose-950/80 border-rose-900/40' 
              : 'bg-emerald-950/80 border-emerald-900/40'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${
                alertMessage.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
              }`} />
              <h3 className={`font-black text-sm ${
                alertMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {alertMessage.type === 'error' ? t('error') : t('success')}
              </h3>
            </div>
            <p className="text-slate-200 text-sm mb-4">{alertMessage.text}</p>
            <button
              onClick={() => setAlertMessage(null)}
              className={`w-full py-2 rounded-lg font-bold text-sm transition-all ${
                alertMessage.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
            >
              {t('ok')}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative rounded-2xl border border-rose-900/40 bg-slate-950/90 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-black text-slate-100 mb-2">{t('delete_product_confirm_title')}</h3>
            <p className="text-slate-400 text-sm mb-6" dangerouslySetInnerHTML={{ __html: t('delete_product_confirm_desc', { name: confirmDelete.name }) }} />
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 font-bold text-sm transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
