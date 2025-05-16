import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Event as EventType, Category, EventImage, CreateEventPayload } from '../types/index';
import { getCategories, createCategory } from '../services/eventService';
import { uploadEventImage, setPrimaryEventImage, deleteEventImage } from '../services/eventImageService';
import { useAuth } from '../hooks/useAuth';

interface EventFormProps {
  initialEvent?: EventType | null;
  onSubmit: (eventData: CreateEventPayload, eventId?: number) => Promise<EventType | null | void>;
  isEditMode: boolean;
}

const formatDateForInput = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
  return adjustedDate.toISOString().substring(0, 16);
};

const EventForm: React.FC<EventFormProps> = ({ initialEvent, onSubmit, isEditMode }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const now = new Date();
  const defaultStartDate = !isEditMode ? formatDateForInput(now) : '';
  const defaultEndDate = !isEditMode ? formatDateForInput(new Date(now.getTime() + 60 * 60 * 1000)) : '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [venue, setVenue] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [primaryImageFileIndex, setPrimaryImageFileIndex] = useState<number | null>(null);
  const [currentEventImages, setCurrentEventImages] = useState<EventImage[]>([]);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const navigate = useNavigate();

  const PLACEHOLDER_IMAGE = `https://placehold.co/150x100?text=${t('eventForm.noImagePlaceholder')}`;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        setFormError(t('eventForm.errors.loadCategories'));
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && initialEvent) {
      setTitle(initialEvent.title);
      setDescription(initialEvent.description);
      setStartDate(initialEvent.startDate ? formatDateForInput(new Date(initialEvent.startDate)) : '');
      setEndDate(initialEvent.endDate ? formatDateForInput(new Date(initialEvent.endDate)) : '');
      setVenue(initialEvent.venue);
      setPrice(initialEvent.price);
      setCategoryId(initialEvent.categoryId);
      setCurrentEventImages(initialEvent.images || []);
      setNewImageFiles([]);
      setPrimaryImageFileIndex(null);
    } else if (!isEditMode) {
      setTitle('');
      setDescription('');
      setStartDate(formatDateForInput(new Date()));
      setEndDate(formatDateForInput(new Date(new Date().getTime() + 60 * 60 * 1000)));
      setVenue('');
      setPrice('');
      setCategoryId('');
      setCurrentEventImages([]);
      setNewImageFiles([]);
      setPrimaryImageFileIndex(null);
    }
  }, [initialEvent, isEditMode]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const currentNewFilesCount = newImageFiles.length;
      setNewImageFiles(prevFiles => [...prevFiles, file]);
      
      if (primaryImageFileIndex === null && !isEditMode) {
        setPrimaryImageFileIndex(currentNewFilesCount); 
      }
      setImageError(null);
      e.target.value = '';
    }
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    const updatedFiles = newImageFiles.filter((_, index) => index !== indexToRemove);
    
    if (primaryImageFileIndex === indexToRemove) {
      setPrimaryImageFileIndex(updatedFiles.length > 0 ? 0 : null);
    } else if (primaryImageFileIndex !== null && primaryImageFileIndex > indexToRemove) {
      setPrimaryImageFileIndex(prevIndex => prevIndex! - 1);
    }
    setNewImageFiles(updatedFiles);
  };

  const handleSetNewPrimaryCandidate = (index: number) => {
    setPrimaryImageFileIndex(index);
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!window.confirm(t('eventForm.confirmations.deleteImage'))) return;
    try {
      await deleteEventImage(imageId);
      setCurrentEventImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err: any) {
      setImageError(err.response?.data?.message || t('eventForm.errors.deleteImage'));
      console.error("Delete image error:", err);
    }
  };

  const handleSetExistingPrimary = async (imageId: number) => {
    if (!initialEvent?.id) {
        setImageError(t('eventForm.errors.setPrimaryNoEvent'));
        return;
    }
    if (currentEventImages.some(img => img.id === imageId && img.isPrimary)) {
        return;
    }
      setCurrentEventImages(prev => 
        prev.map(img => ({ ...img, isPrimary: img.id === imageId }))
    );
    setPrimaryImageFileIndex(null); 

    try {
      await setPrimaryEventImage(imageId);
    } catch (err: any) {
      setImageError(err.response?.data?.message || t('eventForm.errors.setPrimary'));
      console.error("Set primary image error:", err);
      setCurrentEventImages(prev => {
        const originalPrimary = prev.find(img => img.id === initialEvent?.images?.find(i => i.isPrimary)?.id);
        return prev.map(img => ({...img, isPrimary: originalPrimary ? img.id === originalPrimary.id : false }));
      });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setNewCategoryError(t('eventForm.errors.categoryNameEmpty'));
      return;
    }
    const existingCategory = categories.find(
      (cat) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase() ||
                 (cat.name && cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())
    );
    if (existingCategory) {
      setNewCategoryError(t('eventForm.errors.categoryExists', { name: newCategoryName.trim() }));
      return;
    }

    setNewCategoryError(null);
    setIsCreatingCategory(true);
    try {
      const newCategory = await createCategory({ name: newCategoryName.trim()});
      setCategories((prevCategories) => [...prevCategories, newCategory]);
      setCategoryId(newCategory.id);
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (err: any) {
      let message = t('eventForm.errors.createCategory');
      if (err.response && err.response.data && err.response.data.message) {
        message = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      if (err.response && err.response.status === 409) {
          setNewCategoryError(message || t('eventForm.errors.categoryExistsBackend', { name: newCategoryName.trim() }));
      } else {
          setNewCategoryError(message);
      }
      console.error("Create category error:", err);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setImageError(null);
    setIsSubmitting(true);

    if (!title || !description || !startDate || !endDate || !venue || price === '' || categoryId === '') {
      setFormError(t('eventForm.errors.fillAllFields'));
      setIsSubmitting(false);
      return;
    }
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime())) {
        setFormError(t('eventForm.errors.invalidStartDate'));
        setIsSubmitting(false);
        return;
    }
    if (isNaN(endDateObj.getTime())) {
        setFormError(t('eventForm.errors.invalidEndDate'));
        setIsSubmitting(false);
        return;
    }
    if (startDateObj >= endDateObj) {
        setFormError(t('eventForm.errors.endDateBeforeStartDate'));
        setIsSubmitting(false);
        return;
    }

    let eventPayload: CreateEventPayload = {
      title, description,
      startDate: startDateObj.toISOString(), endDate: endDateObj.toISOString(),
      venue, price: Number(price), categoryId: Number(categoryId),
    } as CreateEventPayload;
    if (!isEditMode) {
      if (!user) {
        setFormError('No authenticated user.');
        setIsSubmitting(false);
        return;
      }
      eventPayload = { ...eventPayload, creatorId: user.id };
    }

    let submittedEvent: EventType | null = null;
    try {
      const result = await onSubmit(eventPayload, initialEvent?.id);
      if (result) { 
          submittedEvent = result as EventType;
      } else if (isEditMode && initialEvent) {
          submittedEvent = initialEvent;
      } else if (!isEditMode && initialEvent?.id) {
          submittedEvent = initialEvent;
      }
      
      if (!submittedEvent?.id) {
          throw new Error("Event ID is missing after event submission.");
      }

    } catch (err: any) {
      let message = 'An unexpected error occurred while saving event details.';
      if (err.response && err.response.data && err.response.data.message) {
        message = Array.isArray(err.response.data.message) ? err.response.data.message.join(', ') : err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setFormError(isEditMode ? `Failed to update event: ${message}` : `Failed to create event: ${message}`);
      console.error("Event submission error:", err);
      setIsSubmitting(false);
      return;
    }

    if (submittedEvent && submittedEvent.id && newImageFiles && newImageFiles.length > 0) {
      setIsUploadingImages(true);
      setImageError(null);
      const uploadedImagesInfo = await Promise.all(
        newImageFiles.map((file, index) => {
          const formData = new FormData();
          formData.append('image', file);
          if (index === primaryImageFileIndex) {
            formData.append('isPrimary', 'true');
          }
          return uploadEventImage(submittedEvent.id!, file, index === primaryImageFileIndex, formData);
        })
      );
      console.log('Images uploaded:', uploadedImagesInfo);
    }
    
    setIsSubmitting(false);
    if (!formError && !imageError) {
         const successMessage = isEditMode ? 'Event updated successfully!' : 'Event created successfully!';
         let redirectPath = `/events/${submittedEvent.id}`;
         if (isEditMode) {
             redirectPath = `/events/${submittedEvent.id}`;
         } else {
             redirectPath = `/admin/events/edit/${submittedEvent.id}`;
         }

         const navigationMessage = isEditMode ? successMessage : `${successMessage} You can now manage images.`;
         navigate(redirectPath, { state: { message: navigationMessage, eventId: submittedEvent.id } });

    } else if (formError) {
    } else if (imageError && submittedEvent?.id) {
        const stateMessage = (isEditMode ? 'Event updated' : 'Event created') + ' but with image upload errors. Please review images.';
         navigate(`/admin/events/edit/${submittedEvent.id}`, { state: { message: stateMessage, eventId: submittedEvent.id, hasImageError: true } });
    }
  };
  
  const getImageUrl = (image: string | File) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `http://localhost:3000/${image}`;
    }
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    return PLACEHOLDER_IMAGE;
  };

  if (loadingCategories) {
    return <div className="text-center py-10"><div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600" role="status"><span className="visually-hidden">{t('loading')}</span></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">
        {isEditMode ? t('eventForm.titleEdit') : t('eventForm.titleCreate')}
      </h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 space-y-6">
        {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert"><p>{formError}</p></div>}
        
        {/* Image Upload and Management Section */}
        <div className="border-t pt-6 mt-6 border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">{t('eventForm.imagesSectionTitle')}</h3>
            {imageError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert"><p>{imageError}</p></div>}
            
            {isUploadingImages && (
                <div className="flex items-center justify-center p-4 my-4 bg-blue-50 dark:bg-blue-900 rounded-md">
                    <div className="spinner-border animate-spin inline-block w-6 h-6 border-3 rounded-full text-blue-600 dark:text-blue-400" role="status"></div>
                    <span className="ml-3 text-blue-700 dark:text-blue-300">{t('eventForm.uploadingImages')}</span>
                </div>
            )}

            {/* Display Existing Images */}
            {isEditMode && currentEventImages.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-300 mb-2">{t('eventForm.currentImages')}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {currentEventImages.map((img) => (
                    <div key={img.id} className="relative group border rounded-lg overflow-hidden shadow">
                      <img src={getImageUrl(img.imageUrl)} alt={t('eventForm.altExistingImage')} className="w-full h-32 object-cover" />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-center">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetExistingPrimary(img.id)}
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mb-1 w-full"
                          >
                            {t('eventForm.setAsPrimary')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(img.id)}
                          className="text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded w-full"
                        >
                          {t('eventForm.deleteImage')}
                        </button>
                      </div>
                      {img.isPrimary && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                          {t('eventForm.primaryImage')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

             {newImageFiles.length > 0 && (
                <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-300 mb-2">{t('eventForm.newImages')}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {newImageFiles.map((file, index) => (
                            <div key={index} className="relative group border rounded-lg overflow-hidden shadow">
                                <img src={URL.createObjectURL(file)} alt={`${t('eventForm.altNewImage')} ${index + 1}`} className="w-full h-32 object-cover" />
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 text-center">
                                    {primaryImageFileIndex !== index && (
                                        <button
                                            type="button"
                                            onClick={() => handleSetNewPrimaryCandidate(index)}
                                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded mb-1 w-full"
                                        >
                                            {t('eventForm.setAsPrimary')}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(index)}
                                        className="text-xs bg-yellow-500 hover:bg-yellow-600 text-black py-1 px-2 rounded w-full"
                                    >
                                        {t('eventForm.removeImage')}
                                    </button>
                                </div>
                                {primaryImageFileIndex === index && (
                                    <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                                        {t('eventForm.primaryImage')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="mt-4">
                <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('eventForm.labels.addImage')}
                </label>
                <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelected}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-300
                                hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('eventForm.imageUploadHint')}</p>
            </div>
        </div>


        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.title')}</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.description')}</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.startDate')}</label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
              required
            />
        </div>
        <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.endDate')}</label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.venue')}</label>
          <input
            type="text"
            id="venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.price')} (EGP)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            required
            placeholder={t('eventForm.placeholders.price')}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.labels.category')}</label>
          <div className="flex items-center space-x-2 mt-1">
            <select
              id="category"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value === '' ? '' : Number(e.target.value));
                if (e.target.value !== 'new') {
                  setShowNewCategoryInput(false);
                }
              }}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
              required
            >
              <option value="">{t('eventForm.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={() => setShowNewCategoryInput(prev => !prev)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 whitespace-nowrap"
            >
              {showNewCategoryInput ? t('eventForm.buttons.cancel') : t('eventForm.buttons.addNewCategory')}
            </button>
        </div>
      </div>

        {showNewCategoryInput && (
          <div className="p-4 mt-2 bg-gray-50 dark:bg-gray-700 rounded-md shadow">
            <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-200">{t('eventForm.labels.newCategoryName')}</label>
            <input
              type="text"
              id="newCategoryName"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (newCategoryError) setNewCategoryError(null);
              }}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-50"
              placeholder={t('eventForm.placeholders.newCategoryName')}
            />
            {newCategoryError && <p className="text-red-500 text-xs mt-1">{newCategoryError}</p>}
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreatingCategory || !newCategoryName.trim()}
              className="mt-3 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {isCreatingCategory ? `${t('eventForm.buttons.creatingCategory')}...` : t('eventForm.buttons.createCategory')}
                    </button>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
          >
            {t('eventForm.buttons.goBack')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="w-full sm:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            {isSubmitting || isUploadingImages
              ? `${t('eventForm.buttons.submitting')}...`
              : isEditMode
              ? t('eventForm.buttons.updateEvent')
              : t('eventForm.buttons.createEvent')}
                    </button>
        </div>
      </form>
      </div>
  );
};

export default EventForm;