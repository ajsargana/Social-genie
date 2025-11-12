import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('social_account_id').references('id').inTable('social_accounts').onDelete('CASCADE');
    table.string('platform_comment_id', 255).notNullable();
    table.string('platform_post_id', 255).notNullable();
    table.string('author_platform_id', 255);
    table.string('author_name', 255);
    table.string('author_username', 255);
    table.text('comment_text').notNullable();
    table.string('comment_type', 50).defaultTo('comment'); // 'comment', 'reply', 'mention'
    table.decimal('sentiment_score', 3, 2);
    table.boolean('auto_reply_sent').defaultTo(false);
    table.text('auto_reply_text');
    table.timestamps(true, true);

    // Indexes
    table.index(['social_account_id', 'auto_reply_sent']);
    table.index('created_at');
    table.index(['platform_post_id', 'auto_reply_sent']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('comments');
}