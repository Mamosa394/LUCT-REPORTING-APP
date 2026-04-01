// src/utils/hooks.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from './helpers';

// Custom hook for form handling
export const useForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name, value) => {
    if (validationSchema && validationSchema[name]) {
      const error = validationSchema[name](value);
      setErrors(prev => ({ ...prev, [name]: error }));
      return error;
    }
    return null;
  };

  const validateForm = () => {
    if (!validationSchema) return true;
    
    const newErrors = {};
    let isValid = true;
    
    Object.keys(validationSchema).forEach(key => {
      const error = validationSchema[key](values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (onSubmit) => {
    Keyboard.dismiss();
    const isValid = validateForm();
    
    if (!isValid) {
      return false;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setIsSubmitting(false);
      return true;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  const setFieldValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const setFieldError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
  };
};

// Custom hook for API calls
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
};

// Custom hook for pagination
export const usePagination = (items = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
  };
};

// Custom hook for search with debounce
export const useSearch = (initialSearch = '', delay = 500) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return { searchTerm, debouncedSearchTerm, setSearchTerm };
};

// Custom hook for app state
export const useAppState = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
};

// Custom hook for previous value
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

// Custom hook for debounced value
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// Custom hook for keyboard visibility
export const useKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

// Custom hook for interval
export const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// Custom hook for timeout
export const useTimeout = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id);
    }
  }, [delay]);
};

// Custom hook for refresh control
export const useRefresh = (refreshFunction) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFunction();
    } finally {
      setRefreshing(false);
    }
  }, [refreshFunction]);

  return { refreshing, onRefresh };
};

// Custom hook for infinite scroll
export const useInfiniteScroll = (loadMoreFunction, hasMore) => {
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      await loadMoreFunction();
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, loadMoreFunction]);

  return { loading, loadMore };
};

// Custom hook for toast/alert
export const useToast = () => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'info' });
    }, duration);
  };

  const hideToast = () => {
    setToast({ visible: false, message: '', type: 'info' });
  };

  return { toast, showToast, hideToast };
};

// Custom hook for permission
export const usePermission = (permissionType) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestPermission = useCallback(async () => {
    try {
      const { status: newStatus } = await permissionType.request();
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Permission error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const { status: currentStatus } = await permissionType.get();
      setStatus(currentStatus);
      return currentStatus;
    } catch (error) {
      console.error('Permission check error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, []);

  return { status, loading, requestPermission, checkPermission };
};

// Custom hook for redux dispatch with loading state
export const useReduxAction = (actionCreator) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(actionCreator(...args));
      if (result.error) {
        throw result.error;
      }
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dispatch, actionCreator]);

  return { execute, loading, error };
};