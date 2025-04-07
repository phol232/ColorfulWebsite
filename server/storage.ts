import { 
  users, type User, type InsertUser, 
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";

// Interface for storage methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getPopularProducts(): Promise<Product[]>;
  getRecentProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.orderId = 1;
    this.orderItemId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample data
  private initializeSampleData() {
    // Add sample categories
    const categorySamples: InsertCategory[] = [
      { name: "Donuts", icon: "donuts" },
      { name: "Burger", icon: "burger" },
      { name: "Ice", icon: "ice" },
      { name: "Potato", icon: "potato" },
      { name: "Invoice", icon: "invoice" },
      { name: "Fuchka", icon: "fuchka" },
      { name: "Pizza", icon: "pizza" },
      { name: "Hot dog", icon: "hotdog" },
      { name: "Chicken", icon: "chicken" },
    ];

    categorySamples.forEach(category => {
      this.createCategory(category);
    });

    // Add sample products
    const productSamples: InsertProduct[] = [
      { 
        name: "Vegetable Burger", 
        description: "Fresh vegetable burger with special sauce", 
        price: 25, 
        originalPrice: 28.30, 
        image: "veggie_burger.jpg", 
        rating: "2.9k", 
        categoryId: 2, 
        isPopular: true, 
        isRecent: false 
      },
      { 
        name: "Meat Burger", 
        description: "Juicy meat burger with cheese", 
        price: 28, 
        originalPrice: 28.30, 
        image: "meat_burger.jpg", 
        rating: "2.5k", 
        categoryId: 2, 
        isPopular: true, 
        isRecent: true 
      },
      { 
        name: "Cheese Burger", 
        description: "Double cheese burger with special sauce", 
        price: 32, 
        originalPrice: 36.30, 
        image: "cheese_burger.jpg", 
        rating: "2.3k", 
        categoryId: 2, 
        isPopular: true, 
        isRecent: true 
      },
      { 
        name: "Beef Burger", 
        description: "Premium beef burger", 
        price: 15, 
        originalPrice: 19.30, 
        image: "beef_burger.jpg", 
        rating: "2.5k", 
        categoryId: 2, 
        isPopular: false, 
        isRecent: true 
      },
      { 
        name: "Wild Salmon Burger", 
        description: "Wild salmon patty with fresh vegetables", 
        price: 40, 
        originalPrice: 45.30, 
        image: "salmon_burger.jpg", 
        rating: "2.8k", 
        categoryId: 2, 
        isPopular: false, 
        isRecent: true 
      },
      { 
        name: "Chocolate Donut", 
        description: "Sweet chocolate glazed donut", 
        price: 3.5, 
        originalPrice: 4.2, 
        image: "chocolate_donut.jpg", 
        rating: "1.5k", 
        categoryId: 1, 
        isPopular: true, 
        isRecent: false 
      },
    ];

    productSamples.forEach(product => {
      this.createProduct(product);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { id, ...category };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getPopularProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isPopular);
  }

  async getRecentProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isRecent);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    const newProduct: Product = { 
      id, 
      ...product, 
      createdAt: now 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Order methods
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const newOrder: Order = { 
      id, 
      ...order, 
      createdAt: now 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      item => item.orderId === orderId
    );
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { id, ...orderItem };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
}

// Export storage instance
export const storage = new MemStorage();
