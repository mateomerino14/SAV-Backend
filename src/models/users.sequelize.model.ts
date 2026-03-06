import { Model, DataTypes, Sequelize } from 'sequelize';
import { GenderEnum, AccountStatusEnum } from '../constructs/enums';

export class User extends Model {
  public id!: number;
  public firstName!: string | null;
  public lastName!: string | null;
  public middleName!: string | null;
  public gender!: GenderEnum | null;
  public phoneNumber!: string | null;
  public emailAddress!: string;
  public password!: string | null;
  public verified!: boolean;
  public requirePasswordChange!: boolean;
  public twoFactorSecret!: string | null;
  public isTwoFactorEnabled!: boolean;
  public status!: AccountStatusEnum;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

export const initUserModel = (sequelize: Sequelize): typeof User => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      firstName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'last_name',
      },
      middleName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'middle_name',
      },
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: true,
        field: 'gender',
      },
      phoneNumber: {
        type: DataTypes.STRING(15),
        allowNull: true,
        field: 'phone_number',
        unique: true,
      },
      emailAddress: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'email',
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'password',
      },
      verified: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'verified',
      },
      requirePasswordChange: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'require_password_change',
      },
      twoFactorSecret: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'two_factor_secret',
      },
      isTwoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        field: 'is_two_factor_enabled',
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deactivated'),
        allowNull: false,
        defaultValue: 'active',
        field: 'status',
      },
    },
    {
      tableName: 'users',
      sequelize,
      paranoid: true, // Enables soft deletes
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['phone_number'],
          name: 'users_unique_phone_number',
        },
        {
          unique: true,
          fields: ['email'],
          name: 'users_unique_email',
        },
      ],
    }
  );

  return User;
};
