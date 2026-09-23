import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit3, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import api from '../../services/api';

const FOOD_TYPE_OPTIONS = [
  { value: 'Cooked Meal', label: 'Cooked Meal (Rice, Curry, Dal, etc.)' },
  { value: 'Bakery Items', label: 'Bakery Items (Bread, Pastry, Buns)' },
  { value: 'Fresh Produce', label: 'Fresh Produce (Vegetables, Fruits)' },
  { value: 'Packaged Food', label: 'Packaged / Canned Goods' },
  { value: 'Dairy Products', label: 'Dairy Products (Milk, Paneer)' },
  { value: 'Other', label: 'Other Food Item' }
];

const STORAGE_METHOD_OPTIONS = [
  { value: 'Room Temperature', label: 'Room Temperature (Standard shelf)' },
  { value: 'Heated / Insulated Box', label: 'Heated / Hot Thermal Container' },
  { value: 'Refrigerated / Chilled', label: 'Refrigerated / Cold Storage' },
  { value: 'Frozen', label: 'Frozen Storage' }
];

const QUANTITY_UNIT_OPTIONS = [
  { value: 'servings', label: 'Servings (meals)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'packets', label: 'Packets' },
  { value: 'boxes', label: 'Boxes' }
];

// Helper to convert Date to YYYY-MM-DDTHH:mm for datetime-local input
const toDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

const DonationFormModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData = null
}) => {
  const isEditing = Boolean(initialData?._id);

  // Form state
  const [formData, setFormData] = useState({
    foodName: '',
    foodType: 'Cooked Meal',
    quantity: '',
    quantityUnit: 'servings',
    preparationTime: '',
    storageMethod: 'Heated / Insulated Box',
    pickupLocation: '',
    pickupDeadline: '',
    description: '',
    image: ''
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form on open or when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        foodName: initialData.foodName || '',
        foodType: initialData.foodType || 'Cooked Meal',
        quantity: initialData.quantity || '',
        quantityUnit: initialData.quantityUnit || 'servings',
        preparationTime: toDateTimeLocal(initialData.preparationTime),
        storageMethod: initialData.storageMethod || 'Heated / Insulated Box',
        pickupLocation: initialData.pickupLocation || '',
        pickupDeadline: toDateTimeLocal(initialData.pickupDeadline),
        description: initialData.description || '',
        image: initialData.image || ''
      });
    } else {
      // Default creation state: prep time = now, deadline = now + 4 hours
      const now = new Date();
      const in4Hours = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      setFormData({
        foodName: '',
        foodType: 'Cooked Meal',
        quantity: '',
        quantityUnit: 'servings',
        preparationTime: toDateTimeLocal(now),
        storageMethod: 'Heated / Insulated Box',
        pickupLocation: '',
        pickupDeadline: toDateTimeLocal(in4Hours),
        description: '',
        image: ''
      });
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Client-side quick checks
    if (!formData.foodName.trim()) {
      setErrorMessage('Food name is required.');
      return;
    }
    const qtyNum = Number(formData.quantity);
    if (isNaN(qtyNum) || qtyNum < 1) {
      setErrorMessage('Quantity must be at least 1.');
      return;
    }
    if (!formData.preparationTime) {
      setErrorMessage('Preparation time is required.');
      return;
    }
    if (!formData.pickupDeadline) {
      setErrorMessage('Pickup deadline is required.');
      return;
    }
    if (new Date(formData.pickupDeadline) <= new Date()) {
      setErrorMessage('Pickup deadline must be in the future.');
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setErrorMessage('Pickup location is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const payload = {
      foodName: formData.foodName.trim(),
      foodType: formData.foodType,
      quantity: qtyNum,
      quantityUnit: formData.quantityUnit,
      preparationTime: new Date(formData.preparationTime).toISOString(),
      storageMethod: formData.storageMethod,
      pickupLocation: formData.pickupLocation.trim(),
      pickupDeadline: new Date(formData.pickupDeadline).toISOString(),
      description: formData.description.trim(),
      image: formData.image.trim()
    };

    try {
      let res;
      if (isEditing) {
        res = await api.put(`/donations/${initialData._id}`, payload);
      } else {
        res = await api.post('/donations', payload);
      }

      if (res.data.success) {
        onSuccess(res.data.data.donation);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save donation. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Donation' : 'Create New Food Donation'}
      maxWidth="lg"
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Food Name & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Food Name / Item"
            name="foodName"
            required
            value={formData.foodName}
            onChange={handleChange}
            placeholder="e.g. Vegetable Biryani, Bread"
          />

          <Select
            label="Food Type"
            name="foodType"
            required
            value={formData.foodType}
            onChange={handleChange}
            options={FOOD_TYPE_OPTIONS}
          />
        </div>

        {/* Row 2: Quantity & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min={1}
            required
            value={formData.quantity}
            onChange={handleChange}
            placeholder="e.g. 25"
          />

          <Select
            label="Quantity Unit"
            name="quantityUnit"
            required
            value={formData.quantityUnit}
            onChange={handleChange}
            options={QUANTITY_UNIT_OPTIONS}
          />
        </div>

        {/* Row 3: Preparation Time & Storage Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Preparation Time"
            name="preparationTime"
            type="datetime-local"
            required
            value={formData.preparationTime}
            onChange={handleChange}
          />

          <Select
            label="Storage Method"
            name="storageMethod"
            required
            value={formData.storageMethod}
            onChange={handleChange}
            options={STORAGE_METHOD_OPTIONS}
          />
        </div>

        {/* Row 4: Pickup Deadline & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Pickup Deadline"
            name="pickupDeadline"
            type="datetime-local"
            required
            helperText="Must be a future time when food is still edible"
            value={formData.pickupDeadline}
            onChange={handleChange}
          />

          <Input
            label="Pickup Location / Address"
            name="pickupLocation"
            required
            placeholder="e.g. Hotel Grand, Sector 4, Mumbai"
            value={formData.pickupLocation}
            onChange={handleChange}
          />
        </div>

        {/* Row 5: Description & Image URL */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1" htmlFor="description">
              Special Instructions / Dietary Details (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Vegetarian, freshly prepared at 2 PM, contains no nuts, packed in insulated boxes."
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <Input
            label="Food Image URL (Optional)"
            name="image"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            helperText="Provide a valid direct image link"
            value={formData.image}
            onChange={handleChange}
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            icon={isEditing ? Edit3 : PlusCircle}
          >
            {isEditing ? 'Save Changes' : 'Publish Donation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DonationFormModal;
