import {
  UserProfile,
  Vendor,
  VendorApplication,
  Category,
  Meal,
  Order,
  VendorOrder,
  OrderItem,
  DeliveryDetails,
  NotificationItem,
  OrderStatusHistory,
  OrderStatus,
  FulfillmentMethod,
  PlatformAnalytics,
  CartItem,
  Review,
  RiderProfile,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_VENDORS,
  INITIAL_VENDOR_APPLICATIONS,
  INITIAL_CATEGORIES,
  INITIAL_MEALS,
  INITIAL_ORDERS,
  INITIAL_STATUS_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVIEWS,
  INITIAL_RIDERS,
} from './mockData';

const STORAGE_KEYS = {
  PROFILES: 'campusbites_profiles_v1',
  VENDORS: 'campusbites_vendors_v7',
  APPLICATIONS: 'campusbites_applications_v7',
  CATEGORIES: 'campusbites_categories_v7',
  MEALS: 'campusbites_meals_v7',
  ORDERS: 'campusbites_orders_v1',
  HISTORY: 'campusbites_history_v1',
  NOTIFICATIONS: 'campusbites_notifications_v1',
  REVIEWS: 'campusbites_reviews_v1',
  RIDERS: 'campusbites_riders_v1',
};

// Fast in-memory cache to avoid repeated JSON.parse and localStorage access on every render
const memoryCache = new Map<string, any>();

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    memoryCache.clear();
  });
}

// Helper function to safely read from local storage or set initial with memory cache
function getStoredItem<T>(key: string, initialValue: T): T {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  try {
    const item = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    if (item) {
      const parsed = JSON.parse(item);
      memoryCache.set(key, parsed);
      return parsed;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(initialValue));
    }
    memoryCache.set(key, initialValue);
    return initialValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    memoryCache.set(key, initialValue);
    return initialValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  memoryCache.set(key, value);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.error(`Error setting ${key} in storage:`, err);
  }
}

export class DataService {
  // Profiles
  static getProfiles(): UserProfile[] {
    const profiles = getStoredItem<UserProfile[]>(STORAGE_KEYS.PROFILES, INITIAL_PROFILES);
    let modified = false;
    for (const initProf of INITIAL_PROFILES) {
      const exists = profiles.some((p) => p.id === initProf.id || (p.role === initProf.role && initProf.role === 'RIDER'));
      if (!exists) {
        profiles.push(initProf);
        modified = true;
      }
    }
    if (modified) {
      setStoredItem(STORAGE_KEYS.PROFILES, profiles);
    }
    return profiles;
  }

  static getProfileById(id: string): UserProfile | undefined {
    return this.getProfiles().find((p) => p.id === id);
  }

  static saveProfile(profile: UserProfile): void {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    setStoredItem(STORAGE_KEYS.PROFILES, profiles);
  }

  // Vendors
  static getVendors(): Vendor[] {
    return getStoredItem<Vendor[]>(STORAGE_KEYS.VENDORS, INITIAL_VENDORS);
  }

  static getApprovedVendors(): Vendor[] {
    return this.getVendors().filter((v) => v.verification_status === 'APPROVED');
  }

  static getVendorById(id: string): Vendor | undefined {
    return this.getVendors().find((v) => v.id === id);
  }

  static getVendorByOwnerId(ownerId: string): Vendor | undefined {
    return this.getVendors().find((v) => v.owner_id === ownerId || v.id === ownerId);
  }

  static saveVendor(vendor: Vendor): void {
    const vendors = this.getVendors();
    const idx = vendors.findIndex((v) => v.id === vendor.id);
    if (idx >= 0) {
      vendors[idx] = vendor;
    } else {
      vendors.push(vendor);
    }
    setStoredItem(STORAGE_KEYS.VENDORS, vendors);
  }

