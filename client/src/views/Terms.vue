<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Navbar -->
    <nav class="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <div class="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">SellMate</span>
          </router-link>
          <button @click="theme.toggle()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" :title="theme.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'">
            <svg v-if="theme.isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Terminos y Condiciones
        </h1>
        <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Ultima actualizacion: 26 de marzo de 2026
        </p>
      </div>

      <!-- Sections -->
      <div class="prose prose-gray dark:prose-invert max-w-none space-y-10">

        <!-- 1. Introduccion -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            1. Introduccion
          </h2>
          <p class="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            Bienvenido a SellMate ("la Plataforma", "el Servicio", "nosotros"). Estos Terminos y Condiciones ("Terminos") regulan el acceso y uso de la plataforma SellMate, operada por [Nombre de la Empresa], con domicilio en [Direccion de la Empresa], [Ciudad, Estado, Codigo Postal, Pais].
          </p>
          <p class="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            Al acceder, registrarse o utilizar SellMate, usted ("el Usuario", "usted") acepta estar vinculado por estos Terminos en su totalidad. Si no esta de acuerdo con alguna parte de estos Terminos, le solicitamos que no utilice la Plataforma.
          </p>
          <p class="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            SellMate es una plataforma de gestion comercial que integra servicios de mensajeria (WhatsApp), inteligencia artificial y herramientas de administracion de negocios para facilitar la comunicacion con clientes, la gestion de productos, pedidos, citas y seguimiento comercial.
          </p>
        </section>

        <!-- 2. Definiciones -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            2. Definiciones
          </h2>
          <ul class="mt-4 space-y-3 text-gray-600 dark:text-gray-300">
            <li class="flex gap-2">
              <span class="font-semibold text-gray-900 dark:text-white shrink-0">"Plataforma":</span>
              <span>El software SellMate, incluyendo su interfaz web, servidor backend, integraciones con servicios de terceros y todas las funcionalidades asociadas.</span>
            </li>
            <li class="flex gap-2">
              <span class="font-semibold text-gray-900 dark:text-white shrink-0">"Usuario":</span>
              <span>Toda persona fisica o juridica que acceda, se registre o utilice la Plataforma.</span>
            </li>
            <li class="flex gap-2">
              <span class="font-semibold text-gray-900 dark:text-white shrink-0">"Chatbot IA":</span>
              <span>El asistente automatizado impulsado por inteligencia artificial que interactua con los clientes del Usuario a traves de WhatsApp.</span>
            </li>
            <li class="flex gap-2">
              <span class="font-semibold text-gray-900 dark:text-white shrink-0">"Cliente Final":</span>
              <span>Toda persona que interactue con el negocio del Usuario a traves de los canales de comunicacion gestionados por la Plataforma.</span>
            </li>
            <li class="flex gap-2">
              <span class="font-semibold text-gray-900 dark:text-white shrink-0">"Contenido del Usuario":</span>
              <span>Toda informacion, datos, textos, imagenes, catalogos de productos y configuraciones que el Usuario ingrese en la Plataforma.</span>
            </li>
            <li class="flex gap-2">
              <span class="font-semibold text-gray-900 dark:text-white shrink-0">"Servicios de Terceros":</span>
              <span>Servicios externos integrados en la Plataforma, incluyendo pero no limitado a WhatsApp (Meta Platforms), proveedores de inteligencia artificial (OpenAI, Anthropic, Google) y otros servicios de infraestructura.</span>
            </li>
          </ul>
        </section>

        <!-- 3. Cuenta y Registro -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            3. Cuenta y Registro
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">3.1.</span> Para utilizar SellMate, el Usuario debe crear una cuenta proporcionando informacion veraz, completa y actualizada. El Usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">3.2.</span> El Usuario declara ser mayor de edad conforme a la legislacion aplicable en su jurisdiccion y contar con la capacidad legal necesaria para aceptar estos Terminos.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">3.3.</span> Si el Usuario actua en representacion de una persona juridica, declara contar con las facultades y autorizaciones necesarias para vincular a dicha entidad a estos Terminos.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">3.4.</span> El Usuario es el unico responsable de toda actividad que ocurra bajo su cuenta. Debera notificar de inmediato a [Nombre de la Empresa] cualquier uso no autorizado de su cuenta o cualquier otra vulneracion de seguridad.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">3.5.</span> Nos reservamos el derecho de suspender o cancelar cuentas que incumplan estos Terminos, sin previo aviso y sin responsabilidad alguna.
            </p>
          </div>
        </section>

        <!-- 4. Uso Aceptable -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            4. Uso Aceptable
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>El Usuario se compromete a utilizar la Plataforma de manera licita y conforme a estos Terminos. Queda expresamente prohibido:</p>
            <ul class="list-disc pl-6 space-y-2 mt-3">
              <li>Utilizar la Plataforma para enviar mensajes no solicitados (spam), contenido fraudulento, difamatorio, obsceno o que infrinja derechos de terceros.</li>
              <li>Intentar acceder sin autorizacion a sistemas, redes o datos de la Plataforma o de otros usuarios.</li>
              <li>Realizar ingenieria inversa, descompilar o desensamblar cualquier componente de la Plataforma, salvo en los terminos permitidos por la licencia de codigo abierto aplicable.</li>
              <li>Utilizar la Plataforma para actividades ilegales, incluyendo pero no limitado a lavado de dinero, fraude, estafa o venta de productos prohibidos.</li>
              <li>Suplantar la identidad de otra persona o entidad, o declarar falsamente una afiliacion con cualquier persona o entidad.</li>
              <li>Sobrecargar intencionalmente la infraestructura de la Plataforma o interferir con su funcionamiento normal.</li>
              <li>Utilizar el Chatbot IA para generar contenido que viole la legislacion aplicable o los terminos de uso de los proveedores de inteligencia artificial.</li>
              <li>Compartir claves API de servicios de terceros que no pertenezcan al Usuario.</li>
            </ul>
          </div>
        </section>

        <!-- 5. Inteligencia Artificial y Chatbot -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            5. Inteligencia Artificial y Chatbot - Descargo de Responsabilidad
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">5.1.</span> SellMate integra tecnologias de inteligencia artificial de terceros (incluyendo OpenAI, Anthropic y Google) para proporcionar respuestas automatizadas a los clientes del Usuario. Estas respuestas son generadas por algoritmos de IA y <span class="font-semibold text-gray-900 dark:text-white">no constituyen asesoramiento profesional</span> de ninguna indole.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">5.2.</span> Las respuestas generadas por la IA pueden contener errores, imprecisiones o informacion desactualizada. [Nombre de la Empresa] no garantiza la exactitud, integridad, idoneidad o confiabilidad de las respuestas generadas por el Chatbot IA.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">5.3.</span> El Usuario es el unico responsable de supervisar, revisar y validar las respuestas que el Chatbot IA proporciona a sus clientes. Se recomienda encarecidamente que el Usuario configure adecuadamente el prompt del sistema y revise periodicamente las conversaciones.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">5.4.</span> El Usuario reconoce que el uso de servicios de IA esta sujeto a los terminos y condiciones de los respectivos proveedores (OpenAI, Anthropic, Google, entre otros) y se compromete a cumplir con dichos terminos.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">5.5.</span> Las claves API de los proveedores de IA son proporcionadas y gestionadas por el propio Usuario. [Nombre de la Empresa] no se responsabiliza por cargos, costos o consecuencias derivadas del uso de dichas claves API.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">5.6.</span> [Nombre de la Empresa] no se hace responsable de decisiones comerciales, financieras o de cualquier otra naturaleza que el Usuario o sus clientes tomen con base en las respuestas generadas por la IA.
            </p>
          </div>
        </section>

        <!-- 6. Integracion con WhatsApp -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            6. Integracion con WhatsApp
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">6.1.</span> SellMate utiliza bibliotecas de terceros para conectarse a WhatsApp. Esta integracion no esta afiliada, patrocinada ni respaldada por Meta Platforms, Inc. (propietaria de WhatsApp).
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">6.2.</span> El Usuario reconoce y acepta que el uso de la integracion con WhatsApp esta sujeto a los Terminos de Servicio de WhatsApp y a las Politicas de Meta Platforms. El Usuario es el unico responsable de cumplir con dichos terminos.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">6.3.</span> [Nombre de la Empresa] no garantiza la disponibilidad continua, estabilidad o compatibilidad de la integracion con WhatsApp. Cambios en las politicas o la tecnologia de WhatsApp podrian afectar o interrumpir el funcionamiento de la Plataforma sin previo aviso.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">6.4.</span> El Usuario asume todo riesgo asociado con el uso de la integracion con WhatsApp, incluyendo pero no limitado a la suspension o bloqueo de su numero de telefono por parte de WhatsApp.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">6.5.</span> El Usuario es responsable de obtener el consentimiento adecuado de sus Clientes Finales antes de enviarles mensajes automatizados a traves de WhatsApp, conforme a la legislacion aplicable en materia de proteccion de datos y comunicaciones electronicas.
            </p>
          </div>
        </section>

        <!-- 7. Datos Personales y Privacidad -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            7. Datos Personales y Privacidad
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">7.1.</span> La Plataforma almacena datos localmente en el servidor del Usuario (base de datos SQLite). [Nombre de la Empresa] no aloja ni tiene acceso a los datos del Usuario en sus servidores, salvo cuando el Usuario utilice servicios de terceros integrados (proveedores de IA) que procesen dichos datos conforme a sus propias politicas de privacidad.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">7.2.</span> El Usuario es el unico responsable del tratamiento de los datos personales de sus Clientes Finales y se compromete a cumplir con la legislacion aplicable en materia de proteccion de datos personales en su jurisdiccion.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">7.3.</span> Al utilizar proveedores de IA integrados, el Usuario reconoce que el contenido de las conversaciones puede ser procesado por dichos proveedores conforme a sus respectivas politicas de privacidad y terminos de uso.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">7.4.</span> El Usuario se compromete a implementar las medidas de seguridad adecuadas para proteger los datos almacenados en su instancia de SellMate.
            </p>
          </div>
        </section>

        <!-- 8. Propiedad Intelectual -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            8. Propiedad Intelectual
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">8.1.</span> SellMate es software de codigo abierto distribuido bajo la Licencia MIT. El Usuario puede utilizar, copiar, modificar y distribuir el software conforme a los terminos de dicha licencia.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">8.2.</span> La marca "SellMate", el logotipo y los elementos graficos asociados son propiedad de [Nombre de la Empresa] y estan protegidos por las leyes de propiedad intelectual aplicables. La licencia MIT del codigo fuente no otorga derechos sobre las marcas.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">8.3.</span> El Contenido del Usuario permanece como propiedad exclusiva del Usuario. Al utilizar la Plataforma, el Usuario otorga a [Nombre de la Empresa] una licencia limitada y no exclusiva para procesar dicho contenido unicamente con el fin de prestar el Servicio.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">8.4.</span> Las respuestas generadas por la IA estan sujetas a los terminos de propiedad intelectual de los respectivos proveedores de IA.
            </p>
          </div>
        </section>

        <!-- 9. Limitacion de Responsabilidad -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            9. Limitacion de Responsabilidad
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">9.1.</span> LA PLATAFORMA SE PROPORCIONA "TAL CUAL" Y "SEGUN DISPONIBILIDAD", SIN GARANTIAS DE NINGUN TIPO, YA SEAN EXPRESAS O IMPLICITAS, INCLUYENDO PERO NO LIMITADO A GARANTIAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN PARTICULAR Y NO INFRACCION.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">9.2.</span> En la maxima medida permitida por la ley aplicable, [Nombre de la Empresa] no sera responsable por danos directos, indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pero no limitado a perdida de beneficios, datos, uso, fondo de comercio u otras perdidas intangibles, que resulten de:
            </p>
            <ul class="list-disc pl-6 space-y-2 mt-2">
              <li>El uso o la imposibilidad de uso de la Plataforma.</li>
              <li>Respuestas incorrectas, inapropiadas o daninas generadas por el Chatbot IA.</li>
              <li>Interrupciones, errores o fallos en el servicio de WhatsApp o de los proveedores de IA.</li>
              <li>Acceso no autorizado a datos del Usuario o modificacion de los mismos.</li>
              <li>Declaraciones o conducta de cualquier tercero en relacion con el Servicio.</li>
              <li>Cualquier otra cuestion relacionada con el Servicio.</li>
            </ul>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">9.3.</span> En caso de que alguna jurisdiccion no permita la exclusion o limitacion de ciertas garantias o responsabilidades, la responsabilidad de [Nombre de la Empresa] se limitara al maximo permitido por la ley aplicable.
            </p>
          </div>
        </section>

        <!-- 10. Terminacion -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            10. Terminacion
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">10.1.</span> El Usuario puede dejar de utilizar la Plataforma en cualquier momento eliminando su cuenta y toda la informacion asociada.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">10.2.</span> [Nombre de la Empresa] se reserva el derecho de suspender o terminar el acceso del Usuario a la Plataforma, en cualquier momento y sin previo aviso, si determina que el Usuario ha incumplido estos Terminos.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">10.3.</span> Tras la terminacion, todas las licencias y derechos otorgados al Usuario bajo estos Terminos cesaran de inmediato, excepto aquellos derivados de la licencia de codigo abierto del software.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">10.4.</span> Las secciones de estos Terminos que por su naturaleza deban sobrevivir a la terminacion, continuaran vigentes, incluyendo pero no limitado a: Propiedad Intelectual, Limitacion de Responsabilidad y Ley Aplicable.
            </p>
          </div>
        </section>

        <!-- 11. Modificaciones -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            11. Modificaciones a los Terminos
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">11.1.</span> [Nombre de la Empresa] se reserva el derecho de modificar estos Terminos en cualquier momento. Las modificaciones entraran en vigor a partir de su publicacion en la Plataforma.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">11.2.</span> Es responsabilidad del Usuario revisar periodicamente estos Terminos. El uso continuado de la Plataforma despues de la publicacion de modificaciones constituye la aceptacion de los Terminos modificados.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">11.3.</span> Para cambios sustanciales, se realizara un esfuerzo razonable por notificar al Usuario a traves de los canales disponibles.
            </p>
          </div>
        </section>

        <!-- 12. Ley Aplicable y Jurisdiccion -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            12. Ley Aplicable y Jurisdiccion
          </h2>
          <div class="mt-4 space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">12.1.</span> Estos Terminos se regiran e interpretaran de conformidad con las leyes de [Pais/Estado], sin dar efecto a sus disposiciones sobre conflicto de leyes.
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">12.2.</span> Cualquier controversia derivada de o relacionada con estos Terminos sera sometida a la jurisdiccion exclusiva de los tribunales competentes de [Ciudad, Pais].
            </p>
            <p>
              <span class="font-semibold text-gray-900 dark:text-white">12.3.</span> Si alguna disposicion de estos Terminos resulta invalida o inaplicable, dicha disposicion sera modificada en la medida minima necesaria para hacerla valida y aplicable, y las demas disposiciones continuaran en pleno vigor y efecto.
            </p>
          </div>
        </section>

        <!-- 13. Contacto -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            13. Contacto
          </h2>
          <div class="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>Para cualquier consulta, comentario o reclamacion relacionada con estos Terminos, el Usuario puede contactarnos a traves de:</p>
            <div class="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-3">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">[Nombre de la Empresa]</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">[Direccion de la Empresa]</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-300">[correo@empresa.com]</p>
              </div>
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p class="text-sm text-gray-600 dark:text-gray-300">[+00 000 000 0000]</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Separator -->
        <div class="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center">
            Al utilizar SellMate, usted confirma que ha leido, comprendido y aceptado estos Terminos y Condiciones en su totalidad.
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <router-link to="/" class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <div class="w-7 h-7 rounded-md bg-primary-600 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span class="text-sm font-semibold">SellMate</span>
          </router-link>
          <p class="text-xs text-gray-400 dark:text-gray-500">Hecho con IA &middot; Licencia MIT</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/theme'

const theme = useThemeStore()
</script>
