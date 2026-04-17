<script lang="ts">
	import { DragAndDrop, Badge, Separator } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';

	let items = $state([
		'Design system audit',
		'Review pull requests',
		'Update documentation',
		'Write release notes',
		'Fix accessibility issues',
		'Deploy to staging'
	]);

	type Task = { id: string; title: string; tag: string; color: 'blue' | 'green' | 'purple' };

	let todo = $state<Task[]>([
		{ id: 't1', title: 'Research', tag: 'Research', color: 'blue' },
		{ id: 't2', title: 'Token palette', tag: 'Design', color: 'purple' },
		{ id: 't3', title: 'API proposal', tag: 'Engineering', color: 'green' }
	]);

	let inProgress = $state<Task[]>([
		{ id: 'p1', title: 'Card component', tag: 'Engineering', color: 'green' },
		{ id: 'p2', title: 'Onboarding flow', tag: 'Design', color: 'purple' }
	]);

	let done = $state<Task[]>([
		{ id: 'd1', title: 'Monorepo setup', tag: 'Engineering', color: 'green' },
		{ id: 'd2', title: 'Color audit', tag: 'Design', color: 'purple' }
	]);

	function getList(id: string): Task[] {
		if (id === 'todo') return todo;
		if (id === 'progress') return inProgress;
		return done;
	}

	function setList(id: string, items: Task[]) {
		if (id === 'todo') todo = items;
		else if (id === 'progress') inProgress = items;
		else done = items;
	}

	function handleMove(fromId: string, fromIdx: number, toId: string, toIdx: number) {
		const source = [...getList(fromId)];
		const [item] = source.splice(fromIdx, 1);
		if (!item) return;
		setList(fromId, source);

		const target = [...getList(toId)];
		target.splice(toIdx, 0, item);
		setList(toId, target);
	}
</script>

<DocsDemo gap="xl">
	<div class="task-list">
		<DragAndDrop.Root {items} onReorder={(reordered) => (items = reordered)}>
			{#each items as item, i (item)}
				<DragAndDrop.Item index={i}>
					<DragAndDrop.Handle index={i} />
					{item}
				</DragAndDrop.Item>
			{/each}
		</DragAndDrop.Root>
	</div>

	<Separator />

	<div class="kanban-header">
		<p class="kanban-title">Kanban board</p>
		<p class="kanban-subtitle">Drag tasks between columns or reorder within</p>
	</div>

	<DragAndDrop.Group onMove={handleMove}>
		<div class="kanban">
			<div class="column">
				<div class="column-header">
					<span class="column-dot" data-color="warning"></span>
					<span class="column-name">To do</span>
					<span class="column-count">{todo.length}</span>
				</div>
				<DragAndDrop.Root items={todo} listId="todo" onReorder={(r) => (todo = r)}>
					{#each todo as task, i (task.id)}
						<DragAndDrop.Item index={i}>
							<span class="task-title">{task.title}</span>
							<Badge variant="soft" color={task.color} size="sm">{task.tag}</Badge>
						</DragAndDrop.Item>
					{/each}
				</DragAndDrop.Root>
			</div>

			<div class="column">
				<div class="column-header">
					<span class="column-dot" data-color="brand"></span>
					<span class="column-name">In progress</span>
					<span class="column-count">{inProgress.length}</span>
				</div>
				<DragAndDrop.Root items={inProgress} listId="progress" onReorder={(r) => (inProgress = r)}>
					{#each inProgress as task, i (task.id)}
						<DragAndDrop.Item index={i}>
							<span class="task-title">{task.title}</span>
							<Badge variant="soft" color={task.color} size="sm">{task.tag}</Badge>
						</DragAndDrop.Item>
					{/each}
				</DragAndDrop.Root>
			</div>

			<div class="column">
				<div class="column-header">
					<span class="column-dot" data-color="success"></span>
					<span class="column-name">Done</span>
					<span class="column-count">{done.length}</span>
				</div>
				<DragAndDrop.Root items={done} listId="done" onReorder={(r) => (done = r)}>
					{#each done as task, i (task.id)}
						<DragAndDrop.Item index={i}>
							<span class="task-title">{task.title}</span>
							<Badge variant="soft" color={task.color} size="sm">{task.tag}</Badge>
						</DragAndDrop.Item>
					{/each}
				</DragAndDrop.Root>
			</div>
		</div>
	</DragAndDrop.Group>
</DocsDemo>

<style>
	.task-list {
		--dry-dnd-item-columns: auto 1fr;
	}

	.kanban-header {
		display: grid;
		gap: var(--dry-space-1);
	}

	.kanban-title {
		font-weight: 600;
		font-size: var(--dry-text-lg-size);
		color: var(--dry-color-text-strong);
		margin: 0;
	}

	.kanban-subtitle {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		margin: 0;
	}

	.kanban {
		container-type: inline-size;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--dry-space-4);
	}

	@container (max-width: 40rem) {
		.kanban {
			grid-template-columns: 1fr;
		}
	}

	.column {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		background: var(--dry-color-bg-sunken);
		border-radius: var(--dry-radius-lg);
		--dry-dnd-item-columns: 1fr auto;
		--dry-dnd-item-padding: var(--dry-space-3) var(--dry-space-4);
		--dry-dnd-gap: var(--dry-space-3);
	}

	.column-header {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
		padding: 0 var(--dry-space-1);
		padding-bottom: var(--dry-space-1);
	}

	.column-dot {
		display: block;
		height: 8px;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-full);
	}

	.column-dot[data-color='warning'] {
		background: var(--dry-color-fill-warning);
	}

	.column-dot[data-color='brand'] {
		background: var(--dry-color-fill-brand);
	}

	.column-dot[data-color='success'] {
		background: var(--dry-color-fill-success);
	}

	.column-name {
		font-weight: 600;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.column-count {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		font-variant-numeric: tabular-nums;
	}

	.task-title {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
