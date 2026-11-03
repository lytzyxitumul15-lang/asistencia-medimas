'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION prevent_mutation()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'La tabla % es de solo inserción: % no está permitido',
          TG_TABLE_NAME, TG_OP;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER marcajes_no_update_delete
      BEFORE UPDATE OR DELETE ON marcajes
      FOR EACH ROW EXECUTE FUNCTION prevent_mutation();
    `);

    await queryInterface.sequelize.query(`
      CREATE TRIGGER marcajes_no_truncate
      BEFORE TRUNCATE ON marcajes
      FOR EACH STATEMENT EXECUTE FUNCTION prevent_mutation();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS marcajes_no_truncate ON marcajes;'
    );
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS marcajes_no_update_delete ON marcajes;'
    );
    await queryInterface.sequelize.query(
      'DROP FUNCTION IF EXISTS prevent_mutation();'
    );
  },
};