  static updateVendorStatus(vendorId: string, newStatus: 'APPROVED' | 'SUSPENDED' | 'REJECTED' | 'PENDING'): void {
    const vendors = this.getVendors();
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      vendor.verification_status = newStatus;
      this.saveVendor(vendor);
    }
  }

  // Vendor Applications
  static getVendorApplications(): VendorApplication[] {
    return getStoredItem<VendorApplication[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_VENDOR_APPLICATIONS);
  }

  static submitVendorApplication(appData: Omit<VendorApplication, 'id' | 'verification_status' | 'created_at'>): VendorApplication {
    const apps = this.getVendorApplications();
    const newApp: VendorApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      verification_status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    apps.unshift(newApp);
    setStoredItem(STORAGE_KEYS.APPLICATIONS, apps);

    // Also create or update vendor entry in pending state
    const existingVendor = this.getVendorByOwnerId(appData.applicant_id);
    if (existingVendor) {
      existingVendor.business_name = appData.business_name;
      existingVendor.description = appData.description;
      existingVendor.phone = appData.phone;
      existingVendor.location_type = appData.location_type;
      existingVendor.address = appData.address;
      existingVendor.location_description = appData.location_description;
      existingVendor.verification_status = 'PENDING';
      this.saveVendor(existingVendor);
    } else {
      const newVendor: Vendor = {
        id: `vendor-${Date.now()}`,
        owner_id: appData.applicant_id,
        business_name: appData.business_name,
        description: appData.description,
        phone: appData.phone,
        location_type: appData.location_type,
        address: appData.address,
        location_description: appData.location_description,
        verification_status: 'PENDING',
        banner_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        total_orders: 0,
        created_at: new Date().toISOString(),
      };
      this.saveVendor(newVendor);
    }

    // Notify admins
    const admins = this.getProfiles().filter((p) => p.role === 'ADMIN');
    admins.forEach((admin) => {
      this.addNotification({
        recipient_user_id: admin.id,
        type: 'VENDOR_VERIFICATION',
        title: 'New Vendor Application Submitted',
        message: `${appData.business_name} has submitted a vendor application for verification.`,
      });
    });

    return newApp;
  }

  static approveVendorApplication(applicationId: string, adminUserId: string): Vendor | undefined {
    const apps = this.getVendorApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) return undefined;

    app.verification_status = 'APPROVED';
    app.reviewed_by = adminUserId;
    app.reviewed_at = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.APPLICATIONS, apps);

    // Update or Create Vendor record
    let vendor = this.getVendorByOwnerId(app.applicant_id);
    if (!vendor) {
      const allVendors = this.getVendors();
      const byName = allVendors.find((v) => v.business_name.toLowerCase() === app.business_name.toLowerCase());
      if (byName) {
        vendor = byName;
      }
    }

    if (vendor) {
      vendor.verification_status = 'APPROVED';
      vendor.approval_timestamp = new Date().toISOString();
      vendor.approved_by = adminUserId;
      vendor.business_name = app.business_name;
      vendor.description = app.description || vendor.description;
      vendor.phone = app.phone || vendor.phone;
      vendor.location_type = app.location_type || vendor.location_type;
      vendor.address = app.address || vendor.address;
      vendor.location_description = app.location_description || vendor.location_description;
      this.saveVendor(vendor);
    } else {
      vendor = {
        id: `vendor-${Date.now()}`,
        owner_id: app.applicant_id,
        business_name: app.business_name,
        description: app.description || 'Quality campus food vendor serving fresh student meals.',
        phone: app.phone || '+234 800 000 0000',
        location_type: app.location_type || 'CAMPUS',
        address: app.address || 'Campus Food Center',
        location_description: app.location_description || 'Campus Commercial Area',
        verification_status: 'APPROVED',
        approval_timestamp: new Date().toISOString(),
        approved_by: adminUserId,
        banner_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
        rating: 5.0,
        total_orders: 0,
        created_at: new Date().toISOString(),
      };
      this.saveVendor(vendor);
    }

    // Ensure applicant user profile exists and has role 'VENDOR'
    const profiles = this.getProfiles();
    let profile = profiles.find(
      (p) => p.id === app.applicant_id || p.email.toLowerCase() === (app.applicant_email || '').toLowerCase()
    );
    if (profile) {
      profile.role = 'VENDOR';
      profile.full_name = app.applicant_name || profile.full_name || app.business_name;
      this.saveProfile(profile);
    } else {
      const newProfile: UserProfile = {
        id: app.applicant_id,
        full_name: app.applicant_name || `${app.business_name} (Owner)`,
        email: app.applicant_email || `vendor-${Date.now()}@campusbites.edu`,
        phone: app.phone || '+234 800 000 0000',
        role: 'VENDOR',
        created_at: new Date().toISOString(),
      };
      this.saveProfile(newProfile);
    }

    // Initialize sample starter meals if the vendor doesn't have any meals yet
    const existingMeals = this.getMealsByVendor(vendor.id);
    if (existingMeals.length === 0) {
      const isSuya = app.business_name.toLowerCase().includes('suya');
      const isAsian = app.business_name.toLowerCase().includes('wok') || app.business_name.toLowerCase().includes('asian');

      if (isSuya) {
        this.saveMeal({
          id: `meal-${vendor.id}-1`,
          vendor_id: vendor.id,
          vendor_name: vendor.business_name,
          category_id: 'cat-3',
          category_name: 'Grills & Shawarma',
          name: 'Special Northern Beef Suya Platter',
          description: 'Authentic spiced charcoal roasted beef suya served with fresh onions, cabbage and yaji pepper.',
          price: 2500,
          image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          availability: 'AVAILABLE',
          created_at: new Date().toISOString(),
        });
        this.saveMeal({
          id: `meal-${vendor.id}-2`,
          vendor_id: vendor.id,
          vendor_name: vendor.business_name,
          category_id: 'cat-3',
          category_name: 'Grills & Shawarma',
          name: 'Spicy Grilled Chicken Suya & Roasted Corn',
          description: 'Tender chicken quarters grilled over hot coals with sweet roasted corn.',
          price: 2800,
          image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
          availability: 'AVAILABLE',
          created_at: new Date().toISOString(),
        });
      } else if (isAsian) {
        this.saveMeal({
          id: `meal-${vendor.id}-1`,
          vendor_id: vendor.id,
          vendor_name: vendor.business_name,
          category_id: 'cat-1',
          category_name: 'Rice Dishes',
          name: 'Campus Special Stir-Fry Egg Noodles',
          description: 'Wok-tossed noodles with shredded chicken, sweet peppers, carrots, and sesame oil.',
          price: 2000,
          image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          availability: 'AVAILABLE',
          created_at: new Date().toISOString(),
        });
        this.saveMeal({
          id: `meal-${vendor.id}-2`,
          vendor_id: vendor.id,
          vendor_name: vendor.business_name,
          category_id: 'cat-5',
          category_name: 'Snacks & Pastries',
          name: 'Crispy Spring Rolls & Glazed Wings',
          description: '3 golden vegetable spring rolls with 2 honey chili glazed chicken wings.',
          price: 1800,
          image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80',
          availability: 'AVAILABLE',
          created_at: new Date().toISOString(),
        });
      } else {
        this.saveMeal({
          id: `meal-${vendor.id}-1`,
          vendor_id: vendor.id,
          vendor_name: vendor.business_name,
          category_id: 'cat-1',
          category_name: 'Rice Dishes',
          name: `${vendor.business_name} Special Combo`,
          description: 'Fresh signature house meal served with chicken and sides.',
          price: 2200,
          image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
          availability: 'AVAILABLE',
          created_at: new Date().toISOString(),
        });
      }
    }

    // Notify applicant
    this.addNotification({
      recipient_user_id: app.applicant_id,
      type: 'VENDOR_VERIFICATION',
      title: 'Vendor Application Approved! 🎉',
      message: `Congratulations! Your vendor application for "${app.business_name}" has been approved by the platform admin. You can now access your vendor console, manage meals and receive student orders.`,
    });

    return vendor;
  }

  static rejectVendorApplication(applicationId: string, adminUserId: string, reason: string): void {
    const apps = this.getVendorApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) return;

    app.verification_status = 'REJECTED';
    app.rejection_reason = reason;
    app.reviewed_by = adminUserId;
    app.reviewed_at = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.APPLICATIONS, apps);

    // Update Vendor record
    const vendor = this.getVendorByOwnerId(app.applicant_id);
    if (vendor) {
      vendor.verification_status = 'REJECTED';
      vendor.rejection_reason = reason;
      this.saveVendor(vendor);
    }

    // Notify applicant
    this.addNotification({
      recipient_user_id: app.applicant_id,
      type: 'VENDOR_VERIFICATION',
      title: 'Vendor Application Status',
      message: `Your vendor application for "${app.business_name}" was not approved. Reason: ${reason}`,
    });
  }

  // Categories
  static getCategories(): Category[] {
    return getStoredItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static saveCategory(category: Category): void {
    const cats = this.getCategories();
    const idx = cats.findIndex((c) => c.id === category.id);
    if (idx >= 0) {
      cats[idx] = category;
    } else {
      cats.push(category);
    }
    setStoredItem(STORAGE_KEYS.CATEGORIES, cats);
  }

  static deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    setStoredItem(STORAGE_KEYS.CATEGORIES, cats);
  }

  // Meals
  static getMeals(): Meal[] {
    return getStoredItem<Meal[]>(STORAGE_KEYS.MEALS, INITIAL_MEALS);
  }

  static getAvailableMeals(): Meal[] {
    const approvedVendors = new Set(this.getApprovedVendors().map((v) => v.id));
    return this.getMeals().filter(
      (m) => m.availability === 'AVAILABLE' && approvedVendors.has(m.vendor_id)
    );
  }

  static getMealsByVendor(vendorId: string): Meal[] {
    return this.getMeals().filter((m) => m.vendor_id === vendorId);
  }

  static getMealById(id: string): Meal | undefined {
    return this.getMeals().find((m) => m.id === id);
  }

  static saveMeal(meal: Meal): void {
    const meals = this.getMeals();
    const idx = meals.findIndex((m) => m.id === meal.id);
    if (idx >= 0) {
      meals[idx] = { ...meal, updated_at: new Date().toISOString() };
    } else {
      meals.push({ ...meal, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    setStoredItem(STORAGE_KEYS.MEALS, meals);
  }

  static deleteMeal(id: string): void {
    const meals = this.getMeals().filter((m) => m.id !== id);
    setStoredItem(STORAGE_KEYS.MEALS, meals);
  }

  static toggleMealAvailability(id: string): void {
    const meals = this.getMeals();
    const meal = meals.find((m) => m.id === id);
    if (meal) {
      meal.availability = meal.availability === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
      meal.updated_at = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.MEALS, meals);
    }
  }

  // Orders
  static getOrders(): Order[] {
    return getStoredItem<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }

  static getOrderById(id: string): Order | undefined {
    return this.getOrders().find((o) => o.id === id || o.order_reference === id);
  }

  static getOrdersByStudent(studentId: string): Order[] {
    return this.getOrders().filter((o) => o.student_id === studentId);
  }

  static getVendorOrders(vendorId: string): { parentOrder: Order; vendorOrder: VendorOrder }[] {
    const allOrders = this.getOrders();
    const result: { parentOrder: Order; vendorOrder: VendorOrder }[] = [];

    for (const order of allOrders) {
      const vOrder = order.vendor_orders.find((vo) => vo.vendor_id === vendorId);
      if (vOrder) {
        result.push({ parentOrder: order, vendorOrder: vOrder });
      }
    }
    return result.sort((a, b) => new Date(b.parentOrder.created_at).getTime() - new Date(a.parentOrder.created_at).getTime());
  }

  // Multi-Vendor Checkout Creation
  static createMultiVendorOrder(params: {
    student_id: string;
    student_name: string;
    student_phone: string;
    fulfillment_method: FulfillmentMethod;
    cartItems: CartItem[];
    delivery_details?: Omit<DeliveryDetails, 'id' | 'parent_order_id' | 'created_at'>;
  }): Order {
    const { student_id, student_name, student_phone, fulfillment_method, cartItems, delivery_details } = params;

    const parentOrderId = `ord-${Date.now()}`;
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const orderRef = `CB-${new Date().getFullYear()}-${randCode}`;

    // Group cart items by vendor
    const vendorMap = new Map<string, { vendor: Vendor; items: CartItem[] }>();
    for (const ci of cartItems) {
      if (!vendorMap.has(ci.vendor.id)) {
        vendorMap.set(ci.vendor.id, { vendor: ci.vendor, items: [] });
      }
      vendorMap.get(ci.vendor.id)!.items.push(ci);
    }

    let overallTotal = 0;
    const vendorOrders: VendorOrder[] = [];

    vendorMap.forEach(({ vendor, items }, vendorId) => {
      let subtotal = 0;
      const vordId = `vord-${parentOrderId}-${vendorId.slice(-4)}`;

      const orderItems: OrderItem[] = items.map((ci, idx) => {
        const itemSub = ci.meal.price * ci.quantity;
        subtotal += itemSub;
        return {
          id: `item-${vordId}-${idx + 1}`,
          vendor_order_id: vordId,
          meal_id: ci.meal.id,
          meal_name_snapshot: ci.meal.name,
          unit_price_snapshot: ci.meal.price,
          quantity: ci.quantity,
          subtotal: itemSub,
          image_url: ci.meal.image_url,
          created_at: new Date().toISOString(),
        };
      });

      overallTotal += subtotal;

      const vendorSubOrder: VendorOrder = {
        id: vordId,
        parent_order_id: parentOrderId,
        vendor_id: vendorId,
        vendor_name: vendor.business_name,
        status: 'PENDING',
        subtotal,
        items: orderItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      vendorOrders.push(vendorSubOrder);
    });

    const newOrder: Order = {
      id: parentOrderId,
      student_id,
      student_name,
      student_phone,
      order_reference: orderRef,
      fulfillment_method,
      total_amount: overallTotal,
      status: 'PENDING',
      vendor_orders: vendorOrders,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (fulfillment_method === 'DELIVERY' && delivery_details) {
      newOrder.delivery_fee = 500;
      newOrder.delivery_otp = Math.floor(1000 + Math.random() * 9000).toString();
      newOrder.delivery_details = {
        ...delivery_details,
        id: `del-${parentOrderId}`,
        parent_order_id: parentOrderId,
        created_at: new Date().toISOString(),
      };
    }

    // Save order
    const orders = this.getOrders();
    orders.unshift(newOrder);
    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // Record initial status history
    this.addStatusHistory({
      parent_order_id: parentOrderId,
      previous_status: undefined,
      new_status: 'PENDING',
      actor_user_id: student_id,
      actor_name: `${student_name} (Student)`,
      note: `Order placed via ${fulfillment_method === 'DELIVERY' ? 'Campus Delivery' : 'Campus Pickup'}`,
    });

    // Notify each vendor
    vendorOrders.forEach((vo) => {
      const vObj = this.getVendorById(vo.vendor_id);
      if (vObj) {
        this.addNotification({
          recipient_user_id: vObj.owner_id,
          type: 'NEW_ORDER',
          title: 'New Order Received! 🍔',
          message: `Order #${orderRef} has been placed by ${student_name} (${vo.items.length} item(s)). Please confirm.`,
          related_order_id: parentOrderId,
          related_vendor_id: vo.vendor_id,
        });

        // Increment total orders count for vendor
        vObj.total_orders = (vObj.total_orders || 0) + 1;
        this.saveVendor(vObj);
      }
    });

    // Dispatch real-time events for vendor dashboard order listening
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('campusbites_new_order_placed', {
            detail: { newOrder },
          })
        );
        window.dispatchEvent(new Event('storage'));
      }, 0);
    }

    return newOrder;
  }

  // Update Vendor Sub-Order Status
  static updateVendorOrderStatus(params: {
    parentOrderId: string;
    vendorOrderId: string;
    newStatus: OrderStatus;
    actorUserId: string;
    actorName: string;
    rejectionReason?: string;
  }): Order | undefined {
    const { parentOrderId, vendorOrderId, newStatus, actorUserId, actorName, rejectionReason } = params;

    const orders = this.getOrders();
    const order = orders.find((o) => o.id === parentOrderId);
    if (!order) return undefined;

    const vOrder = order.vendor_orders.find((vo) => vo.id === vendorOrderId);
    if (!vOrder) return undefined;

    const prevStatus = vOrder.status;
    vOrder.status = newStatus;
    vOrder.updated_at = new Date().toISOString();

    if (newStatus === 'REJECTED' && rejectionReason) {
      vOrder.rejection_reason = rejectionReason;
    }

    if (newStatus === 'DELIVERED' || newStatus === 'PICKED_UP') {
      vOrder.completed_at = new Date().toISOString();
    }

    // Derived overall parent order status check
    const allStatuses = order.vendor_orders.map((vo) => vo.status);
    if (allStatuses.every((s) => s === 'DELIVERED' || s === 'PICKED_UP')) {
      order.status = order.fulfillment_method === 'DELIVERY' ? 'DELIVERED' : 'PICKED_UP';
      order.completed_at = new Date().toISOString();
    } else if (allStatuses.every((s) => s === 'REJECTED')) {
      order.status = 'REJECTED';
    } else if (allStatuses.some((s) => s === 'REJECTED') && allStatuses.some((s) => s !== 'REJECTED')) {
      order.status = 'PARTIALLY_CANCELLED';
    } else if (allStatuses.some((s) => s === 'OUT_FOR_DELIVERY' || s === 'READY_FOR_PICKUP')) {
      order.status = order.fulfillment_method === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'READY_FOR_PICKUP';
    } else if (allStatuses.some((s) => s === 'PREPARING')) {
      order.status = 'PREPARING';
    } else if (allStatuses.some((s) => s === 'CONFIRMED')) {
      order.status = 'CONFIRMED';
    }

    order.updated_at = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // Add status history entry
    this.addStatusHistory({
      parent_order_id: parentOrderId,
      vendor_order_id: vendorOrderId,
      previous_status: prevStatus,
      new_status: newStatus,
      actor_user_id: actorUserId,
      actor_name: actorName,
      note: rejectionReason ? `Rejected: ${rejectionReason}` : `Status updated to ${newStatus}`,
    });

    // Notify student
    let statusText = newStatus.replace(/_/g, ' ');
    if (newStatus === 'READY_FOR_PICKUP') statusText = 'Ready for Pickup! 🎒';
    if (newStatus === 'OUT_FOR_DELIVERY') statusText = 'Out for Delivery! 🛵';

    this.addNotification({
      recipient_user_id: order.student_id,
      type: 'ORDER_STATUS',
      title: `Order #${order.order_reference} Update`,
      message: `${vOrder.vendor_name || 'Vendor'} marked your items as: ${statusText}${
        rejectionReason ? `. Reason: ${rejectionReason}` : ''
      }`,
      related_order_id: parentOrderId,
      related_vendor_id: vOrder.vendor_id,
    });

    return order;
  }

  // Admin Order Status Override / Confirmation
  static updateOrderStatusByAdmin(params: {
    parentOrderId: string;
    newStatus: OrderStatus;
    adminUserId: string;
    adminName: string;
  }): Order | undefined {
    const { parentOrderId, newStatus, adminUserId, adminName } = params;
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === parentOrderId);
    if (!order) return undefined;

    const prevStatus = order.status;
    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    // Update all vendor sub-orders
    order.vendor_orders.forEach((vo) => {
      vo.status = newStatus;
      vo.updated_at = new Date().toISOString();
      if (newStatus === 'DELIVERED' || newStatus === 'PICKED_UP') {
        vo.completed_at = new Date().toISOString();
      }
    });

    if (newStatus === 'DELIVERED' || newStatus === 'PICKED_UP') {
      order.completed_at = new Date().toISOString();
    }

    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // Record history
    this.addStatusHistory({
      parent_order_id: parentOrderId,
      previous_status: prevStatus,
      new_status: newStatus,
      actor_user_id: adminUserId,
      actor_name: `${adminName} (Admin)`,
      note: `Admin confirmed and updated status to ${newStatus}`,
    });

    // Notify student
    let statusMsg = `Your order #${order.order_reference} has been confirmed by Admin and is now in processing!`;
    if (newStatus === 'PREPARING') {
      statusMsg = `Your order #${order.order_reference} is now being prepared by kitchen vendors!`;
    } else if (newStatus === 'OUT_FOR_DELIVERY' || newStatus === 'READY_FOR_PICKUP') {
      statusMsg = `Your order #${order.order_reference} is ready / out for campus delivery!`;
    } else if (newStatus === 'DELIVERED' || newStatus === 'PICKED_UP') {
      statusMsg = `Your order #${order.order_reference} has been delivered! Enjoy your meal.`;
    }

    this.addNotification({
      recipient_user_id: order.student_id,
      type: 'ORDER_STATUS',
      title: `Order #${order.order_reference} Confirmed & Updated`,
      message: statusMsg,
      related_order_id: parentOrderId,
    });

    // Notify vendor owners
    order.vendor_orders.forEach((vo) => {
      const vObj = this.getVendorById(vo.vendor_id);
      if (vObj) {
        this.addNotification({
          recipient_user_id: vObj.owner_id,
          type: 'ORDER_STATUS',
          title: `Admin Updated Order #${order.order_reference}`,
          message: `Platform admin updated status to ${newStatus}.`,
          related_order_id: parentOrderId,
        });
      }
    });

    return order;
  }

  // Cancel Order by Student (if PENDING)
  static cancelOrder(parentOrderId: string, studentUserId: string, reason?: string): boolean {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === parentOrderId && o.student_id === studentUserId);
    if (!order) return false;

    // Check if eligible (at least one vendor suborder is pending or all pending)
    const canCancel = order.vendor_orders.every((vo) => vo.status === 'PENDING' || vo.status === 'CONFIRMED');
    if (!canCancel) return false;

    order.status = 'CANCELLED';
    order.cancelled_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();

    order.vendor_orders.forEach((vo) => {
      const prev = vo.status;
      vo.status = 'CANCELLED';
      vo.updated_at = new Date().toISOString();

      // History
      this.addStatusHistory({
        parent_order_id: parentOrderId,
        vendor_order_id: vo.id,
        previous_status: prev,
        new_status: 'CANCELLED',
        actor_user_id: studentUserId,
        actor_name: 'Student',
        note: reason ? `Student cancelled order: ${reason}` : 'Student cancelled order',
      });

      // Notify Vendor
      const vObj = this.getVendorById(vo.vendor_id);
      if (vObj) {
        this.addNotification({
          recipient_user_id: vObj.owner_id,
          type: 'ORDER_STATUS',
          title: 'Order Cancelled by Student',
          message: `Student cancelled order #${order.order_reference}${reason ? `: ${reason}` : ''}.`,
          related_order_id: parentOrderId,
        });
      }
    });

    setStoredItem(STORAGE_KEYS.ORDERS, orders);
    return true;
  }

  // Order Status History
  static getStatusHistory(parentOrderId?: string, vendorOrderId?: string): OrderStatusHistory[] {
    const history = getStoredItem<OrderStatusHistory[]>(STORAGE_KEYS.HISTORY, INITIAL_STATUS_HISTORY);
    return history.filter((h) => {
      if (parentOrderId && h.parent_order_id !== parentOrderId) return false;
      if (vendorOrderId && h.vendor_order_id !== vendorOrderId) return false;
      return true;
    }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  static addStatusHistory(entry: Omit<OrderStatusHistory, 'id' | 'created_at'>): void {
    const history = getStoredItem<OrderStatusHistory[]>(STORAGE_KEYS.HISTORY, INITIAL_STATUS_HISTORY);
    const newEntry: OrderStatusHistory = {
      ...entry,
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    history.push(newEntry);
    setStoredItem(STORAGE_KEYS.HISTORY, history);
  }

  // Notifications
  static getNotificationsForUser(userId: string): NotificationItem[] {
    const notifs = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return notifs
      .filter((n) => n.recipient_user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static addNotification(notif: Omit<NotificationItem, 'id' | 'is_read' | 'created_at'>): void {
    const notifs = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  static markNotificationAsRead(id: string): void {
    const notifs = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const notif = notifs.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  }

  static markAllNotificationsAsRead(userId: string): void {
    const notifs = getStoredItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.forEach((n) => {
      if (n.recipient_user_id === userId) {
        n.is_read = true;
      }
    });
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  // Reviews & Ratings Engine
  static getReviews(): Review[] {
    return getStoredItem<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  static getReviewsForVendor(vendorId: string): Review[] {
    return this.getReviews()
      .filter((r) => r.vendor_id === vendorId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getReviewsForOrder(orderId: string): Review[] {
    return this.getReviews().filter((r) => r.order_id === orderId);
  }

  static submitReview(reviewData: Omit<Review, 'id' | 'created_at'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    setStoredItem(STORAGE_KEYS.REVIEWS, reviews);

    // Recalculate Vendor Rating
    const vendorReviews = reviews.filter((r) => r.vendor_id === reviewData.vendor_id);
    if (vendorReviews.length > 0) {
      const avgRating = vendorReviews.reduce((sum, r) => sum + r.rating, 0) / vendorReviews.length;
      const vendor = this.getVendorById(reviewData.vendor_id);
      if (vendor) {
        vendor.rating = Math.round(avgRating * 10) / 10;
        this.saveVendor(vendor);
      }
    }

    return newReview;
  }

  // Derived Analytics Engine
  static getPlatformAnalytics(): PlatformAnalytics {
    const profiles = this.getProfiles();
    const vendors = this.getVendors();
    const apps = this.getVendorApplications();
    const orders = this.getOrders();

    const totalStudents = profiles.filter((p) => p.role === 'STUDENT').length;
    const totalApprovedVendors = vendors.filter((v) => v.verification_status === 'APPROVED').length;
    const pendingVendorApps = apps.filter((a) => a.verification_status === 'PENDING').length;

    let totalOrders = orders.length;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let rejectedOrders = 0;
    let totalRevenue = 0;

    const statusCounts: Record<string, number> = {};
    const fulfillmentCounts: Record<string, number> = { CAMPUS_PICKUP: 0, DELIVERY: 0 };
    const mealSalesMap: Record<string, { name: string; vendor_name: string; count: number; revenue: number }> = {};
    const vendorSalesMap: Record<string, { name: string; total: number; completed: number }> = {};

    orders.forEach((ord) => {
      fulfillmentCounts[ord.fulfillment_method] = (fulfillmentCounts[ord.fulfillment_method] || 0) + 1;
      statusCounts[ord.status] = (statusCounts[ord.status] || 0) + 1;

      if (ord.status === 'DELIVERED' || ord.status === 'PICKED_UP') {
        completedOrders += 1;
        totalRevenue += ord.total_amount;
      } else if (ord.status === 'CANCELLED') {
        cancelledOrders += 1;
      } else if (ord.status === 'REJECTED') {
        rejectedOrders += 1;
      }

      ord.vendor_orders.forEach((vo) => {
        if (!vendorSalesMap[vo.vendor_id]) {
          vendorSalesMap[vo.vendor_id] = { name: vo.vendor_name || 'Vendor', total: 0, completed: 0 };
        }
        vendorSalesMap[vo.vendor_id].total += 1;
        if (vo.status === 'DELIVERED' || vo.status === 'PICKED_UP') {
          vendorSalesMap[vo.vendor_id].completed += 1;
        }

        vo.items.forEach((item) => {
          if (!mealSalesMap[item.meal_id]) {
            mealSalesMap[item.meal_id] = {
              name: item.meal_name_snapshot,
              vendor_name: vo.vendor_name || 'Vendor',
              count: 0,
              revenue: 0,
            };
          }
          mealSalesMap[item.meal_id].count += item.quantity;
          mealSalesMap[item.meal_id].revenue += item.subtotal;
        });
      });
    });

    const popularMeals = Object.entries(mealSalesMap)
      .map(([id, data]) => ({
        id,
        name: data.name,
        vendor_name: data.vendor_name,
        order_count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.order_count - a.order_count)
      .slice(0, 5);

    const popularVendors = Object.entries(vendorSalesMap)
      .map(([id, data]) => ({
        id,
        name: data.name,
        order_count: data.total,
        completion_rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 100,
      }))
      .sort((a, b) => b.order_count - a.order_count);

    // Dummy timeline breakdown for charts
    const ordersOverTime = [
      { date: 'Aug 07', orders: 12, revenue: 24500 },
      { date: 'Aug 08', orders: 18, revenue: 38200 },
      { date: 'Aug 09', orders: 15, revenue: 31000 },
      { date: 'Aug 10', orders: 24, revenue: 52000 },
      { date: 'Aug 11', orders: 20, revenue: 42800 },
      { date: 'Aug 12', orders: 28, revenue: 61500 },
      { date: 'Aug 13', orders: orders.length, revenue: totalRevenue },
    ];

    return {
      total_students: totalStudents,
      total_approved_vendors: totalApprovedVendors,
      pending_vendor_applications: pendingVendorApps,
      total_orders: totalOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      rejected_orders: rejectedOrders,
      total_revenue: totalRevenue,
      avg_confirmation_time_mins: 4.5,
      avg_preparation_time_mins: 18.2,
      avg_fulfillment_time_mins: 12.8,
      orders_by_status: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      orders_by_fulfillment: Object.entries(fulfillmentCounts).map(([method, count]) => ({
        method: method === 'CAMPUS_PICKUP' ? 'Campus Pickup' : 'Delivery',
        count,
      })),
      orders_over_time: ordersOverTime,
      popular_meals: popularMeals,
      popular_vendors: popularVendors,
    };
  }

  // ==========================================
  // CAMPUS RIDER SERVICE METHODS
  // ==========================================

  static getRiders(): RiderProfile[] {
    const riders = getStoredItem<RiderProfile[]>(STORAGE_KEYS.RIDERS, INITIAL_RIDERS);
    let modified = false;
    for (const initRider of INITIAL_RIDERS) {
      const exists = riders.some((r) => r.id === initRider.id || r.user_id === initRider.user_id);
      if (!exists) {
        riders.push(initRider);
        modified = true;
      }
    }
    if (modified) {
      setStoredItem(STORAGE_KEYS.RIDERS, riders);
    }
    return riders;
  }

  static getRiderById(id: string): RiderProfile | undefined {
    return this.getRiders().find((r) => r.id === id);
  }

  static getRiderByUserId(userId: string): RiderProfile | undefined {
    return this.getRiders().find((r) => r.user_id === userId);
  }

  static saveRider(rider: RiderProfile): void {
    const riders = this.getRiders();
    const idx = riders.findIndex((r) => r.id === rider.id);
    if (idx >= 0) {
      riders[idx] = rider;
    } else {
      riders.push(rider);
    }
    setStoredItem(STORAGE_KEYS.RIDERS, riders);
  }

  static toggleRiderOnline(riderId: string): boolean {
    const rider = this.getRiderById(riderId);
    if (!rider) return false;
    rider.is_online = !rider.is_online;
    rider.updated_at = new Date().toISOString();
    this.saveRider(rider);
    return rider.is_online;
  }

  static updateRiderProfile(riderId: string, updates: Partial<RiderProfile>): RiderProfile | undefined {
    const rider = this.getRiderById(riderId);
    if (!rider) return undefined;
    Object.assign(rider, updates, { updated_at: new Date().toISOString() });
    this.saveRider(rider);
    return rider;
  }

  /**
   * Get unassigned orders needing campus delivery
   */
  static getAvailableDeliveries(): Order[] {
    const allOrders = this.getOrders();
    return allOrders.filter(
      (o) =>
        o.fulfillment_method === 'DELIVERY' &&
        !o.rider_id &&
        !['DELIVERED', 'CANCELLED', 'REJECTED', 'PICKED_UP'].includes(o.status)
    );
  }

  /**
   * Get active orders currently assigned to this rider
   */
  static getRiderActiveDeliveries(riderId: string): Order[] {
    const allOrders = this.getOrders();
    return allOrders.filter(
      (o) =>
        o.rider_id === riderId &&
        !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status)
    );
  }

  /**
   * Get history of completed deliveries by this rider
   */
  static getRiderCompletedDeliveries(riderId: string): Order[] {
    const allOrders = this.getOrders();
    return allOrders.filter(
      (o) => o.rider_id === riderId && o.status === 'DELIVERED'
    );
  }

  /**
   * Rider claims an available delivery order
   */
  static claimDelivery(params: {
    parentOrderId: string;
    riderId: string;
    riderName: string;
    riderPhone: string;
    vehicleType?: string;
  }): { success: boolean; message: string; order?: Order } {
    const { parentOrderId, riderId, riderName, riderPhone, vehicleType } = params;
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === parentOrderId);

    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    if (order.fulfillment_method !== 'DELIVERY') {
      return { success: false, message: 'This is a pickup order, not a delivery order.' };
    }

    if (order.rider_id && order.rider_id !== riderId) {
      return { success: false, message: 'This delivery has already been accepted by another rider.' };
    }

    const now = new Date().toISOString();
    order.rider_id = riderId;
    order.rider_name = riderName;
    order.rider_phone = riderPhone;
    order.rider_vehicle_type = vehicleType || 'Bicycle';
    order.rider_assigned_at = now;
    if (!order.delivery_otp) {
      order.delivery_otp = Math.floor(1000 + Math.random() * 9000).toString();
    }
    order.updated_at = now;

    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // Record status history
    this.addStatusHistory({
      parent_order_id: parentOrderId,
      previous_status: order.status,
      new_status: order.status,
      actor_user_id: riderId,
      actor_name: `${riderName} (Campus Rider)`,
      note: `Delivery assigned to rider ${riderName} (${order.rider_vehicle_type}).`,
    });

    // Notify student
    this.addNotification({
      recipient_user_id: order.student_id,
      type: 'ORDER_STATUS',
      title: 'Campus Rider Assigned! 🚴',
      message: `${riderName} has accepted your order #${order.order_reference} and is heading to the vendor. Your delivery OTP is ${order.delivery_otp}.`,
      related_order_id: parentOrderId,
    });

    // Broadcast update
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 0);
    }

    return { success: true, message: `Successfully claimed delivery #${order.order_reference}!`, order };
  }

  /**
   * Rider confirms meal pickup from vendor
   */
  static confirmVendorPickup(params: {
    parentOrderId: string;
    vendorOrderId?: string;
    riderId: string;
    riderName: string;
  }): { success: boolean; message: string; order?: Order } {
    const { parentOrderId, vendorOrderId, riderId, riderName } = params;
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === parentOrderId);

    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    const now = new Date().toISOString();
    order.rider_picked_up_at = now;
    order.status = 'OUT_FOR_DELIVERY';
    order.updated_at = now;

    // Update vendor orders to OUT_FOR_DELIVERY
    order.vendor_orders.forEach((vo) => {
      if (!vendorOrderId || vo.id === vendorOrderId) {
        vo.status = 'OUT_FOR_DELIVERY';
        vo.updated_at = now;
      }
    });

    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // Record status history
    this.addStatusHistory({
      parent_order_id: parentOrderId,
      vendor_order_id: vendorOrderId,
      previous_status: 'READY_FOR_PICKUP',
      new_status: 'OUT_FOR_DELIVERY',
      actor_user_id: riderId,
      actor_name: `${riderName} (Campus Rider)`,
      note: `Meals collected from vendor(s). Rider is en route to ${order.delivery_details?.delivery_location || 'destination'}.`,
    });

    // Notify student
    this.addNotification({
      recipient_user_id: order.student_id,
      type: 'ORDER_STATUS',
      title: 'Order Out for Delivery! 🛵',
      message: `${riderName} has picked up your food and is on the way to ${order.delivery_details?.delivery_location || 'your location'}. Have your OTP ${order.delivery_otp} ready!`,
      related_order_id: parentOrderId,
    });

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 0);
    }

    return { success: true, message: 'Meals marked as collected! Out for delivery.', order };
  }

  /**
   * Complete delivery with 4-digit student OTP verification
   */
  static completeDeliveryWithOtp(params: {
    parentOrderId: string;
    riderId: string;
    riderName: string;
    otpCode: string;
    proofNote?: string;
  }): { success: boolean; message: string; order?: Order } {
    const { parentOrderId, riderId, riderName, otpCode, proofNote } = params;
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === parentOrderId);

    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    // Verify OTP (allow '0000' or matching order.delivery_otp)
    const expectedOtp = order.delivery_otp || '1234';
    if (otpCode.trim() !== expectedOtp && otpCode.trim() !== '0000') {
      return {
        success: false,
        message: `Invalid delivery verification code. Please ask the student for their 4-digit code.`,
      };
    }

    const now = new Date().toISOString();
    order.status = 'DELIVERED';
    order.completed_at = now;
    order.rider_delivered_at = now;
    order.delivery_proof_note = proofNote || 'Handed directly to student with verified OTP';
    order.updated_at = now;

    order.vendor_orders.forEach((vo) => {
      vo.status = 'DELIVERED';
      vo.completed_at = now;
      vo.updated_at = now;
    });

    setStoredItem(STORAGE_KEYS.ORDERS, orders);

    // Credit Rider earnings and update stats
    const rider = this.getRiderById(riderId);
    const fee = order.delivery_fee || 500;
    if (rider) {
      rider.today_deliveries = (rider.today_deliveries || 0) + 1;
      rider.total_deliveries = (rider.total_deliveries || 0) + 1;
      rider.today_earnings = (rider.today_earnings || 0) + fee;
      rider.total_earnings = (rider.total_earnings || 0) + fee;
      rider.wallet_balance = (rider.wallet_balance || 0) + fee;
      rider.updated_at = now;
      this.saveRider(rider);
    }

    // Record status history
    this.addStatusHistory({
      parent_order_id: parentOrderId,
      previous_status: 'OUT_FOR_DELIVERY',
      new_status: 'DELIVERED',
      actor_user_id: riderId,
      actor_name: `${riderName} (Campus Rider)`,
      note: `Delivery confirmed complete with OTP verification. Payout: ₦${fee.toLocaleString()}`,
    });

    // Notify student
    this.addNotification({
      recipient_user_id: order.student_id,
      type: 'ORDER_STATUS',
      title: 'Order Delivered! 🎉',
      message: `Your food from #${order.order_reference} has been delivered by ${riderName}. Enjoy your meal and leave a review!`,
      related_order_id: parentOrderId,
    });

    // Notify rider
    this.addNotification({
      recipient_user_id: rider?.user_id || riderId,
      type: 'SYSTEM',
      title: 'Delivery Payout Credited! 💰',
      message: `₦${fee.toLocaleString()} has been added to your Campus Rider wallet for completing order #${order.order_reference}.`,
      related_order_id: parentOrderId,
    });

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 0);
    }

    return { success: true, message: `Delivery verified and completed! ₦${fee.toLocaleString()} credited to your wallet.`, order };
  }

  /**
   * Rider withdrawal request
   */
  static withdrawRiderEarnings(params: {
    riderId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }): { success: boolean; message: string; newBalance: number } {
    const { riderId, amount, bankName, accountNumber, accountName } = params;
    const rider = this.getRiderById(riderId);

    if (!rider) {
      return { success: false, message: 'Rider not found.', newBalance: 0 };
    }

    if (amount <= 0 || amount > (rider.wallet_balance || 0)) {
      return {
        success: false,
        message: `Insufficient wallet balance. You have ₦${(rider.wallet_balance || 0).toLocaleString()} available.`,
        newBalance: rider.wallet_balance || 0,
      };
    }

    rider.wallet_balance = (rider.wallet_balance || 0) - amount;
    rider.updated_at = new Date().toISOString();
    this.saveRider(rider);

    // Notify rider
    this.addNotification({
      recipient_user_id: rider.user_id,
      type: 'SYSTEM',
      title: 'Payout Processed Successfully! 🏦',
      message: `Withdrawal of ₦${amount.toLocaleString()} sent to ${bankName} (${accountNumber} - ${accountName}).`,
    });

    return {
      success: true,
      message: `Withdrawal of ₦${amount.toLocaleString()} processed successfully to ${bankName}!`,
      newBalance: rider.wallet_balance,
    };
  }
}
