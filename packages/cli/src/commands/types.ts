// Re-export canonical type definitions from @dryui/mcp/spec-types.
// This file exists for backward compatibility — all types are defined
// in packages/mcp/src/spec-types.ts and shared between @dryui/mcp and @dryui/cli.

export type {
	PropDef,
	DataAttributeDef,
	ForwardedPropsDef,
	StructureDef,
	PartDef,
	ComponentDef,
	CompositionAlternativeDef,
	CompositionAntiPatternDef,
	CompositionComponentDef,
	CompositionRecipeDef,
	Spec
} from '@dryui/mcp/spec-types';
