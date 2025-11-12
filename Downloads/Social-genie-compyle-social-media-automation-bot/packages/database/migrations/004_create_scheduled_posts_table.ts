import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('scheduled_posts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('content_post_id').references('id').inTable('content_posts').onDelete('CASCADE');
    table.uuid('social_account_id').references('id').inTable('social_accounts').onDelete('CASCADE');
    table.timestamp('scheduled_at').notNullable();
    table.timestamp('posted_at');
    table.string('status', 50).defaultTo('scheduled'); // 'scheduled', 'posted', 'failed', 'cancelled'
    table.string('platform_post_id', 255);
    table.jsonb('platform_response');
    table.integer('retry_count').defaultTo(0);
    table.integer('max_retries').defaultTo(3);
    table.timestamp('next_retry_at');
    table.text('error_message');
    table.timestamps(true, true);

    // Indexes
    table.index(['social_account_id', 'status']);
    table.index(['scheduled_at', 'status']);
    table.index('posted_at');
    table.index('next_retry_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('scheduled_posts');
}