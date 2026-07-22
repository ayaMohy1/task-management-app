<template>
  <div class="skeleton-container">
    <div v-for="n in 3" :key="n" class="skeleton-card">
      <div class="skeleton-header">
        <div class="skeleton-title skeleton-shimmer" />
        <div class="skeleton-badge skeleton-shimmer" />
      </div>
      <div class="skeleton-footer">
        <div class="skeleton-time skeleton-shimmer" />
        <div class="skeleton-meta">
          <div class="skeleton-icon skeleton-shimmer" />
          <div class="skeleton-icon skeleton-shimmer" />
        </div>
      </div>
    </div>
  </div>
</template>
