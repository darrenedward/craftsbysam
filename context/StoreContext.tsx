
import React, { createContext, useReducer, ReactNode, useState, useEffect } from 'react';
import { Product, StoreSettings, CartItem, Order, Customer, CartAction, Category, Subcategory, Profile, Address, Toast } from '../types';
import { supabase } from '../supabaseClient';
import { initialSettings } from '../data/initialData';
import { formatError } from '../utils/errorHelper';

// Interface for the entire store state, including DB data and client-side cart
interface StoreState {
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  settings: StoreSettings | null;
  orders: Order[];
  customers: Customer[];
  userOrders: Order[]; // Orders specific to the logged-in user
  cart: CartItem[];
  profile: Profile | null; // Current user's profile
  allProfiles: Profile[]; // All user profiles for admin
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  mfaEnabled: boolean; // New state for MFA status
  showSettingsWarning: boolean;
  toasts: Toast[];
}

// Interface for the context value, including state and action functions
interface StoreContextValue extends StoreState {
  dispatchCartAction: React.Dispatch<CartAction>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'subcategory'> & { subcategory_id: string | null }) => Promise<Product>;
  updateProduct: (product: Omit<Product, 'subcategory'> & { subcategory_id: string | null }) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  updateSettings: (settings: StoreSettings) => Promise<StoreSettings>;
  addOrder: (order: Omit<Order, 'id'>, userId: string | null) => Promise<Order>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string; shipping_address?: Address; billing_address?: Address }) => Promise<Profile>;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, name: string) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  addSubcategory: (name: string, category_id: string) => Promise<Subcategory>;
  updateSubcategory: (id: string, name: string, category_id: string) => Promise<Subcategory>;
  deleteSubcategory: (id: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

// Reducer for managing the client-side shopping cart
const cartReducer = (state: { cart: CartItem[] }, action: CartAction): { cart: CartItem[] } => {
  switch (action.type) {
    case 'ADD_TO_CART': {
        const existingItemIndex = state.cart.findIndex(item => item.productId === action.payload.productId && JSON.stringify(item.customizations) === JSON.stringify(action.payload.customizations));
        if (existingItemIndex > -1) {
            const newCart = [...state.cart];
            newCart[existingItemIndex].quantity += action.payload.quantity;
            return { ...state, cart: newCart };
        }
        return { ...state, cart: [...state.cart, action.payload] };
    }
    case 'ADD_MULTIPLE_TO_CART':
      // This is a simplified re-order. A more robust implementation might merge quantities.
      return { ...state, cart: [...state.cart, ...action.payload] };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.cartItemId !== action.payload) };
    case 'CLEAR_CART':
        return { ...state, cart: [] };
    default:
      return state;
  }
};


