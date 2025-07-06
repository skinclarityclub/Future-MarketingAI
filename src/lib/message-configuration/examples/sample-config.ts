/**
 * Sample Configuration for Message Configuration System
 *
 * This file provides a sample configuration that can be used as a starting point
 * for implementing the message configuration system in your application.
 */

import { MessageConfigurationSchema } from "../schemas/message-config-schema";
import defaultMessagesData from "./default-messages.json";

// Cast the JSON data to the proper TypeScript type
export const exampleMessageConfig: MessageConfigurationSchema =
  defaultMessagesData as MessageConfigurationSchema;

// Export for backward compatibility
export default exampleMessageConfig;
