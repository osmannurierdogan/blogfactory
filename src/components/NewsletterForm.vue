<script setup lang="ts">
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  beehiivPublicationId: string;
}>();

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const email = ref('');
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle');

async function handleSubmit() {
  if (!email.value || !props.beehiivPublicationId) {
    status.value = 'error';
    return;
  }

  status.value = 'submitting';

  try {
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${props.beehiivPublicationId}/subscriptions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, reactivate_existing: false }),
      },
    );

    if (!response.ok) throw new Error('Subscription failed');

    status.value = 'success';
    window.gtag?.('event', 'sign_up', { method: 'newsletter' });
    window.fbq?.('track', 'Lead');
  } catch {
    status.value = 'error';
  }
}
</script>

<template>
  <form class="flex flex-col gap-3 sm:flex-row" @submit.prevent="handleSubmit">
    <Input
      v-model="email"
      type="email"
      required
      placeholder="you@example.com"
      aria-label="Email address"
      :disabled="status === 'submitting' || status === 'success'"
    />
    <Button type="submit" :disabled="status === 'submitting' || status === 'success'">
      {{ status === 'success' ? 'Subscribed' : 'Subscribe' }}
    </Button>
  </form>
  <p v-if="status === 'error'" class="mt-2 text-sm text-destructive">
    Something went wrong. Please try again.
  </p>
  <p v-if="status === 'success'" class="mt-2 text-sm text-foreground/70">
    Thanks — check your inbox to confirm your subscription.
  </p>
</template>
