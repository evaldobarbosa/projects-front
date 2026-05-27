<script setup lang="ts">
// Dashboard View - baseado no mockup dashboard_formassistant_v2
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
            placeholder="Search projects, forms, or users..."
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
            Date Range
          </button>
        </div>
      </div>

      <!-- Primary CTA -->
      <button class="bg-primary text-on-primary px-lg py-md rounded-lg font-label-md text-label-md flex items-center gap-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm">
        <span class="material-symbols-outlined text-[20px]">add</span>
        Novo Projeto
      </button>
    </section>

    <!-- Content Canvas (Bento Grid Style) -->
    <section class="grid grid-cols-12 gap-lg">
      <!-- Main Content Card -->
      <div class="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div class="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h3 class="font-h3 text-h3 text-on-surface">Atividade Recente</h3>
          <button class="text-primary font-label-sm text-label-sm hover:underline">Ver tudo</button>
        </div>

        <div class="flex-1 p-0">
          <table class="w-full text-left">
            <thead class="bg-surface-container-low">
              <tr>
                <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Project Name</th>
                <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Submissions</th>
                <th class="px-lg py-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr class="table-row-hover group">
                <td class="px-lg py-md">
                  <div class="flex items-center gap-md">
                    <div class="w-8 h-8 bg-secondary-container text-primary rounded flex items-center justify-center">
                      <span class="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <span class="font-body-lg text-body-lg text-on-surface">Customer Feedback 2024</span>
                  </div>
                </td>
                <td class="px-lg py-md">
                  <span class="px-sm py-xs bg-green-100 text-green-700 rounded-full font-label-sm text-[11px] uppercase font-bold">Active</span>
                </td>
                <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">1,248</td>
                <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">2 hours ago</td>
              </tr>

              <tr class="table-row-hover group">
                <td class="px-lg py-md">
                  <div class="flex items-center gap-md">
                    <div class="w-8 h-8 bg-tertiary-fixed text-tertiary rounded flex items-center justify-center">
                      <span class="material-symbols-outlined text-[18px]">quiz</span>
                    </div>
                    <span class="font-body-lg text-body-lg text-on-surface">Employee Onboarding</span>
                  </div>
                </td>
                <td class="px-lg py-md">
                  <span class="px-sm py-xs bg-surface-container-high border border-outline-variant text-outline text-[11px] uppercase font-bold">Draft</span>
                </td>
                <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">0</td>
                <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">Yesterday</td>
              </tr>

              <tr class="table-row-hover group">
                <td class="px-lg py-md">
                  <div class="flex items-center gap-md">
                    <div class="w-8 h-8 bg-primary-fixed text-primary rounded flex items-center justify-center">
                      <span class="material-symbols-outlined text-[18px]">analytics</span>
                    </div>
                    <span class="font-body-lg text-body-lg text-on-surface">Market Research Q1</span>
                  </div>
                </td>
                <td class="px-lg py-md">
                  <span class="px-sm py-xs bg-green-100 text-green-700 rounded-full font-label-sm text-[11px] uppercase font-bold">Active</span>
                </td>
                <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">856</td>
                <td class="px-lg py-md font-body-sm text-body-sm text-on-surface-variant">3 days ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Secondary/Insight Cards -->
      <div class="col-span-12 lg:col-span-4 space-y-lg">
        <!-- Stat Card 1 -->
        <div class="bg-primary text-on-primary rounded-xl p-lg shadow-md relative overflow-hidden group">
          <div class="relative z-10">
            <p class="font-label-sm text-label-sm opacity-80 uppercase tracking-wider mb-base">Total Response Rate</p>
            <h4 class="text-[40px] font-bold leading-tight">84.2%</h4>
            <div class="flex items-center gap-xs mt-md text-label-sm">
              <span class="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+12% from last month</span>
            </div>
          </div>
          <div class="absolute -right-8 -bottom-8 opacity-10 transition-transform group-hover:scale-110 duration-500">
            <span class="material-symbols-outlined text-[120px]">leaderboard</span>
          </div>
        </div>

        <!-- Notification/Info Card -->
        <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h4 class="font-label-md text-label-md text-on-surface mb-md flex items-center gap-sm">
            <span class="material-symbols-outlined text-primary text-[20px]">bolt</span>
            Quick Tips
          </h4>
          <div class="space-y-md">
            <div class="flex gap-md">
              <div class="w-1.5 h-1.5 rounded-full bg-primary mt-sm shrink-0"></div>
              <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Did you know? Conditional logic can increase your form completion rate by <span class="font-bold text-on-surface">35%</span>.
              </p>
            </div>
            <div class="flex gap-md">
              <div class="w-1.5 h-1.5 rounded-full bg-primary mt-sm shrink-0"></div>
              <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Share your dashboard with stakeholders using the <span class="font-bold text-on-surface">External Link</span> feature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
