import { NextRequest, NextResponse } from "next/server";
import { ClickUpCustomFieldsService } from "@/lib/metadata/clickup-custom-fields";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const apiKey =
      request.headers.get("authorization") || process.env.CLICKUP_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ClickUp API key is required" },
        { status: 401 }
      );
    }

    const service = new ClickUpCustomFieldsService(apiKey);

    switch (action) {
      case "list_fields": {
        const listId = searchParams.get("list_id");
        if (!listId) {
          return NextResponse.json(
            { error: "list_id parameter is required" },
            { status: 400 }
          );
        }

        const fields = await service.getListCustomFields(listId);
        return NextResponse.json({
          success: true,
          data: {
            list_id: listId,
            fields,
            total_fields: fields.length,
          },
        });
      }

      case "field_stats": {
        const listId = searchParams.get("list_id");
        if (!listId) {
          return NextResponse.json(
            { error: "list_id parameter is required" },
            { status: 400 }
          );
        }

        const stats = await service.getFieldUsageStats(listId);
        return NextResponse.json({
          success: true,
          data: stats,
        });
      }

      case "metadata_mappings": {
        const workspaceId = searchParams.get("workspace_id");
        const mappings = await service.getMetadataMappings(
          workspaceId || undefined
        );

        return NextResponse.json({
          success: true,
          data: {
            workspace_id: workspaceId,
            mappings,
            total_mappings: mappings.length,
          },
        });
      }

      case "field_types": {
        // Return available field types for dropdown selection
        const fieldTypes = Object.values(
          await import("@/lib/metadata/clickup-custom-fields").then(
            m => m.ClickUpFieldType
          )
        );

        return NextResponse.json({
          success: true,
          data: {
            field_types: fieldTypes,
            field_type_descriptions: {
              text: "Basic text input",
              number: "Numeric values",
              currency: "Monetary values with currency formatting",
              date: "Date and time selection",
              dropdown: "Predefined options selection",
              checkbox: "Boolean true/false values",
              url: "Web URLs",
              email: "Email addresses",
              phone: "Phone numbers",
              people: "ClickUp users/members",
              rating: "Star or numeric rating",
              emoji: "Emoji selection",
              formula: "Calculated values",
              rollup: "Aggregated values from related tasks",
              relationship: "Links to other tasks",
              progress: "Percentage completion",
              location: "Geographic locations",
              short_text: "Short text input",
              long_text: "Multi-line text",
              attachment: "File attachments",
            },
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Custom fields API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const apiKey =
      request.headers.get("authorization") || process.env.CLICKUP_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ClickUp API key is required" },
        { status: 401 }
      );
    }

    const service = new ClickUpCustomFieldsService(apiKey);
    const body = await request.json();

    switch (action) {
      case "create_field": {
        const { list_id, field } = body;

        if (!list_id || !field) {
          return NextResponse.json(
            { error: "list_id and field data are required" },
            { status: 400 }
          );
        }

        const createdField = await service.createCustomField(list_id, field);

        return NextResponse.json({
          success: true,
          data: {
            field: createdField,
            message: `Custom field "${field.name}" created successfully`,
          },
        });
      }

      case "update_task_field": {
        const { task_id, field_id, value } = body;

        if (!task_id || !field_id || value === undefined) {
          return NextResponse.json(
            { error: "task_id, field_id, and value are required" },
            { status: 400 }
          );
        }

        await service.updateTaskCustomField(task_id, field_id, value);

        return NextResponse.json({
          success: true,
          data: {
            task_id,
            field_id,
            value,
            message: "Task custom field updated successfully",
          },
        });
      }

      case "setup_content_fields": {
        const { list_id } = body;

        if (!list_id) {
          return NextResponse.json(
            { error: "list_id is required" },
            { status: 400 }
          );
        }

        await service.setupContentFields(list_id);

        return NextResponse.json({
          success: true,
          data: {
            list_id,
            message: "Content fields setup completed successfully",
          },
        });
      }

      case "create_metadata_mapping": {
        const mappingData = body;

        if (
          !mappingData.platform_field ||
          !mappingData.clickup_field_id ||
          !mappingData.field_type
        ) {
          return NextResponse.json(
            {
              error:
                "platform_field, clickup_field_id, and field_type are required",
            },
            { status: 400 }
          );
        }

        const mapping = await service.createMetadataMapping(mappingData);

        return NextResponse.json({
          success: true,
          data: {
            mapping,
            message: "Metadata mapping created successfully",
          },
        });
      }

      case "apply_content_metadata": {
        const { task_id, metadata, mappings } = body;

        if (!task_id || !metadata || !mappings) {
          return NextResponse.json(
            { error: "task_id, metadata, and mappings are required" },
            { status: 400 }
          );
        }

        await service.applyContentMetadata(task_id, metadata, mappings);

        return NextResponse.json({
          success: true,
          data: {
            task_id,
            applied_fields: mappings.length,
            message: "Content metadata applied successfully",
          },
        });
      }

      case "bulk_update_metadata": {
        const { task_ids, metadata, mappings } = body;

        if (!task_ids || !Array.isArray(task_ids) || !metadata || !mappings) {
          return NextResponse.json(
            { error: "task_ids (array), metadata, and mappings are required" },
            { status: 400 }
          );
        }

        const results = await service.bulkUpdateMetadata(
          task_ids,
          metadata,
          mappings
        );

        return NextResponse.json({
          success: true,
          data: {
            results,
            total_tasks: task_ids.length,
            successful_updates: results.success.length,
            failed_updates: results.failed.length,
            message: `Bulk update completed: ${results.success.length} successful, ${results.failed.length} failed`,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Custom fields API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const apiKey =
      request.headers.get("authorization") || process.env.CLICKUP_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ClickUp API key is required" },
        { status: 401 }
      );
    }

    const service = new ClickUpCustomFieldsService(apiKey);
    const body = await request.json();

    switch (action) {
      case "update_metadata_mapping": {
        const { mapping_id, updates } = body;

        if (!mapping_id || !updates) {
          return NextResponse.json(
            { error: "mapping_id and updates are required" },
            { status: 400 }
          );
        }

        // This would require implementing an update method in the service
        // For now, return a placeholder response
        return NextResponse.json({
          success: true,
          data: {
            mapping_id,
            message: "Metadata mapping update endpoint (placeholder)",
          },
        });
      }

      case "batch_field_update": {
        const { list_id, field_updates } = body;

        if (!list_id || !field_updates || !Array.isArray(field_updates)) {
          return NextResponse.json(
            { error: "list_id and field_updates array are required" },
            { status: 400 }
          );
        }

        const results = [];
        for (const update of field_updates) {
          try {
            await service.updateTaskCustomField(
              update.task_id,
              update.field_id,
              update.value
            );
            results.push({ task_id: update.task_id, success: true });
          } catch (error) {
            results.push({
              task_id: update.task_id,
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            results,
            total_updates: field_updates.length,
            successful_updates: results.filter(r => r.success).length,
            failed_updates: results.filter(r => !r.success).length,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Custom fields API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    switch (action) {
      case "delete_metadata_mapping": {
        const mappingId = searchParams.get("mapping_id");

        if (!mappingId) {
          return NextResponse.json(
            { error: "mapping_id parameter is required" },
            { status: 400 }
          );
        }

        // This would require implementing a delete method in the service
        // For now, return a placeholder response
        return NextResponse.json({
          success: true,
          data: {
            mapping_id: mappingId,
            message: "Metadata mapping deletion endpoint (placeholder)",
          },
        });
      }

      case "cleanup_field_history": {
        const daysToKeep = parseInt(searchParams.get("days") || "90");

        // This would call the database cleanup function
        // For now, return a placeholder response
        return NextResponse.json({
          success: true,
          data: {
            days_kept: daysToKeep,
            message: "Field history cleanup endpoint (placeholder)",
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Custom fields API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
