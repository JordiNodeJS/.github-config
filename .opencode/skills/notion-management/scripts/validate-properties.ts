#!/usr/bin/env node
/**
 * Notion Property Validator
 * Validates page properties against a database schema before sending to Notion API
 * 
 * Usage: pnpm dlx tsx scripts/validate-properties.ts <database-id> <properties-json>
 */

import * as fs from 'fs';
import * as path from 'path';

interface PropertySchema {
  type: string;
  name: string;
  options?: Array<{name: string; color?: string}>;
  [key: string]: unknown;
}

interface ValidationError {
  property: string;
  value: unknown;
  error: string;
}

interface DatabaseSchema {
  [propertyName: string]: PropertySchema;
}

/**
 * Validate a single property value against its schema
 */
function validateProperty(
  propertyName: string,
  value: unknown,
  schema: PropertySchema
): ValidationError | null {
  // Null values are always valid
  if (value === null || value === undefined) {
    return null;
  }

  const type = schema.type;

  // String-based properties
  if (['title', 'rich_text', 'url', 'email', 'phone_number'].includes(type)) {
    if (typeof value !== 'string') {
      return {
        property: propertyName,
        value,
        error: `Expected string for ${type} property, got ${typeof value}`
      };
    }
    return null;
  }

  // Number property
  if (type === 'number') {
    if (typeof value !== 'number') {
      return {
        property: propertyName,
        value,
        error: `Expected number for number property, got ${typeof value}`
      };
    }
    return null;
  }

  // Checkbox property
  if (type === 'checkbox') {
    if (value !== '__YES__' && value !== '__NO__') {
      return {
        property: propertyName,
        value,
        error: `Checkbox must be "__YES__" or "__NO__", got "${value}"`
      };
    }
    return null;
  }

  // Select property (single)
  if (type === 'select') {
    if (typeof value !== 'string') {
      return {
        property: propertyName,
        value,
        error: `Expected string for select property, got ${typeof value}`
      };
    }

    if (schema.options) {
      const validOptions = schema.options.map(o => o.name);
      if (!validOptions.includes(value)) {
        return {
          property: propertyName,
          value,
          error: `Invalid option "${value}". Valid options: ${validOptions.join(', ')}`
        };
      }
    }
    return null;
  }

  // Multi-select property
  if (type === 'multi_select') {
    if (typeof value !== 'string') {
      return {
        property: propertyName,
        value,
        error: `Expected string for multi_select property, got ${typeof value}`
      };
    }

    if (schema.options) {
      const validOptions = schema.options.map(o => o.name);
      // Value should be a single valid option (API limitation)
      if (!validOptions.includes(value)) {
        return {
          property: propertyName,
          value,
          error: `Invalid option "${value}". Valid options: ${validOptions.join(', ')}`
        };
      }
    }
    return null;
  }

  // Date property with expanded format
  if (type === 'date') {
    // Date properties use format: date:{property}:start, date:{property}:end, date:{property}:is_datetime
    // This validator handles individual fields
    return null; // Validated elsewhere
  }

  // Place property with expanded format
  if (type === 'place') {
    // Place properties use format: place:{property}:name, place:{property}:address, etc.
    return null; // Validated elsewhere
  }

  // Other types are generally valid if they're strings
  if (typeof value === 'string' || typeof value === 'number') {
    return null;
  }

  return {
    property: propertyName,
    value,
    error: `Unexpected type ${typeof value} for ${type} property`
  };
}

/**
 * Validate all properties for a page
 */
function validatePageProperties(
  properties: Record<string, unknown>,
  schema: DatabaseSchema
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [key, value] of Object.entries(properties)) {
    // Handle expanded property names (date:X:start, place:X:name, etc.)
    const basePropertyName = key.split(':')[0];
    const schemaEntry = schema[basePropertyName] || schema[key];

    if (!schemaEntry) {
      // Check if it's a system property (Last edited, Created time, etc.)
      if (!key.includes(':') && !['Last edited', 'Created by', 'Created time'].includes(key)) {
        errors.push({
          property: key,
          value,
          error: `Property "${key}" not found in database schema`
        });
      }
      continue;
    }

    // Special handling for expanded properties
    if (key.includes(':')) {
      const [baseName, subProperty] = key.split(':');
      const baseSchema = schema[baseName];

      if (baseSchema) {
        if (baseSchema.type === 'date') {
          // Validate date format
          if (subProperty === 'start' || subProperty === 'end') {
            if (value !== null && !/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
              errors.push({
                property: key,
                value,
                error: `Date must be in YYYY-MM-DD format or YYYY-MM-DDTHH:mm:ss, got "${value}"`
              });
            }
          } else if (subProperty === 'is_datetime') {
            if (typeof value !== 'number' || ![0, 1].includes(value as number)) {
              errors.push({
                property: key,
                value,
                error: `is_datetime must be 0 or 1, got ${value}`
              });
            }
          }
        } else if (baseSchema.type === 'place') {
          // Place properties are just strings or numbers
          if (value !== null && typeof value !== 'string' && typeof value !== 'number') {
            errors.push({
              property: key,
              value,
              error: `Place ${subProperty} must be string or number, got ${typeof value}`
            });
          }
        }
      }
      continue;
    }

    const error = validateProperty(key, value, schemaEntry);
    if (error) {
      errors.push(error);
    }
  }

  return errors;
}

/**
 * Main validation function
 */
async function validateProperties(
  databaseIdOrSchema: string,
  propertiesJson: string
): Promise<void> {
  try {
    // Parse properties
    let properties: Record<string, unknown>;
    try {
      properties = JSON.parse(propertiesJson);
    } catch {
      console.error('Error: Invalid JSON for properties');
      console.error(`Received: ${propertiesJson}`);
      process.exit(1);
    }

    // Try to load schema from file first
    let schema: DatabaseSchema = {};

    const schemaPath = path.join(process.cwd(), `schema-${databaseIdOrSchema}.json`);
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      schema = JSON.parse(schemaContent);
      console.log(`✓ Loaded schema from ${schemaPath}`);
    } else {
      // If no schema file, show a message about what to provide
      console.warn(`⚠ No schema file found at ${schemaPath}`);
      console.warn('Create a schema file with: notion_notion-fetch <database-id> > schema.json');
      process.exit(1);
    }

    // Validate
    const errors = validatePageProperties(properties, schema);

    if (errors.length === 0) {
      console.log('✓ All properties are valid!');
      console.log(JSON.stringify(properties, null, 2));
      process.exit(0);
    } else {
      console.error(`✗ Found ${errors.length} validation error(s):\n`);
      errors.forEach(err => {
        console.error(`  • ${err.property}`);
        console.error(`    Value: ${JSON.stringify(err.value)}`);
        console.error(`    Error: ${err.error}\n`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  }
}

// CLI
const [, , databaseId, propertiesJson] = process.argv;

if (!databaseId || !propertiesJson) {
  console.error('Usage: pnpm dlx tsx scripts/validate-properties.ts <database-id> <properties-json>');
  console.error('');
  console.error('Example:');
  console.error('  pnpm dlx tsx scripts/validate-properties.ts 238f4dc3b46280a5 \'{"Name":"Test","Status":"Done"}\'');
  process.exit(1);
}

validateProperties(databaseId, propertiesJson).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
