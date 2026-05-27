<script setup lang="ts">
// Contracts View - baseado no mockup Stitch
</script>

<template>
  <div class="space-y-lg">
    <!-- Filter & CTA Card -->
    <section class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-wrap items-center justify-between gap-md shadow-sm">
      <div class="flex flex-wrap items-center gap-md flex-1">
        <!-- Search Input -->
        <div class="relative min-w-[300px] flex-1 max-w-md">
          <span class="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            class="w-full pl-xl pr-md py-sm bg-surface-container-low border-outline-variant border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-body-sm transition-all outline-none"
            placeholder="Buscar contratos..."
            type="text"
          />
        </div>

        <!-- Quick Filters -->
        <div class="flex items-center gap-sm">
          <button class="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">filter_list</span>
            Status
          </button>
          <button class="flex items-center gap-xs px-md py-sm border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors font-label-md text-label-md text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">calendar_today</span>
            Vigência
          </button>
        </div>
      </div>

      <!-- Primary CTA -->
      <button class="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md flex items-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        Novo Contrato
      </button>
    </section>

    <!-- Content Canvas -->
    <section class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div class="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h3 class="font-h3 text-h3 text-on-surface">Contratos</h3>
        <button class="text-primary font-label-sm text-label-sm hover:underline">Exportar</button>
      </div>

      <div class="flex-1 p-0">
        <table class="w-full text-left">
          <thead class="bg-surface-container-low">
            <tr>
              <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Contrato</th>
              <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Cliente</th>
              <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
              <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Vigência</th>
              <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Valor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant">
            <tr class="table-row-hover group">
              <td class="px-lg py-md">
                <div class="flex items-center gap-md">
                  <div class="w-8 h-8 bg-secondary-container text-primary rounded flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <span class="font-body-lg text-body-lg text-on-surface">Contrato SaaS 2024</span>
                </div>
              </td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">Empresa Alpha</td>
              <td class="px-lg py-md">
                <span class="px-sm py-xs bg-green-100 text-green-700 rounded-full font-label-sm text-[11px] uppercase font-bold">Ativo</span>
              </td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">12 meses</td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">R$ 120.000</td>
            </tr>

            <tr class="table-row-hover group">
              <td class="px-lg py-md">
                <div class="flex items-center gap-md">
                  <div class="w-8 h-8 bg-tertiary-fixed text-tertiary rounded flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <span class="font-body-lg text-body-lg text-on-surface">Contrato Consultoria</span>
                </div>
              </td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">Cliente Beta</td>
              <td class="px-lg py-md">
                <span class="px-sm py-xs bg-surface-container-high border border-outline-variant text-outline text-[11px] uppercase font-bold">Pendente</span>
              </td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">6 meses</td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">R$ 45.000</td>
            </tr>

            <tr class="table-row-hover group">
              <td class="px-lg py-md">
                <div class="flex items-center gap-md">
                  <div class="w-8 h-8 bg-primary-fixed text-primary rounded flex items-center justify-center">
                    <span class="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <span class="font-body-lg text-body-lg text-on-surface">Contrato Suporte</span>
                </div>
              </td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">Organização Gamma</td>
              <td class="px-lg py-md">
                <span class="px-sm py-xs bg-green-100 text-green-700 rounded-full font-label-sm text-[11px] uppercase font-bold">Ativo</span>
              </td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">24 meses</td>
              <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">R$ 240.000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
