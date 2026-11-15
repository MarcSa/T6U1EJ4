<script setup lang="ts">
import { mapApiError } from '@/api/apiErrors';
import { useToast } from '@/common/composables/useToast';
import TaskForm from '@/modules/tasks/components/TaskForm.vue';
import type { CreateTaskDto } from '@/modules/tasks/models/create-task.dto';
import type { Task, TaskPriority } from '@/modules/tasks/models/task.model';
import {
  completeAllPendingTasks,
  completeTask,
  createTask,
  deleteAllCompletedTasks,
  getTasks,
} from '@/modules/tasks/services/tasks.service';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

const toast = useToast();

const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadTasks() {
  loading.value = true;
  error.value = null;

  try {
    tasks.value = await getTasks();
  } catch {
    error.value = 'No se han podido cargar las tareas.';
  } finally {
    loading.value = false;
  }
}

async function onCreateTask(payload: CreateTaskDto) {
  try {
    await createTask(payload);
    toast.success('Tarea creada correctamente');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se ha podido crear la tarea'));
  }
}

async function onCompleteTask(taskId: string) {
  try {
    await completeTask(taskId);
    toast.success('Tarea completada');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se ha podido completar la tarea'));
  }
}

async function onCompleteAll() {
  try {
    await completeAllPendingTasks();
    toast.success('Todas las tareas pendientes se han completado');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se han podido completar las tareas'));
  }
}

async function onDeleteCompleted() {
  try {
    await deleteAllCompletedTasks();
    toast.success('Tareas completadas eliminadas');
    await loadTasks();
  } catch (e) {
    toast.error(mapApiError(e, 'No se han podido eliminar las tareas completadas'));
  }
}

function priorityBadge(p: TaskPriority) {
  if (p === 'high') return 'bg-danger';
  if (p === 'medium') return 'bg-primary';
  return 'bg-secondary';
}

// exercici T6U1EJ3
type Sort = 'sort' | 'reverse-sort' | 'none';
const sortByDate = ref<Sort>('none');
const sortByPriority = ref<Sort>('none');

const priorityValueRelation: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};
const changeDateSort = () => {
  sortByPriority.value = 'none';
  sortByDate.value = sortByDate.value === 'sort' ? 'reverse-sort' : 'sort';
};
const changePrioritySort = () => {
  sortByDate.value = 'none';
  sortByPriority.value = sortByPriority.value === 'sort' ? 'reverse-sort' : 'sort';
};

const cleanSort = () => {
  sortByPriority.value = 'none';
  sortByDate.value = 'none';
};

// /exercici T6U1EJ3

// exercici T6U1EJ4
const cardView = ref<boolean>(false);

const changeView = () => {
  cardView.value = !cardView.value;
};

// /exercici T6U1EJ4

// exercici T6U1EJ2
const search = ref<string>('');

const filteredTasks = computed(() => {
  const term = search.value.trim().toLowerCase();

  const result = tasks.value.filter(
    (task) =>
      task.name.toLowerCase().includes(term) ||
      (task.description ?? '').toLowerCase().includes(term),
  );
  // exercici T6U1EJ3
  if (sortByDate.value !== 'none') {
    result.sort((a, b) => {
      const difference = Date.parse(a.dueDate) - Date.parse(b.dueDate);

      return sortByDate.value === 'sort' ? difference : -difference;
    });
  }
  if (sortByPriority.value !== 'none') {
    result.sort((a, b) => {
      const difference = priorityValueRelation[b.priority] - priorityValueRelation[a.priority];

      return sortByPriority.value === 'sort' ? difference : -difference;
    });
  }
  // /exercici T6U1EJ3
  return result;
});
// /exercici T6U1EJ2

onMounted(loadTasks);
</script>

