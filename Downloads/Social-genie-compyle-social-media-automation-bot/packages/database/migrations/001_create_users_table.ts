import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255);
    table.string('name', 255).notNullable();
    table.string('avatar_url', 500);
    table.string('timezone', 50).defaultTo('UTC');
    table.jsonb('preferences').defaultTo('{}');
    table.timestamps(true, true);

    // Indexes
    table.index('email');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}