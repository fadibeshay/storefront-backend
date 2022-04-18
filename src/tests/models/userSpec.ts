import bcrypt from 'bcrypt';
import { User, userStore } from '../../models/user';

const { BCRYPT_PASSWORD } = process.env;

const store = new userStore();

describe('Tests for user model', (): void => {
  it('should have a create method', (): void => {
    expect(store.create).toBeDefined();
  });

  const user: User = {
    id: 1,
    username: 'johndoe',
    firstname: 'John',
    lastname: 'Doe',
    password: 'password123',
  };

  it('create method should add a new user', async (): Promise<void> => {
    const result = await store.create(user);
    expect(result.username).toBe(user.username);
    expect(result.firstname).toBe(user.firstname);
    expect(result.lastname).toBe(user.lastname);
    await expectAsync(
      bcrypt.compare(user.password + BCRYPT_PASSWORD, result.password)
    ).toBeResolvedTo(true);
  });

  it('create method should throw an error if username already exists in DB', async (): Promise<void> => {
    await expectAsync(store.create(user)).toBeRejectedWithError();
  });

  it('authenticate method should return the correct user if credentials are OK', async (): Promise<void> => {
    const result = await store.authenticate(user.username, user.password);
    expect(result.username).toBe(user.username);
    expect(result.firstname).toBe(user.firstname);
    expect(result.lastname).toBe(user.lastname);
    await expectAsync(
      bcrypt.compare(user.password + BCRYPT_PASSWORD, result.password)
    ).toBeResolvedTo(true);
  });

  it('authenticate method should throw an error if username is incorrect', async (): Promise<void> => {
    await expectAsync(
      store.authenticate('notfound', user.password)
    ).toBeRejectedWithError(
      `Couldn't authenticate user notfound. Error: The username/password is incorrect.`
    );
  });

  it('authenticate method should throw an error if password is incorrect', async (): Promise<void> => {
    await expectAsync(
      store.authenticate(user.username, 'wrongpass')
    ).toBeRejectedWithError(
      `Couldn't authenticate user ${user.username}. Error: The username/password is incorrect.`
    );
  });
});
