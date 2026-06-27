import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, {
    tableName: 'order_items',
    timestamps: false,
  });
}
