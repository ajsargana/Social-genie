import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('post_analytics', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('scheduled_post_id').references('id').inTable('scheduled_posts').onDelete('CASCADE');
    table.string('platform', 50).notNullable();
    table.integer('likes').defaultTo(0);
    table.integer('comments').defaultTo(0);
    table.integer('shares').defaultTo(0);
    table.integer('views').defaultTo(0);
    table.integer('clicks').defaultTo(0);
    table.decimal('engagement_rate', 5, 2);
    table.jsonb('analytics_data').defaultTo('{}');
    table.timestamp('recorded_at').defaultTo(knex.fn.now());

    // Indexes
    table.index(['scheduled_post_id', 'platform']);
    table.index('recorded_at');
    table.index('platform');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('post_analytics');
}