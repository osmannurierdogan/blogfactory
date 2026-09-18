<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cookie-consent';
const visible = ref(false);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function applyConsent(granted: boolean) {
  window.gtag?.('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });
  window.fbq?.('consent', granted ? 'grant' : 'revoke');
}

function choose(granted: boolean) {
  localStorage.setItem(STORAGE_KEY, granted ? 'granted' : 'denied');
  applyConsent(granted);
  visible.value = false;
}

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'granted' || stored === 'denied') {
      applyConsent(stored === 'granted');
      return;
    }
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to show banner
  }
  visible.value = true;
});
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg"
  >
    <div class="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-foreground/80">
        We use cookies to understand site usage and improve your experience. See our
        <a href="/cookie-policy" class="underline">Cookie Policy</a>.
      </p>
      <div class="flex shrink-0 gap-2">
        <Button variant="outline" size="sm" @click="choose(false)">Decline</Button>
        <Button size="sm" @click="choose(true)">Accept</Button>
      </div>
    </div>
  </div>
</template>
