const sequelize = require('../config/db');

const Empresa = require('./empresa')(sequelize);
const Sede = require('./sede')(sequelize);
const Usuario = require('./usuario')(sequelize);
const Dispositivo = require('./dispositivo')(sequelize);
const MotivoSalida = require('./motivoSalida')(sequelize);
const Turno = require('./turno')(sequelize);
const AsignacionTurno = require('./asignacionTurno')(sequelize);
const Marcaje = require('./marcaje')(sequelize);
const Bitacora = require('./bitacora')(sequelize);

Empresa.hasMany(Sede, { foreignKey: 'empresa_id' });
Sede.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Empresa.hasMany(Usuario, { foreignKey: 'empresa_id' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Sede.hasMany(Usuario, { foreignKey: 'sede_id' });
Usuario.belongsTo(Sede, { foreignKey: 'sede_id' });

Usuario.hasMany(Dispositivo, { foreignKey: 'usuario_id' });
Dispositivo.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Empresa.hasMany(MotivoSalida, { foreignKey: 'empresa_id' });
MotivoSalida.belongsTo(Empresa, { foreignKey: 'empresa_id' });

Empresa.hasMany(Turno, { foreignKey: 'empresa_id' });
Turno.belongsTo(Empresa, { foreignKey: 'empresa_id' });
Sede.hasMany(Turno, { foreignKey: 'sede_id' });
Turno.belongsTo(Sede, { foreignKey: 'sede_id' });

Usuario.hasMany(AsignacionTurno, { foreignKey: 'usuario_id' });
AsignacionTurno.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Turno.hasMany(AsignacionTurno, { foreignKey: 'turno_id' });
AsignacionTurno.belongsTo(Turno, { foreignKey: 'turno_id' });

Usuario.hasMany(Marcaje, { foreignKey: 'usuario_id' });
Marcaje.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Sede.hasMany(Marcaje, { foreignKey: 'sede_id' });
Marcaje.belongsTo(Sede, { foreignKey: 'sede_id' });
MotivoSalida.hasMany(Marcaje, { foreignKey: 'motivo_id' });
Marcaje.belongsTo(MotivoSalida, { foreignKey: 'motivo_id' });

module.exports = {
  sequelize,
  Empresa,
  Sede,
  Usuario,
  Dispositivo,
  MotivoSalida,
  Turno,
  AsignacionTurno,
  Marcaje,
  Bitacora,
};