export const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [orders, setOrders] = useState<Order[]>([]); // All orders for admin
  const [userOrders, setUserOrders] = useState<Order[]>([]); // Specific to logged-in user
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showSettingsWarning, setShowSettingsWarning] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [cartState, dispatchCartAction] = useReducer(cartReducer, { cart: [] });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
      setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchPublicData = async () => {
    // Use Promise.all for parallel fetching to improve speed and catch network errors early
    const [
        { data: productsData, error: productsError },
        { data: categoriesData, error: categoriesError },
        { data: subcategoriesData, error: subcategoriesError },
        { data: settingsData, error: settingsError }
    ] = await Promise.all([
        supabase.from('products').select('*, subcategory:subcategories(*, category:categories(*))').order('name', { ascending: true }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('subcategories').select('*').order('name'),
        supabase.from('store_settings').select('*').limit(1).single()
    ]);

    if (productsError) throw new Error(`Products Error: ${formatError(productsError)}`);
    setProducts(productsData || []);

    if (categoriesError) throw new Error(`Categories Error: ${formatError(categoriesError)}`);
    setCategories(categoriesData || []);

    if (subcategoriesError) throw new Error(`Subcategories Error: ${formatError(subcategoriesError)}`);
    setSubcategories(subcategoriesData || []);

    // Handle settings
    if (settingsError && settingsError.code === 'PGRST116') {
        setSettings(initialSettings);
        setShowSettingsWarning(true);
    } else if (settingsError) {
        throw new Error(`Settings Error: ${formatError(settingsError)}`);
    } else {
        // Deep merge the settings from DB with initial settings
        const mergedSettings: StoreSettings = {
            ...initialSettings,
            ...settingsData,
            invoiceTerms: settingsData.invoiceTerms || initialSettings.invoiceTerms,
            aboutUsContent: settingsData.aboutUsContent || initialSettings.aboutUsContent,
            phone: settingsData.phone || initialSettings.phone,
            socials: { ...initialSettings.socials, ...(settingsData.socials || {}) },
            shipping: { ...initialSettings.shipping, ...(settingsData.shipping || {}) },
            tax: { ...initialSettings.tax, ...(settingsData.tax || {}) },
            payment: {
                ...initialSettings.payment,
                ...(settingsData.payment || {}),
                paypal: { ...initialSettings.payment.paypal, ...(settingsData.payment?.paypal || {}) },
                bankTransfer: { ...initialSettings.payment.bankTransfer, ...(settingsData.payment?.bankTransfer || {}) },
                cashOnPickup: { ...initialSettings.payment.cashOnPickup, ...(settingsData.payment?.cashOnPickup || {}) },
            },
            seo: { ...initialSettings.seo, ...(settingsData.seo || {}) },
            analytics: { ...initialSettings.analytics, ...(settingsData.analytics || {}) },
            recaptcha: { ...initialSettings.recaptcha, ...(settingsData.recaptcha || {}) },
            security: { ...initialSettings.security, ...(settingsData.security || {}) },
        };
        setSettings(mergedSettings);
    }
  };

  const fetchUserData = async (userId: string) => {
    // Use .maybeSingle() to gracefully handle cases where a profile might not exist yet.
    let { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    // Throw any unexpected errors
    if (profileError) {
      throw new Error(`Profile Error: ${formatError(profileError)}`);
    }
    
    // If the profile is missing (e.g., for a user created before the trigger was active), create it now.
    if (!profileData) {
      console.log(`Profile not found for user ${userId}. Creating one now.`);
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId })
        .select()
        .single();
      
      if (insertError) {
        throw new Error(`Failed to create profile: ${formatError(insertError)}`);
      }
      profileData = newProfile;
    }

    setProfile(profileData);
    
    // Check MFA Status
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = factors?.totp?.some(f => f.status === 'verified') || false;
    setMfaEnabled(hasVerifiedFactor);

    const { data: ordersData, error: ordersError } = await supabase.from('orders').select('*').eq('userId', userId).order('orderDate', { ascending: false });
    if (ordersError) throw new Error(`User Orders Error: ${formatError(ordersError)}`);
    setUserOrders(ordersData || []);
  };

  const fetchAdminData = async () => {
    // FIX: Removed 'order' clause on profiles query to prevent crash if 'created_at' column doesn't exist yet.
    // Sorting is handled client-side in the Dashboard component.
    const [{ data: ordersData, error: ordersError }, { data: customersData, error: customersError }, { data: profilesData, error: profilesError }] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('customers').select('*'),
        supabase.from('profiles').select('*')
    ]);
    if (ordersError) throw new Error(`Orders Error: ${formatError(ordersError)}`);
    if (customersError) throw new Error(`Customers Error: ${formatError(customersError)}`);
    if (profilesError) throw new Error(`All Profiles Error: ${formatError(profilesError)}`);
    setOrders(ordersData || []);
    setCustomers(customersData || []);
    setAllProfiles(profilesData || []);
  };

  const initializeData = async () => {
    try {
        setLoading(true);
        setError(null);
        await fetchPublicData();
        
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await fetchUserData(session.user.id);
            const { data: adminCheck, error: rpcError } = await supabase.rpc('is_admin');
            if (rpcError) throw new Error(`Admin Check Error: ${formatError(rpcError)}.`);
            if (adminCheck) {
                setIsAdmin(true);
                await fetchAdminData();
            } else {
                setIsAdmin(false);
                setAllProfiles([]);
            }
        } else {
          setIsAdmin(false);
          setProfile(null);
          setUserOrders([]);
          setAllProfiles([]);
          setMfaEnabled(false);
        }
    } catch (err: any) {
        console.error("Error fetching initial data:", err);
        setError(formatError(err));
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        // Re-initialize all data on sign in or initial session
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            initializeData();
        } else if (event === 'SIGNED_OUT') {
            setOrders([]);
            setCustomers([]);
            setAllProfiles([]);
            setIsAdmin(false);
            setMfaEnabled(false);
            setProfile(null);
            setUserOrders([]);
        }
    });
    return () => subscription?.unsubscribe();
  }, []);
  
  const addOrder = async (order: Omit<Order, 'id'>, userId: string | null): Promise<Order> => {
    const newId = `order${Date.now()}`;
    const orderPayload = { ...order, id: newId, userId };

    // FIX: Removed .select() call.
    // Anonymous users (Guest Checkout) have INSERT permissions but NOT SELECT permissions for orders.
    // Calling .select() immediately after insert throws a permissions error for guests.
    const { error } = await supabase.from('orders').insert([orderPayload]);
    
    if (error) throw new Error(formatError(error));
    
    // Manually construct the return object since we can't select it back
    const newOrder: Order = {
        ...orderPayload,
        created_at: new Date().toISOString(),
        status: 'Pending',
        shippingCost: order.shippingCost || 0,
    } as Order;

    // Add to both admin and user order lists
    setOrders(prev => [newOrder, ...prev]);
    if(userId) setUserOrders(prev => [newOrder, ...prev]);

    return newOrder;
  };
  
  const updateProfile = async (updates: { full_name?: string; avatar_url?: string; shipping_address?: Address; billing_address?: Address }): Promise<Profile> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const finalUpdates = { ...updates, updated_at: new Date().toISOString() };

      const { data, error } = await supabase.from('profiles').update(finalUpdates).eq('id', user.id).select().single();
      if (error) throw new Error(formatError(error));
      setProfile(data);
      setAllProfiles(prev => prev.map(p => p.id === data.id ? data : p));
      
      // Refresh MFA status in case this was a re-enrollment trigger
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const hasVerifiedFactor = factors?.totp?.some(f => f.status === 'verified') || false;
      setMfaEnabled(hasVerifiedFactor);

      return data;
  };

  // ... other async actions (addProduct, updateProduct, etc. no major changes)
  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'subcategory'> & { subcategory_id: string | null }): Promise<Product> => {
    // REMOVED: Manual ID generation. Let the DB handle it via DEFAULT gen_random_uuid()
    const { data, error } = await supabase.from('products').insert([{ ...product }]).select('*, subcategory:subcategories(*, category:categories(*))').single();
    if (error) throw new Error(formatError(error));
    setProducts(prev => [...prev, data]);
    return data;
  };
  const updateProduct = async (product: Omit<Product, 'subcategory'> & { subcategory_id: string | null }): Promise<Product> => {
    const { data, error } = await supabase.from('products').update(product).eq('id', product.id).select('*, subcategory:subcategories(*, category:categories(*))').single();
    if (error) throw new Error(formatError(error));
    setProducts(prev => prev.map(p => p.id === product.id ? data : p));
    return data;
  };
  const deleteProduct = async (productId: string): Promise<void> => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw new Error(formatError(error));
    setProducts(prev => prev.filter(p => p.id !== productId));
  };
  const updateSettings = async (newSettings: StoreSettings): Promise<StoreSettings> => {
    const settingsPayload = { ...newSettings, id: 1 };
    const { data, error } = await supabase.from('store_settings').upsert(settingsPayload).select().single();
    if (error) throw new Error(formatError(error));
    setShowSettingsWarning(false);
    setSettings(data);
    return data;
  };
  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> => {
    // FIX: Use maybeSingle() instead of single() to prevent errors if no customer found.
    // Note: For guest users, this select might fail due to RLS (Admins only), returning error.
    // We ignore the error/null data here and proceed to create a new customer record if not found/accessible.
    const { data: existing } = await supabase.from('customers').select('id').eq('email', customer.email).limit(1).maybeSingle();
    
    if (existing) return { ...customer, id: existing.id };

    const newId = `cust${Date.now()}`;
    
    // FIX: Removed .select() call.
    // Anonymous users cannot SELECT customers, only INSERT.
    const { error } = await supabase.from('customers').insert([{ ...customer, id: newId }]);
    
    if (error) throw new Error(formatError(error));
    
    const newCustomer = { 
        ...customer, 
        id: newId, 
        created_at: new Date().toISOString() 
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };
  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
      if (error) throw new Error(formatError(error));
      setOrders(prev => prev.map(o => o.id === orderId ? data : o));
      setUserOrders(prev => prev.map(o => o.id === orderId ? data : o));
      return data;
  };
  const addCategory = async (name: string): Promise<Category> => {
    const { data, error } = await supabase.from('categories').insert({ name }).select().single();
    if (error) throw new Error(formatError(error));
    setCategories(prev => [...prev, data]);
    return data;
  };
  const updateCategory = async (id: string, name: string): Promise<Category> => {
    const { data, error } = await supabase.from('categories').update({ name }).eq('id', id).select().single();
    if (error) throw new Error(formatError(error));
    setCategories(prev => prev.map(c => c.id === id ? data : c));
    return data;
  };
  const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(formatError(error));
    setCategories(prev => prev.filter(c => c.id !== id));
  };
  const addSubcategory = async (name: string, category_id: string): Promise<Subcategory> => {
    const { data, error } = await supabase.from('subcategories').insert({ name, category_id }).select().single();
    if (error) throw new Error(formatError(error));
    setSubcategories(prev => [...prev, data]);
    return data;
  };
  const updateSubcategory = async (id: string, name: string, category_id: string): Promise<Subcategory> => {
    const { data, error } = await supabase.from('subcategories').update({ name, category_id }).eq('id', id).select().single();
    if (error) throw new Error(formatError(error));
    setSubcategories(prev => prev.map(s => s.id === id ? data : s));
    return data;
  };
  const deleteSubcategory = async (id: string): Promise<void> => {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw new Error(formatError(error));
    setSubcategories(prev => prev.filter(s => s.id !== id));
  };


  const value: StoreContextValue = {
    products,
    categories,
    subcategories,
    settings,
    orders,
    userOrders,
    customers,
    profile,
    allProfiles,
    cart: cartState.cart,
    loading,
    error,
    isAdmin,
    mfaEnabled,
    showSettingsWarning,
    toasts,
    dispatchCartAction,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
    addCustomer,
    addOrder,
    updateOrderStatus,
    updateProfile,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    showToast,
    removeToast
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
