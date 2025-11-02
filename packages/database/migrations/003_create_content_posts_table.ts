import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 500);
    table.text('content_text').notNullable();
    table.specificType('hashtags', 'text[]');
    table.specificType('media_urls', 'text[]');
    table.string('media_type', 50).defaultTo('text'); // 'text', 'image', 'video', 'carousel'
    table.boolean('ai_generated').defaultTo(false);
    table.string('content_category', 100); // 'daily_movie', 'product_showcase', 'quote', etc.
    table.jsonb('engagement_data').defaultTo('{}');
    table.timestamps(true, true);

    // Indexes
    table.index(['user_id', 'content_category']);
    table.index('ai_generated');
    table.index('created_at');
    table.index('content_category');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_posts');
}