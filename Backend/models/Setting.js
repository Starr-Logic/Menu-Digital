import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Setting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    storeName: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'BiteQR Restaurant',
    },
    storePhone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '+855 23 123 456',
    },
    storeEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'contact@biteqr.com',
    },
    storeLocation: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Phnom Penh, Cambodia',
    },
    businessHours: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '10:00 AM - 11:00 PM',
    },
    deliveryZone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '5km radius',
    },
    minOrderValue: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '$5.00',
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
  }, {
    tableName: 'settings',
    timestamps: false,
  });
}
