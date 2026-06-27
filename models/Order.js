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
    status: {
      type: DataTypes.ENUM('Pending', 'Preparing', 'Served', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Pending',
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
