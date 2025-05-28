export enum ExpenseType {
  SALARY = 'Salary',
  ADVERTISING = 'Advertising',
  DELIVERY = 'Delivery',
  OTHER = 'Other',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  createdAt: string; // ISO date string
}

export interface Expense {
  id: string;
  type: ExpenseType;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
}

export interface SaleItem {
  productId: string;
  productName: string; 
  quantity: number;
  unitPrice: number; 
  unitCost: number; 
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number; 
  totalCost: number;   
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO date string with time
}

export interface ChartData { 
  name: string; 
  monthFullName?: string; 
  sales?: number;
  expenses?: number; 
  profit?: number;
  cogs?: number; 
}

export interface DailyChartDataPoint { 
  day: string; 
  sales: number;
  profit: number;
  costs: number; 
}


export interface ExpenseCategoryData {
  name: ExpenseType | string; 
  value: number;
}

export interface Customer {
  id: string;
  name: string;
  district: string;
  city: string;
  address: string; 
  phone: string;
  email?: string; 
  createdAt: string; 
}

export interface CompanyProfile {
  companyName: string; 
  address: string;
  phone: string;
  email: string;
  logo?: string; 
}

export interface InvoiceItem {
  id: string; 
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; 
  invoiceNumber: string; 
  customerId: string; 
  customerSnapshot: Customer; 
  companyProfileSnapshot: CompanyProfile; 
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD, optional
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number; 
  taxAmount: number; 
  grandTotal: number;
  notes?: string;
  qrCodeData?: string; 
  createdAt: string; 
}

export type Theme = 'light' | 'dark';
export type NewInvoiceCustomerInput = Omit<Customer, 'id' | 'createdAt'>;

export type NotificationType = 'success' | 'delete' | 'info' | 'warning' | 'error';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

export interface NotificationContextType {
  notifications: Notification[];
  showNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}


// AppContextType modification for no auth and local storage
export interface AppContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (productData: Product) => void;
  deleteProduct: (productId: string) => void;
  sales: Sale[];
  addSale: (saleData: AppContextAddSaleInput) => boolean;
  deleteSales: (saleIds: string[]) => void; // New function for bulk deleting sales
  expenses: Expense[];
  addExpense: (expenseData: Omit<Expense, 'id'>) => void;
  updateExpense: (expenseData: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  
  customers: Customer[];
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt'>) => Customer | null;
  updateCustomer: (customerData: Customer) => void;
  deleteCustomer: (customerId: string) => void;

  companyProfile: CompanyProfile | null;
  updateCompanyProfile: (profileData: CompanyProfile) => void;

  invoices: Invoice[];
  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt'| 'qrCodeData'>) => Invoice | null;
  
  getProductById: (productId: string) => Product | undefined;
  getCustomerById: (customerId: string) => Customer | undefined;
  getInvoiceById: (invoiceId: string) => Invoice | undefined;
  getNextInvoiceNumber: () => string; 

  currencySymbol: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  loadingAppData: boolean; 

  // For notifications
  showNotification: (message: string, type: NotificationType) => void;
}

export interface AppContextSaleItemInput {
  productId: string;
  quantity: number;
}

export interface AppContextAddSaleInput {
  date: string; // YYYY-MM-DD
  items: AppContextSaleItemInput[];
}