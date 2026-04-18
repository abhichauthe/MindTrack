<template>
  <div class="habit-card" :class="{ completed: habit.completedToday }">
    <button class="check-btn" :class="{ done: habit.completedToday }" @click="$emit('toggle')">
      <span v-if="habit.completedToday" class="check-icon">✓</span>
      <span v-else class="check-icon-empty" />
    </button>

    <div class="habit-info">
      <div class="habit-name" :class="{ 'strike': habit.completedToday }">
        {{ habit.name }}
      </div>
      <div v-if="habit.description" class="habit-desc text-sm text-muted">
        {{ habit.description }}
      </div>
    </div>

    <div class="habit-meta">
      <span v-if="habit.completedToday" class="badge badge-green">Done</span>
      <span v-else class="badge badge-muted">Pending</span>
      <div class="habit-date text-muted mono" style="font-size:11px;margin-top:4px">
        {{ formatDate(habit.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ habit: Object })
defineEmits(['toggle'])

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.habit-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--transition);
  cursor: default;
}

.habit-card:hover {
  border-color: var(--border-light);
  background: var(--bg-hover);
}

.habit-card.completed {
  border-color: #34d39930;
  background: #34d39908;
}

/* Check button */
.check-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition);
}

.check-btn:hover { border-color: var(--accent); }

.check-btn.done {
  background: var(--green);
  border-color: var(--green);
}

.check-icon { color: #000; font-size: 14px; font-weight: 700; line-height: 1; }
.check-icon-empty { width: 10px; height: 10px; border-radius: 50%; background: transparent; }

.check-btn:not(.done):hover .check-icon-empty {
  background: var(--accent);
  opacity: 0.4;
}

/* Info */
.habit-info { flex: 1; min-width: 0; }
.habit-name {
  font-size: 15px;
  font-weight: 600;
  transition: color var(--transition);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.habit-name.strike {
  text-decoration: line-through;
  color: var(--text-muted);
}
.habit-desc {
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Meta */
.habit-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
</style>