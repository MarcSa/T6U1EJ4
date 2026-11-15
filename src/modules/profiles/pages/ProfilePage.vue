<script setup lang="ts">
import { onMounted, ref } from 'vue';
import router from '@/router';
import { useToast } from '@/common/composables/useToast';
import { getUser } from '@/modules/auth/utils/token';
import { clearAuth } from '@/modules/auth/utils/token';
import type { User } from '@/modules/auth/models/user.model';

const toast = useToast();
const user: User | null = getUser();
const loading = ref(false);

async function loadUser() {
  loading.value = true;
  if (user === null) router.push('/login');
  loading.value = false;
}

function logout() {
  clearAuth();
  toast.info('Sesión cerrada');
  router.push('/login');
}

onMounted(loadUser);
</script>

<template>
  <section class="container py-4">
    <div class="row d-flex justify-content-center">
      <div class="col-12 col-lg-6 col-xl-5">
        <div class="card" v-if="user">
          <h5 class="card-header text-center"><strong>Perfil de Usuario</strong></h5>
          <div class="card-body">
            <div class="d-flex flex-column">
              <p><strong>Email: </strong>{{ user.email }}</p>
              <p>
                <strong>Nombre completo: </strong
                >{{ user.fullName !== '' ? user.fullName : 'No especificado' }}
              </p>
              <p><strong>ID: </strong>{{ user.id }}</p>
              <p><strong>Activo: </strong>{{ user.isActive ? 'Si' : 'No' }}</p>
              <button class="btn btn-outline-danger btn-sm" type="button" @click="logout">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
