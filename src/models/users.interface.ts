// User model without ORM - Plain TypeScript interface with validation
// This approach uses interfaces and validation functions

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEACTIVATED = 'deactivated',
}

export interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  gender: Gender | null;
  phoneNumber: string | null;
  emailAddress: string;
  password: string | null;
  verified: boolean;
  requirePasswordChange: boolean;
  twoFactorSecret: string | null;
  isTwoFactorEnabled: boolean;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: Gender;
  phoneNumber?: string;
  emailAddress: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  status?: AccountStatus;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: Gender;
  phoneNumber?: string;
  emailAddress?: string;
  password?: string;
  verified?: boolean;
  requirePasswordChange?: boolean;
  twoFactorSecret?: string;
  isTwoFactorEnabled?: boolean;
  status?: AccountStatus;
}

// Validation functions for enum values
export const isValidGender = (value: any): value is Gender => {
  return Object.values(Gender).includes(value);
};

export const isValidAccountStatus = (value: any): value is AccountStatus => {
  return Object.values(AccountStatus).includes(value);
};

// Database schema for manual SQL creation
export const USER_TABLE_SCHEMA = `
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  middle_name VARCHAR(50),
  gender VARCHAR(10) CHECK (gender IN ('male', 'female')),
  phone_number VARCHAR(15) UNIQUE,
  email VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255),
  verified BOOLEAN DEFAULT FALSE,
  require_password_change BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255),
  is_two_factor_enabled BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deactivated')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX users_phone_number_index ON users(phone_number);
CREATE INDEX users_email_index ON users(email);
`;

// Example repository pattern implementation
export interface UserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  update(id: number, data: UpdateUserData): Promise<User | null>;
  delete(id: number): Promise<boolean>;
  softDelete(id: number): Promise<boolean>;
  list(limit?: number, offset?: number): Promise<User[]>;
}
