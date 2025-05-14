module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define('Todo', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_complete: {
      type: DataTypes.BOOLEAN, // FIXED: use BOOLEAN in UPPERCASE
      defaultValue: false,
    },
  });

  Todo.associate = (models) => {
    Todo.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return Todo;
};
