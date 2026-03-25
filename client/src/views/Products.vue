<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Productos</h2>
      <button v-if="auth.isAdmin" @click="showForm = true"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
        + Agregar producto
      </button>
    </div>

    <!-- Product Form Modal -->
    <div v-if="showForm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">{{ editingProduct ? 'Editar' : 'Nuevo' }} Producto</h3>
        <div class="space-y-3">
          <input v-model="form.name" placeholder="Nombre del producto" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          <textarea v-model="form.description" placeholder="Descripcion" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"></textarea>
          <div class="grid grid-cols-3 gap-3">
            <input v-model.number="form.price" type="number" step="0.01" placeholder="Precio" class="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input v-model="form.category" placeholder="Categoria" class="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input v-model.number="form.stock" type="number" placeholder="Stock" class="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <input v-model="form.image_url" placeholder="URL de imagen (opcional)" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button @click="closeForm" class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm">Cancelar</button>
          <button @click="saveProduct" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {{ editingProduct ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div v-if="products.length === 0" class="text-center py-16 text-gray-400 dark:text-gray-500">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      <p class="text-sm">No hay productos aun. Agrega el primero.</p>
    </div>
    <div v-else>
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-700/50 text-left">
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Imagen</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Categoria</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Precio</th>
                <th class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                <th v-if="auth.isAdmin" class="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr v-for="product in paginatedProducts" :key="product.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-4 py-3">
                  <img v-if="product.image_url" :src="product.image_url" :alt="product.name"
                    class="w-10 h-10 rounded-lg object-cover" />
                  <div v-else class="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-gray-800 dark:text-white">{{ product.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ product.description }}</p>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ product.category || '—' }}</td>
                <td class="px-4 py-3 font-semibold text-primary-600">${{ product.price }}</td>
                <td class="px-4 py-3">
                  <span :class="product.stock > 0 ? 'text-green-600' : 'text-red-500'">
                    {{ product.stock > 0 ? product.stock : 'Agotado' }}
                  </span>
                </td>
                <td v-if="auth.isAdmin" class="px-4 py-3">
                  <div class="flex gap-1.5">
                    <button @click="editProduct(product)" class="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors" title="Editar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    <button @click="duplicateProduct(product)" class="p-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors" title="Duplicar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                    <button @click="deleteProduct(product.id)" class="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors" title="Eliminar">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }}–{{ Math.min(currentPage * itemsPerPage, products.length) }} de {{ products.length }}
        </p>
        <div class="flex items-center gap-1">
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300">
            Anterior
          </button>
          <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
            class="w-8 h-8 text-sm rounded-lg transition-colors"
            :class="page === currentPage
              ? 'bg-primary-600 text-white'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'">
            {{ page }}
          </button>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../lib/api'

const auth = useAuthStore()
const products = ref([])
const showForm = ref(false)
const editingProduct = ref(null)
const form = ref({ name: '', description: '', price: 0, category: '', stock: 0, image_url: '' })

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return products.value.slice(start, start + itemsPerPage)
})

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Reset page if current page exceeds total after deletion
watch(() => products.value.length, () => {
  if (currentPage.value > totalPages.value && totalPages.value > 0) {
    currentPage.value = totalPages.value
  }
})

onMounted(async () => {
  const { data } = await api.get('/products')
  products.value = data.products
})

function editProduct(product) {
  editingProduct.value = product
  form.value = { ...product }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingProduct.value = null
  form.value = { name: '', description: '', price: 0, category: '', stock: 0, image_url: '' }
}

async function saveProduct() {
  try {
    if (editingProduct.value) {
      const { data } = await api.put(`/products/${editingProduct.value.id}`, form.value)
      const idx = products.value.findIndex(p => p.id === editingProduct.value.id)
      if (idx !== -1) products.value[idx] = data.product
    } else {
      const { data } = await api.post('/products', form.value)
      products.value.unshift(data.product)
    }
    closeForm()
  } catch (err) {
    alert(err.response?.data?.error || 'Error')
  }
}

async function duplicateProduct(product) {
  try {
    const { data } = await api.post('/products', {
      name: `${product.name} (copia)`,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url
    })
    products.value.unshift(data.product)
  } catch (err) {
    alert(err.response?.data?.error || 'Error al duplicar')
  }
}

async function deleteProduct(id) {
  if (!confirm('¿Eliminar este producto?')) return
  await api.delete(`/products/${id}`)
  products.value = products.value.filter(p => p.id !== id)
}
</script>
