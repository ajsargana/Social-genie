import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('social_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('platform', 50).notNullable(); // 'instagram', 'facebook', 'twitter', etc.
    table.string('platform_user_id', 255).notNullable();
    table.string('platform_username', 255);
    table.text('access_token_encrypted').notNullable();
    table.text('refresh_token_encrypted');
    table.timestamp('token_expires_at');
    table.specificType('scopes', 'text[]');
    table.boolean('is_active').defaultTo(true);
    table.boolean('auto_reply_enabled').defaultTo(false);
    table.boolean('auto_post_enabled').defaultTo(true);
    table.integer('daily_post_limit').defaultTo(1);
    table.timestamps(true, true);

    // Unique constraint
    table.unique(['platform', 'platform_user_id']);

    // Indexes
    table.index(['user_id', 'platform']);
    table.index('is_active');
    table.index('token_expires_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('social_accounts');
}