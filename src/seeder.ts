import { User, UserRole, UserStore } from './models/user';
import { Product, ProductStore } from './models/product';

const users: User[] = [
  {
    id: 1,
    username: 'admin',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.ADMIN,
    password: 'password123',
  },
];

const products: Product[] = [
  {
    id: 1,
    name: 'Test Product',
    price: 10.0,
    category: 'Test Category',
  },
];

const userStore = new UserStore();
const productStore = new ProductStore();

const insertData = async () => {
  try {
    for (const product of products) {
      const insertedProduct: Product = await productStore.create(product);
      product.id = insertedProduct.id;
    }

    for (const user of users) {
      const insertedUser: User = await userStore.create(user);
      user.id = insertedUser.id;
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    for (const user of users) {
      await userStore.delete(user.id as number);
    }
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  insertData();
}
