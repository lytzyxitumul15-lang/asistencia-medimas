const sequelize = require('../config/db');

const Empresa = require('./empresa')(sequelize);
const Sede = require('./sede')(sequelize);
const Usuario = require('./usuario')(sequelize);

Empresa.hasMany(Sede, { foreignKey: 'empresa_id' });
Sede.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Empresa.hasMany(Usuario, { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Sede.hasMany(Usuario, { foreignKey: 'sede_id' });
Usuario.belongsTo(Sede, { foreignKey: 'sede_id' });

module.exports = { sequelize, Empresa, Sede, Usuario };