<template>
  <section class="container py-4">
    <header class="d-flex align-items-center justify-content-between mb-3">
      <h1 class="h4 mb-0">Mis tareas</h1>
      <RouterLink to="/" class="btn btn-outline-secondary btn-sm">Volver a Home</RouterLink>
    </header>

    <TaskForm :disabled="loading" @submit="onCreateTask" />
    <div class="d-flex gap-2 mb-3" v-if="!loading && tasks.length">
      <!-- Buscar -->
      <input
        type="text"
        placeholder="Buscar tareas por nombre o descripción..."
        class="form-control"
        v-model="search"
      />
    </div>
    <p
      v-if="!loading && !error && tasks.length > 0 && filteredTasks.length === 0"
      class="text-muted mb-3"
    >
      No hay tareas que coincidan con la búsqueda.
    </p>
    <div class="d-flex justify-content-between">
      <div class="btn-container" v-if="!loading && filteredTasks.length">
        <button type="button" class="btn btn-outline-primary me-2" @click="changeDateSort">
          Ordenar por fecha <span v-if="sortByDate === 'sort'">&uarr;</span>
          <span v-if="sortByDate === 'reverse-sort'">&darr;</span>
        </button>
        <button type="button" class="btn btn-outline-primary me-2" @click="changePrioritySort">
          Ordenar por prioridad <span v-if="sortByPriority === 'sort'">&uarr;</span>
          <span v-if="sortByPriority === 'reverse-sort'">&darr;</span>
        </button>
        <button type="button" class="btn btn-outline-secondary" @click="cleanSort">
          Limpiar orden
        </button>
      </div>
      <!-- T6U1EJ4 -->
      <button type="button" class="btn btn-outline-info info-button ms-auto" @click="changeView">
        Vista {{ !cardView ? 'tarjetas' : 'listas' }}
      </button>
    </div>
    <!-- sort by -->
    <!-- /T6U1EJ4 -->
    <!-- /sort by -->
    <hr v-if="!loading && filteredTasks.length" class="mb-5" />
    <!-- /Buscar -->
    <div class="d-flex gap-2 mb-3">
      <button
        class="btn btn-sm btn-outline-success"
        :disabled="tasks.length === 0 || loading"
        @click="onCompleteAll"
      >
        Completar todas
      </button>

      <button
        class="btn btn-sm btn-outline-danger"
        :disabled="!tasks.some((t) => t.completed) || loading"
        @click="onDeleteCompleted"
      >
        Eliminar completadas
      </button>

      <button
        class="btn btn-sm btn-outline-secondary ms-auto"
        :disabled="loading"
        @click="loadTasks"
      >
        Recargar
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border" role="status"></div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="!loading && filteredTasks.length" :class="cardView ? 'row' : 'list-group'">
      <RouterLink
        v-for="task in filteredTasks"
        :key="task.id"
        :to="{ name: 'task-detail', params: { id: task.id } }"
        :class="
          cardView ? 'col-12 col-lg-4 cardDisplay' : 'list-group-item list-group-item-action '
        "
      >
        <div :class="cardView ? 'card h-100 px-3 py-3' : 'd-flex justify-content-between'">
          <div :class="cardView ? '' : 'me-3'">
            <div v-if="!cardView">
              <span
                class="badge me-2"
                :class="task.completed ? 'bg-success' : 'bg-warning text-dark'"
              >
                {{ task.completed ? 'Hecha' : 'Pendiente' }}
              </span>

              <span class="fw-semibold">{{ task.name }}</span>

              <span class="badge ms-2" :class="priorityBadge(task.priority)">
                {{ task.priority }}
              </span>
            </div>
            <div v-else class="header-card">
              <h4 class="fw-semibold">{{ task.name }}</h4>
              <span
                class="badge ms-auto"
                :class="task.completed ? 'bg-success' : 'bg-warning text-dark'"
              >
                {{ task.completed ? 'Hecha' : 'Pendiente' }}
              </span>
            </div>

            <div class="text-muted small mt-1" :class="cardView ? 'card-description' : ''">
              {{ task.description }}
            </div>
          </div>

          <div class="d-flex align-items-center gap-2" :class="cardView ? 'card-bottom' : ''">
            <span class="badge ms-2" :class="priorityBadge(task.priority)" v-if="cardView">
              {{ task.priority }}
            </span>
            <small class="text-muted">{{ new Date(task.dueDate).toLocaleDateString() }}</small>

            <button
              v-if="!task.completed"
              class="btn btn-sm btn-outline-success"
              :class="cardView ? 'ms-auto' : ''"
              @click.prevent="onCompleteTask(task.id)"
              title="Completar"
            >
              ✓
            </button>
          </div>
        </div>
      </RouterLink>
    </div>

    <p v-if="!loading && tasks.length === 0 && filteredTasks.length === 0" class="text-muted">
      No tienes tareas todavía.
    </p>
  </section>
</template>
<style scoped>
.info-button:hover {
  background-color: #0dcaf0;
  color: #ffffff;
}
.card-bottom .badge {
  margin-left: 0 !important;
}
.header-card {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}
.cardDisplay {
  text-decoration: none;
}
.cardDisplay h4 {
  margin-bottom: 0;
}
.card-description {
  margin-bottom: 1rem;
  margin-top: 0;
}
</style>
