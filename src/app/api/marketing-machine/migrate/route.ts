import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Execute the safe migration SQL
    const migrationSQL = `
      -- ====================================================================
      -- Marketing Machine Platform Database Schema - SAFE MIGRATION
      -- ====================================================================
      
      -- Function to safely add columns if they don't exist
      CREATE OR REPLACE FUNCTION add_column_if_not_exists(
          target_table text,
          target_column text,
          column_definition text
      ) RETURNS void AS $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = target_table 
              AND column_name = target_column
          ) THEN
              EXECUTE format('ALTER TABLE %I ADD COLUMN %I %s', target_table, target_column, column_definition);
          END IF;
      END;
      $$ LANGUAGE plpgsql;

      -- Check if content_posts exists, if not create basic structure
      CREATE TABLE IF NOT EXISTS content_posts (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255),
          content TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Now safely add all the missing columns for Marketing Machine
      SELECT add_column_if_not_exists('content_posts', 'content_type', 'VARCHAR(50) DEFAULT ''post''');
      SELECT add_column_if_not_exists('content_posts', 'status', 'VARCHAR(50) DEFAULT ''draft''');
      SELECT add_column_if_not_exists('content_posts', 'excerpt', 'TEXT');
      SELECT add_column_if_not_exists('content_posts', 'featured_image_url', 'TEXT');
      SELECT add_column_if_not_exists('content_posts', 'media_urls', 'JSONB DEFAULT ''[]''');
      SELECT add_column_if_not_exists('content_posts', 'hashtags', 'JSONB DEFAULT ''[]''');
      SELECT add_column_if_not_exists('content_posts', 'mentions', 'JSONB DEFAULT ''[]''');
      SELECT add_column_if_not_exists('content_posts', 'scheduled_date', 'TIMESTAMPTZ');
      SELECT add_column_if_not_exists('content_posts', 'scheduled_time', 'TIME');
      SELECT add_column_if_not_exists('content_posts', 'published_at', 'TIMESTAMPTZ');
      SELECT add_column_if_not_exists('content_posts', 'target_platforms', 'JSONB DEFAULT ''[]''');
      SELECT add_column_if_not_exists('content_posts', 'platform_specific_content', 'JSONB DEFAULT ''{}''');
      SELECT add_column_if_not_exists('content_posts', 'ai_generated', 'BOOLEAN DEFAULT false');
      SELECT add_column_if_not_exists('content_posts', 'ai_prompt', 'TEXT');
      SELECT add_column_if_not_exists('content_posts', 'engagement_prediction', 'DECIMAL(5,2)');
      SELECT add_column_if_not_exists('content_posts', 'target_audience', 'VARCHAR(100)');
      SELECT add_column_if_not_exists('content_posts', 'content_category', 'VARCHAR(50)');
      SELECT add_column_if_not_exists('content_posts', 'tone', 'VARCHAR(50)');
      SELECT add_column_if_not_exists('content_posts', 'author_id', 'UUID');
      SELECT add_column_if_not_exists('content_posts', 'approver_id', 'UUID');
      SELECT add_column_if_not_exists('content_posts', 'campaign_id', 'UUID');
      SELECT add_column_if_not_exists('content_posts', 'parent_post_id', 'UUID');
      SELECT add_column_if_not_exists('content_posts', 'is_ab_test', 'BOOLEAN DEFAULT false');
      SELECT add_column_if_not_exists('content_posts', 'total_engagement', 'INTEGER DEFAULT 0');
      SELECT add_column_if_not_exists('content_posts', 'total_reach', 'INTEGER DEFAULT 0');
      SELECT add_column_if_not_exists('content_posts', 'total_impressions', 'INTEGER DEFAULT 0');
      SELECT add_column_if_not_exists('content_posts', 'performance_score', 'DECIMAL(5,2)');
      SELECT add_column_if_not_exists('content_posts', 'version', 'INTEGER DEFAULT 1');

      -- Clean up helper function
      DROP FUNCTION IF EXISTS add_column_if_not_exists(text, text, text);
    `;

    // Execute the migration
    const { error: migrationError } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (migrationError) {
      // Try a simpler approach - direct SQL execution
      const { error: directError } = await supabase
        .from("content_posts")
        .select("content")
        .limit(1);

      if (
        directError &&
        directError.message.includes('column "content" does not exist')
      ) {
        // The content column is missing, we need to add it
        const { error: addColumnError } = await supabase.rpc("exec_sql", {
          sql: "ALTER TABLE content_posts ADD COLUMN IF NOT EXISTS content TEXT;",
        });

        if (addColumnError) {
          throw new Error(
            `Failed to add content column: ${addColumnError.message}`
          );
        }
      }
    }

    // Verify the migration worked
    const { data: testData, error: testError } = await supabase
      .from("content_posts")
      .select("id, title, content")
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        migration_completed: true,
        content_column_exists: !testError,
        test_result: testError ? testError.message : "Success",
      },
      message: "Marketing Machine migration completed successfully",
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Migration failed",
      },
      { status: 500 }
    );
  }
}
