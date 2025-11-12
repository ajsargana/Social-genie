import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ai_generation_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('request_type', 100); // 'caption', 'image', 'reply', 'hashtag'
    table.text('prompt').notNullable();
    table.text('generated_content');
    table.string('model_used', 100);
    table.integer('tokens_used');
    table.decimal('cost_usd', 10, 6);
    table.integer('generation_time_ms');
    table.decimal('quality_score', 3, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    // Indexes
    table.index('user_id');
    table.index('request_type');
    table.index('created_at');
    table.index('model_used');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('ai_generation_logs');
}