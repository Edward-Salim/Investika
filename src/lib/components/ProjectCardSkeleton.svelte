<script lang="ts">
</script>

<div class="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all animate-pulse">
    <!-- Image Placeholder -->
    <div class="relative aspect-[4/3] w-full bg-slate-100">
        <div class="absolute inset-0 flex items-center justify-center opacity-20">
            <svg class="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        
        <!-- Status Badge Skeleton -->
        <div class="absolute top-4 right-4 h-6 w-24 rounded-full bg-slate-200"></div>
        
        <!-- Sector Icon Skeleton -->
        <div class="absolute top-4 right-32 h-6 w-6 rounded-lg bg-slate-200"></div>
    </div>

    <!-- Content Skeletons -->
    <div class="flex flex-1 flex-col p-5 space-y-4">
        <!-- Title & Subtitle -->
        <div class="space-y-2">
            <div class="h-6 w-3/4 rounded-lg bg-slate-200"></div>
            <div class="h-4 w-1/2 rounded-lg bg-slate-100"></div>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-3 gap-4 pt-2 border-t border-slate-50">
            <div class="space-y-1">
                <div class="h-3 w-10 rounded bg-slate-50"></div>
                <div class="h-4 w-16 rounded bg-slate-200"></div>
            </div>
            <div class="space-y-1">
                <div class="h-3 w-10 rounded bg-slate-50"></div>
                <div class="h-4 w-16 rounded bg-slate-200"></div>
            </div>
            <div class="space-y-1">
                <div class="h-3 w-10 rounded bg-slate-50"></div>
                <div class="h-4 w-16 rounded bg-slate-200"></div>
            </div>
        </div>
    </div>
</div>
