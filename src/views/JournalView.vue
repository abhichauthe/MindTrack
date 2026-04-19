<template>
  <div class="dashboard">
    <AppSidebar active="journal" />

    <main class="main">
      <div class="page-header flex justify-between items-center">
        <div>
          <h2>Journal</h2>
          <p class="text-secondary text-sm mt-1">Track your thoughts and daily mood</p>
        </div>
        <button class="btn btn-primary btn-sm" @click="openModal()">+ New Entry</button>
      </div>

      <!-- Mood summary strip -->
      <div class="mood-strip card" v-if="journalStore.entries.length">
        <div class="mood-strip-label text-muted text-sm mono">Recent Mood</div>
        <div class="mood-dots">
          <div
            v-for="entry in journalStore.entries.slice(0, 14)"
            :key="entry.id"
            class="mood-dot"
            :style="{ background: moodColor(entry.mood) }"
            :title="`${entry.date} — ${entry.mood}`"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="journalStore.loading" class="loading-state">
        <div class="spinner" />
      </div>

      <!-- Empty -->
      <div v-else-if="!journalStore.entries.length" class="empty-state">
        <div class="empty-icon">◫</div>
        <h3>No journal entries yet</h3>
        <p class="text-secondary text-sm">Write your first entry to start tracking your mental state.</p>
        <button class="btn btn-primary" style="margin-top:16px" @click="openModal()">+ Write First Entry</button>
      </div>

      <!-- Entries list -->
      <TransitionGroup v-else name="habit-list" tag="div" class="entries-list">
        <div
          v-for="entry in journalStore.entries"
          :key="entry.id"
          class="entry-card card"
          @click="openModal(entry)"
        >
          <div class="entry-top">
            <div class="entry-mood-badge" :style="{ background: moodColor(entry.mood) + '22', color: moodColor(entry.mood) }">
              {{ moodEmoji(entry.mood) }} {{ entry.mood }}
            </div>
            <div class="text-muted text-sm mono">{{ formatDate(entry.date) }}</div>
          </div>
          <div class="entry-title">{{ entry.title }}</div>
          <div class="entry-preview text-secondary text-sm">{{ truncate(entry.content) }}</div>
          <div class="entry-actions" @click.stop>
            <button class="btn btn-ghost btn-sm" @click="openModal(entry)">Edit</button>
            <button class="btn btn-danger btn-sm" @click="handleDelete(entry.id)">Delete</button>
          </div>
        </div>
      </TransitionGroup>
    </main>

    <!-- Entry Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box card">
            <div class="flex justify-between items-center" style="margin-bottom:20px">
              <h3 style="font-size:18px">{{ editingEntry ? 'Edit Entry' : 'New Entry' }}</h3>
              <button class="btn btn-ghost btn-icon" @click="closeModal">✕</button>
            </div>

            <div v-if="formError" class="alert alert-error" style="margin-bottom:16px">{{ formError }}</div>

            <form @submit.prevent="handleSubmit" class="modal-form">
              <!-- Mood picker -->
              <div class="form-group">
                <label class="form-label">How are you feeling?</label>
                <div class="mood-picker">
                  <button
                    v-for="m in moods"
                    :key="m.key"
                    type="button"
                    class="mood-btn"
                    :class="{ selected: form.mood === m.key }"
                    :style="form.mood === m.key ? { borderColor: m.color, background: m.color + '22' } : {}"
                    @click="form.mood = m.key"
                  >
                    <span class="mood-emoji">{{ m.emoji }}</span>
                    <span class="mood-label">{{ m.label }}</span>
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Title *</label>
                <input v-model="form.title" class="form-input" placeholder="What's on your mind?" required maxlength="120" />
              </div>

              <div class="form-group">
                <label class="form-label">Content</label>
                <textarea
                  v-model="form.content"
                  class="form-input journal-textarea"
                  placeholder="Write freely..."
                  rows="5"
                />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <span v-if="saving" class="spinner" />
                  <span v-else>{{ editingEntry ? 'Update' : 'Save Entry' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useJournalStore } from '@/store/journal'
import AppSidebar from '@/components/AppSidebar.vue'

const journalStore = useJournalStore()

const showModal    = ref(false)
const editingEntry = ref(null)
const saving       = ref(false)
const formError    = ref('')

const moods = [
  { key: 'GREAT',   label: 'Great',   emoji: '😄', color: '#34d399' },
  { key: 'GOOD',    label: 'Good',    emoji: '🙂', color: '#60a5fa' },
  { key: 'NEUTRAL', label: 'Neutral', emoji: '😐', color: '#a78bfa' },
  { key: 'BAD',     label: 'Bad',     emoji: '😕', color: '#fb923c' },
  { key: 'AWFUL',   label: 'Awful',   emoji: '😞', color: '#f87171' },
]

const form = reactive({ title: '', content: '', mood: 'NEUTRAL' })

function openModal(entry = null) {
  editingEntry.value = entry
  if (entry) {
    form.title   = entry.title
    form.content = entry.content || ''
    form.mood    = entry.mood
  } else {
    form.title   = ''
    form.content = ''
    form.mood    = 'NEUTRAL'
  }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value    = false
  editingEntry.value = null
  formError.value    = ''
}

async function handleSubmit() {
  formError.value = ''
  saving.value = true
  try {
    if (editingEntry.value) {
      await journalStore.updateEntry(editingEntry.value.id, {
        title: form.title, content: form.content, mood: form.mood
      })
    } else {
      await journalStore.createEntry({
        title: form.title, content: form.content, mood: form.mood
      })
    }
    closeModal()
  } catch (e) {
    formError.value = e.message
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (!confirm('Delete this entry?')) return
  await journalStore.deleteEntry(id)
}

// ── Helpers ───────────────────────────────────────────────────
function moodColor(mood) {
  return moods.find(m => m.key === mood)?.color || '#888'
}

function moodEmoji(mood) {
  return moods.find(m => m.key === mood)?.emoji || ''
}

function formatDate(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function truncate(text, len = 120) {
  if (!text) return 'No content'
  return text.length > len ? text.slice(0, len) + '…' : text
}

onMounted(() => journalStore.fetchEntries())
</script>

<style scoped>
.dashboard { display: flex; min-height: 100vh; }
.main { flex: 1; padding: 32px 40px; max-width: 860px; }
.page-header { margin-bottom: 24px; }
.page-header h2 { font-size: 20px; }

/* Mood strip */
.mood-strip {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; margin-bottom: 24px;
}
.mood-strip-label { flex-shrink: 0; }
.mood-dots { display: flex; gap: 6px; flex-wrap: wrap; }
.mood-dot { width: 14px; height: 14px; border-radius: 50%; cursor: default; transition: transform 0.15s; }
.mood-dot:hover { transform: scale(1.3); }

/* Entries */
.entries-list { display: flex; flex-direction: column; gap: 12px; }
.entry-card {
  padding: 20px; cursor: pointer;
  transition: border-color var(--transition), transform var(--transition);
}
.entry-card:hover { border-color: var(--border-light); transform: translateY(-1px); }

.entry-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.entry-mood-badge { padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; font-family: var(--font-mono); }
.entry-title { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.entry-preview { line-height: 1.5; margin-bottom: 14px; }
.entry-actions { display: flex; gap: 8px; }

/* Empty / loading */
.empty-state, .loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 24px; text-align: center;
  border: 1px dashed var(--border); border-radius: var(--radius);
}
.empty-icon { font-size: 36px; color: var(--accent); opacity: 0.4; }
.empty-state h3 { font-size: 18px; }

/* Mood picker */
.mood-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.mood-btn {
  flex: 1; min-width: 70px;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 10px 8px; border-radius: var(--radius-sm);
  border: 2px solid var(--border); background: var(--bg-card);
  cursor: pointer; transition: all var(--transition);
}
.mood-btn:hover { border-color: var(--border-light); }
.mood-btn.selected { box-shadow: 0 0 12px rgba(0,0,0,0.2); }
.mood-emoji { font-size: 22px; }
.mood-label { font-size: 11px; font-weight: 600; color: var(--text-secondary); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; }

.journal-textarea { resize: vertical; min-height: 120px; font-family: var(--font-display); line-height: 1.6; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; padding: 24px; z-index: 100;
}
.modal-box { width: 100%; max-width: 520px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }

.habit-list-enter-active { transition: all 0.3s ease; }
.habit-list-enter-from { opacity: 0; transform: translateY(8px); }
.habit-list-leave-active { transition: all 0.2s ease; }
.habit-list-leave-to { opacity: 0; }
</style>