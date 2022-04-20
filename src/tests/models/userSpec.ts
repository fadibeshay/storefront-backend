import bcrypt from 'bcrypt';
import { UserRole, User, UserStore } from '../../models/user';

const { BCRYPT_PASSWORD } = process.env;

const store = new UserStore();

describe('Tests for user model', (): void => {
  it('should have an index method', (): void => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', (): void => {
    expect(store.show).toBeDefined();
  });
  it('should have a create method', (): void => {
    expect(store.create).toBeDefined();
  });
  it('should have an authenticate method', (): void => {
    expect(store.authenticate).toBeDefined();
  });

  it('should have a delete method', (): void => {
    expect(store.delete).toBeDefined();
  });

  it('index method should return a list of users', async () => {
    const result = await store.index();
    expect(result).toEqual([]);
  });

  const user: User = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.ADMIN,
    password: 'password123',
  };

  it('create method should add a new user', async (): Promise<void> => {
    const result = await store.create(user);
    expect(result.username).toBe(user.username);
    expect(result.firstName).toBe(user.firstName);
    expect(result.lastName).toBe(user.lastName);
    expect(result.role).toBe(UserRole.ADMIN);
    await expectAsync(
      bcrypt.compare(user.password + BCRYPT_PASSWORD, result.password)
    ).toBeResolvedTo(true);
    user.id = result.id as number;
  });

  it('create method should throw an error if username already exists in DB', async (): Promise<void> => {
    await expectAsync(store.create(user)).toBeRejectedWithError();
  });

  it('show method should return the correct user', async (): Promise<void> => {
    const result = await store.show(user.id as number);
    expect(result.username).toBe(user.username);
    expect(result.firstName).toBe(user.firstName);
    expect(result.lastName).toBe(user.lastName);
    expect(result.role).toBe(UserRole.ADMIN);
    await expectAsync(
      bcrypt.compare(user.password + BCRYPT_PASSWORD, result.password)
    ).toBeResolvedTo(true);
  });

  it('show method should throw an error if id is incorrect', async (): Promise<void> => {
    await expectAsync(store.show(100)).toBeRejectedWithError(
      `Could not get user 100. The user id was not found.`
    );
  });

  it('authenticate method should return the correct user if credentials are OK', async (): Promise<void> => {
    const result = await store.authenticate(user.username, user.password);
    expect(result.username).toBe(user.username);
    expect(result.firstName).toBe(user.firstName);
    expect(result.lastName).toBe(user.lastName);
    expect(result.role).toBe(UserRole.ADMIN);
    await expectAsync(
      bcrypt.compare(user.password + BCRYPT_PASSWORD, result.password)
    ).toBeResolvedTo(true);
  });

  it('authenticate method should throw an error if username/password is incorrect', async (): Promise<void> => {
    await expectAsync(
      store.authenticate('notfound', user.password)
    ).toBeRejectedWithError(
      `Could not authenticate user notfound. The username/password is incorrect.`
    );
    await expectAsync(
      store.authenticate(user.username, 'wrongpass')
    ).toBeRejectedWithError(
      `Could not authenticate user ${user.username}. The username/password is incorrect.`
    );
  });

  it('delete method should delete the correct user', async () => {
    await expectAsync(store.delete(user.id as number)).toBeResolvedTo(true);
    await expectAsync(store.delete(1000)).toBeResolvedTo(false);
    await expectAsync(store.show(user.id as number)).toBeRejectedWithError(
      `Could not get user ${user.id}. The user id was not found.`
    );
  });
});
