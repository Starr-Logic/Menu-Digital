import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    table_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Preparing', 'Served', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    prep_time_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    preparedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'orders',
    timestamps: false,
  });
}
