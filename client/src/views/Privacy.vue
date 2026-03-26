<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Navbar -->
    <nav class="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900 dark:text-white">SellMate</span>
          </router-link>
          <div class="flex items-center gap-3">
            <button @click="theme.toggle()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" :title="theme.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
              <svg v-if="theme.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            <router-link to="/"
              class="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <!-- Header -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-medium mb-4">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Documento legal
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Politica de Privacidad
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Ultima actualizacion: {{ lastUpdated }}
        </p>
      </div>

      <!-- Sections -->
      <div class="prose prose-gray dark:prose-invert max-w-none space-y-10">

        <!-- 1. Introduction -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            1. Introduccion
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            En <strong class="text-gray-900 dark:text-white">[Nombre de la Empresa]</strong> ("nosotros", "nuestro" o "la empresa"), operamos la plataforma SellMate (en adelante, "el Servicio"), una solucion de gestion de ventas y atencion al cliente a traves de WhatsApp con capacidades de inteligencia artificial.
          </p>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
            Esta Politica de Privacidad describe como recopilamos, usamos, almacenamos y protegemos la informacion personal de nuestros usuarios y de los clientes finales que interactuan con el Servicio. Al utilizar SellMate, usted acepta las practicas descritas en este documento.
          </p>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
            Nos comprometemos a proteger su privacidad y a cumplir con las leyes de proteccion de datos aplicables en su jurisdiccion.
          </p>
        </section>

        <!-- 2. Data Collection -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            2. Datos que Recopilamos
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Recopilamos los siguientes tipos de informacion para proporcionar y mejorar el Servicio:
          </p>

          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">2.1 Informacion del usuario (propietario del negocio)</h3>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Nombre del negocio y tipo de actividad comercial</li>
            <li>Credenciales de acceso (nombre de usuario y contrasena cifrada)</li>
            <li>Configuracion del negocio (horarios, productos, servicios, precios)</li>
            <li>Claves de API de proveedores de inteligencia artificial (almacenadas de forma cifrada)</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">2.2 Informacion de clientes finales</h3>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Numero de telefono de WhatsApp</li>
            <li>Nombre de perfil de WhatsApp</li>
            <li>Contenido de los mensajes enviados y recibidos</li>
            <li>Imagenes y archivos multimedia compartidos en las conversaciones</li>
            <li>Historial de conversaciones y temas de consulta</li>
          </ul>

          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">2.3 Datos generados por el Servicio</h3>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>Pedidos y transacciones registrados</li>
            <li>Citas y reservaciones programadas</li>
            <li>Clasificacion automatica de conversaciones por tema</li>
            <li>Registros de uso de la inteligencia artificial (tokens consumidos, proveedor utilizado)</li>
            <li>Notas y seguimientos creados por los agentes</li>
          </ul>
        </section>

        <!-- 3. Data Usage -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            3. Uso de los Datos
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Utilizamos la informacion recopilada para los siguientes fines:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong class="text-gray-700 dark:text-gray-300">Prestacion del Servicio:</strong> Gestionar conversaciones con clientes, procesar pedidos, programar citas y generar respuestas automatizadas mediante inteligencia artificial.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Personalizacion:</strong> Adaptar las respuestas del chatbot de IA al contexto de su negocio, productos y servicios.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Mejora del Servicio:</strong> Analizar patrones de uso para optimizar el rendimiento y la experiencia del usuario.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Soporte tecnico:</strong> Diagnosticar y resolver problemas tecnicos reportados por los usuarios.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Comunicaciones:</strong> Enviar notificaciones relacionadas con el Servicio, actualizaciones y alertas de seguridad.</li>
          </ul>
        </section>

        <!-- 4. Data Storage -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            4. Almacenamiento y Seguridad de los Datos
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            La seguridad de sus datos es una prioridad para nosotros. Implementamos las siguientes medidas:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong class="text-gray-700 dark:text-gray-300">Almacenamiento local:</strong> SellMate es una aplicacion auto-hospedada. Todos los datos se almacenan en una base de datos SQLite en el servidor del usuario. No mantenemos copias de sus datos en nuestros servidores.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Cifrado de credenciales:</strong> Las contrasenas se almacenan utilizando algoritmos de hash seguros. Las claves de API se almacenan de forma protegida.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Autenticacion:</strong> El acceso al panel de administracion requiere autenticacion mediante tokens JWT.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Responsabilidad del usuario:</strong> Al ser una aplicacion auto-hospedada, el usuario es responsable de la seguridad de su servidor, incluyendo actualizaciones, copias de seguridad y control de acceso a la red.</li>
          </ul>
        </section>

        <!-- 5. Third-party Services -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            5. Servicios de Terceros
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            El Servicio se integra con los siguientes servicios de terceros. Cada uno tiene sus propias politicas de privacidad:
          </p>

          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">5.1 WhatsApp (Meta Platforms)</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            SellMate utiliza la biblioteca Baileys para conectarse a WhatsApp. Los mensajes se transmiten a traves de los servidores de WhatsApp y estan sujetos a los
            <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">Terminos de Servicio y Politica de Privacidad de WhatsApp</a>.
            Los mensajes en WhatsApp cuentan con cifrado de extremo a extremo.
          </p>

          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">5.2 Proveedores de Inteligencia Artificial</h3>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            Para generar respuestas automatizadas, el Servicio puede enviar el contenido de las conversaciones a los siguientes proveedores de IA, segun la configuracion del usuario:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400 mt-3">
            <li><strong class="text-gray-700 dark:text-gray-300">OpenAI</strong> - <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">Politica de Privacidad</a></li>
            <li><strong class="text-gray-700 dark:text-gray-300">Anthropic (Claude)</strong> - <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">Politica de Privacidad</a></li>
            <li><strong class="text-gray-700 dark:text-gray-300">Google (Gemini)</strong> - <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">Politica de Privacidad</a></li>
            <li><strong class="text-gray-700 dark:text-gray-300">Proveedores personalizados</strong> - compatibles con la API de OpenAI, sujetos a sus propias politicas.</li>
          </ul>
          <div class="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p class="text-sm text-amber-800 dark:text-amber-300">
              <strong>Importante:</strong> Al utilizar proveedores de IA, los mensajes de sus clientes se envian a servidores externos para su procesamiento. Asegurese de informar a sus clientes sobre esta practica y de cumplir con las regulaciones de proteccion de datos aplicables en su jurisdiccion.
            </p>
          </div>
        </section>

        <!-- 6. User Rights -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            6. Derechos del Usuario
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Usted tiene los siguientes derechos respecto a sus datos personales:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong class="text-gray-700 dark:text-gray-300">Acceso:</strong> Puede solicitar una copia de todos los datos personales que tenemos sobre usted.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Rectificacion:</strong> Puede solicitar la correccion de datos inexactos o incompletos.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Eliminacion:</strong> Puede solicitar la eliminacion de sus datos personales. Al ser auto-hospedado, puede eliminar directamente la base de datos de su servidor.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Portabilidad:</strong> Puede solicitar sus datos en un formato estructurado y legible por maquina.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Oposicion:</strong> Puede oponerse al procesamiento de sus datos para fines especificos.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Revocacion del consentimiento:</strong> Puede retirar su consentimiento en cualquier momento dejando de utilizar el Servicio.</li>
          </ul>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
            Como propietario del negocio que utiliza SellMate, usted es responsable de garantizar los derechos de privacidad de sus propios clientes finales y de atender sus solicitudes relacionadas con la proteccion de datos.
          </p>
        </section>

        <!-- 7. Cookies -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            7. Cookies y Almacenamiento Local
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            SellMate utiliza las siguientes tecnologias de almacenamiento en el navegador:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li><strong class="text-gray-700 dark:text-gray-300">Token de autenticacion (localStorage):</strong> Para mantener su sesion activa despues de iniciar sesion. Es esencial para el funcionamiento del Servicio.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Preferencias de tema (localStorage):</strong> Para recordar su preferencia de modo claro u oscuro.</li>
            <li><strong class="text-gray-700 dark:text-gray-300">Datos de configuracion (localStorage):</strong> Para mejorar el rendimiento almacenando temporalmente configuraciones del negocio.</li>
          </ul>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
            No utilizamos cookies de rastreo, cookies de publicidad ni herramientas de analitica de terceros. Todo el almacenamiento es estrictamente funcional.
          </p>
        </section>

        <!-- 8. Data Retention -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            8. Retencion de Datos
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            Al ser una aplicacion auto-hospedada, la retencion de datos esta bajo el control total del usuario. Los datos se almacenan en su servidor mientras usted decida mantenerlos. Puede eliminar conversaciones, clientes, productos y cualquier otro dato directamente desde el panel de administracion o eliminando la base de datos del servidor.
          </p>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mt-3">
            Los datos enviados a proveedores de IA estan sujetos a las politicas de retencion de cada proveedor. Le recomendamos revisar dichas politicas para comprender como manejan la informacion procesada.
          </p>
        </section>

        <!-- 9. Children -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            9. Menores de Edad
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            El Servicio esta dirigido a personas mayores de 18 anos o la edad legal minima en su jurisdiccion para operar un negocio. No recopilamos intencionalmente informacion de menores de edad. Si descubrimos que hemos recopilado datos de un menor, tomaremos las medidas necesarias para eliminar dicha informacion.
          </p>
        </section>

        <!-- 10. Changes -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            10. Cambios en esta Politica
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed">
            Nos reservamos el derecho de actualizar esta Politica de Privacidad en cualquier momento. Las modificaciones seran efectivas inmediatamente despues de su publicacion en esta pagina. Le recomendamos revisar esta politica periodicamente. La fecha de la ultima actualizacion se indica al inicio de este documento.
          </p>
        </section>

        <!-- 11. Contact -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            11. Contacto
          </h2>
          <p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Politica de Privacidad o el tratamiento de sus datos personales, puede contactarnos a traves de:
          </p>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-3">
            <p class="text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">Empresa:</strong> [Nombre de la Empresa]
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">Correo electronico:</strong> [correo@ejemplo.com]
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">Direccion:</strong> [Direccion fisica de la empresa]
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <strong class="text-gray-900 dark:text-white">Telefono:</strong> [Numero de telefono]
            </p>
          </div>
        </section>

      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">SellMate</span>
          </router-link>
          <div class="flex items-center gap-6">
            <router-link to="/" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Inicio</router-link>
            <a href="https://github.com/cebasic/sellmate" target="_blank" rel="noopener noreferrer" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">GitHub</a>
          </div>
          <p class="text-xs text-gray-400 dark:text-gray-500">Hecho con IA &middot; Licencia MIT</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const theme = useThemeStore()

const lastUpdated = new Date().toLocaleDateString('es-ES', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})
</script>
